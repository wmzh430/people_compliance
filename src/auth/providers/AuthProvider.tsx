import React, {
  useState,
  createContext,
  useEffect,
  useRef,
  useCallback,
  type PropsWithChildren
} from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  login as loginService,
  getCurrentUser,
  logout as logoutService
} from '@/services/Auth/authService';
import { AuthModel, UserModel } from '@/auth';
import {
  broadcastSessionActivity,
  broadcastSessionLogout,
  createSessionTabId,
  getStoredSessionActivityAt,
  type LogoutReason,
  readSessionStorageEvent
} from '@/auth/sessionSync';
import { Role } from '@/utils';
import { ModalInactivityWarning } from '@/partials/modals/inactivity-warning';

const parseDurationMs = (
  value: string | undefined,
  fallbackMs: number,
  minimumMs: number
): number => {
  const parsedMinutes = Number(value);
  if (!Number.isFinite(parsedMinutes) || parsedMinutes <= 0) {
    return fallbackMs;
  }

  return Math.max(minimumMs, parsedMinutes * 60 * 1000);
};

const parseBooleanEnv = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on', 'enabled'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off', 'disabled'].includes(normalized)) {
    return false;
  }

  return fallback;
};

// Frontend inactivity logout is a UX/security policy and is intentionally separate from the
// backend JWT access-token lifetime. The backend remains authoritative for auth validity;
// this timer only decides when an otherwise valid browser session should be considered idle.
//
// Recommended relation:
// - backend access token lifetime <= frontend inactivity timeout
// - frontend inactivity timeout < backend refresh token lifetime
//
// That separation lets active users exercise token refresh while still logging out idle users.
const INACTIVITY_LOGOUT_ENABLED = parseBooleanEnv(
  import.meta.env.VITE_AUTH_INACTIVITY_LOGOUT_ENABLED,
  false
);
const INACTIVITY_TIMEOUT_MS = parseDurationMs(
  import.meta.env.VITE_AUTH_INACTIVITY_TIMEOUT_MINUTES,
  20 * 60 * 1000,
  60 * 1000
);
const WARNING_DURATION_MS = parseDurationMs(
  import.meta.env.VITE_AUTH_WARNING_DURATION_MINUTES,
  60 * 1000,
  15 * 1000
);
const WARNING_DEADLINE_MS = INACTIVITY_TIMEOUT_MS + WARNING_DURATION_MS;
const LOGIN_PATH = '/auth/login';

console.info('[AuthProvider] auth timing config', {
  inactivityLogoutEnabled: INACTIVITY_LOGOUT_ENABLED,
  inactivityTimeoutMinutes: INACTIVITY_TIMEOUT_MS / 60_000,
  warningDurationMinutes: WARNING_DURATION_MS / 60_000
});

interface AuthContextProps {
  auth: AuthModel | undefined;
  currentUser: UserModel | undefined;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: Role) => boolean;
  isLoading: boolean;
  register?: (email: string, password: string, confirmPassword: string) => Promise<void>;
  requestPasswordResetLink?: any;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [auth, setAuth] = useState<AuthModel | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>(undefined);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningVisibleRef = useRef(false);
  const lastActivityAtRef = useRef<number>(Date.now());
  const sessionTabIdRef = useRef(createSessionTabId());

  // Public auth routes should not trigger session verification redirects.
  const isPublicAuthRoute = (() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const path = window.location.pathname;
    const publicAuthPaths = [
      '/auth/login',
      '/auth/signup',
      '/auth/2fa',
      '/auth/check-email',
      '/auth/reset-password',
      '/auth/classic/login',
      '/auth/classic/signup',
      '/auth/classic/2fa',
      '/auth/classic/check-email',
      '/auth/classic/reset-password'
    ];

    return publicAuthPaths.some(
      (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
    );
  })();

  const clearTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const dismissInactivityWarning = useCallback(() => {
    setShowInactivityWarning(false);
    warningVisibleRef.current = false;
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const clearClientSession = useCallback(() => {
    clearTimers();
    dismissInactivityWarning();
    setAuth(undefined);
    setCurrentUser(undefined);
    localStorage.removeItem('currentUser');
  }, [clearTimers, dismissInactivityWarning]);

  const redirectToLogin = useCallback(() => {
    if (typeof window === 'undefined' || window.location.pathname === LOGIN_PATH) {
      return;
    }

    window.location.href = LOGIN_PATH;
  }, []);

  const { isLoading: isVerifying } = useQuery('currentUser', getCurrentUser, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !isPublicAuthRoute, // Don't run on public auth pages
    onSuccess: (data) => {
      if (data?.user) {
        //console.debug('[AuthProvider] getCurrentUser response roles:', data.user.roles);
        const user: UserModel = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          fullname: `${data.user.first_name} ${data.user.last_name}`,
          roles: data.user?.roles,
          department: data?.user?.department,
          is_superuser: data?.user?.is_superuser
        };
        setCurrentUser(user);
        localStorage.removeItem('auth');
        localStorage.setItem('currentUser', JSON.stringify(user));
        setAuth({ access: '', refresh: '' });
      }
    },
    onError: () => {
      setAuth(undefined);
      setCurrentUser(undefined);
    }
  });

  const performLogout = useCallback(
    async (
      reason: LogoutReason,
      options?: {
        broadcast?: boolean;
        remote?: boolean;
      }
    ) => {
      const { broadcast = !options?.remote, remote = false } = options ?? {};

      clearClientSession();

      if (!remote) {
        try {
          await logoutService({ reason });
        } catch (error) {
          console.error('Logout failed:', error);
        }
      }

      if (broadcast) {
        broadcastSessionLogout(sessionTabIdRef.current, reason);
      }

      redirectToLogin();
    },
    [clearClientSession, redirectToLogin]
  );

  const showInactivityWarningWithCountdown = useCallback(
    (remainingWarningMs: number) => {
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }

      setShowInactivityWarning(true);
      warningVisibleRef.current = true;

      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }

      warningTimerRef.current = setTimeout(
        () => {
          void performLogout('inactivity');
        },
        Math.max(0, remainingWarningMs)
      );
    },
    [performLogout]
  );

  const syncInactivityState = useCallback(
    (activityAt: number) => {
      lastActivityAtRef.current = activityAt;
      clearTimers();
      dismissInactivityWarning();

      const idleMs = Date.now() - activityAt;
      if (idleMs >= WARNING_DEADLINE_MS) {
        if (typeof document !== 'undefined' && document.hidden) {
          return;
        }

        void performLogout('inactivity');
        return;
      }

      if (idleMs >= INACTIVITY_TIMEOUT_MS) {
        showInactivityWarningWithCountdown(WARNING_DURATION_MS - (idleMs - INACTIVITY_TIMEOUT_MS));
        return;
      }

      inactivityTimerRef.current = setTimeout(() => {
        syncInactivityState(activityAt);
      }, INACTIVITY_TIMEOUT_MS - idleMs);
    },
    [clearTimers, dismissInactivityWarning, performLogout, showInactivityWarningWithCountdown]
  );

  const announceActivity = useCallback(
    (activityAt = Date.now()) => {
      broadcastSessionActivity(sessionTabIdRef.current, activityAt);
      syncInactivityState(activityAt);
    },
    [syncInactivityState]
  );

  const logout = useCallback(() => {
    void performLogout('manual');
  }, [performLogout]);

  useEffect(() => {
    if (!currentUser || isPublicAuthRoute) {
      clearTimers();
      dismissInactivityWarning();
      return;
    }

    if (!INACTIVITY_LOGOUT_ENABLED) {
      clearTimers();
      dismissInactivityWarning();
      return;
    }

    // These events are the current definition of user activity for session-idle purposes.
    // If the app appears to log out an "active" user, check whether their workflow emits
    // one of these events. Pure background polling does not reset the inactivity timer.
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      announceActivity();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimers();
        dismissInactivityWarning();
        return;
      }

      syncInactivityState(lastActivityAtRef.current);
    };

    const handleStorage = (event: StorageEvent) => {
      const sessionEvent = readSessionStorageEvent(event);
      if (!sessionEvent || sessionEvent.payload.tabId === sessionTabIdRef.current) {
        return;
      }

      if (sessionEvent.type === 'activity') {
        syncInactivityState(sessionEvent.payload.at);
        return;
      }

      void performLogout(sessionEvent.payload.reason, {
        broadcast: false,
        remote: true
      });
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorage);

    const storedActivityAt = getStoredSessionActivityAt();
    const initialActivityAt = storedActivityAt ?? Date.now();
    if (storedActivityAt === null) {
      broadcastSessionActivity(sessionTabIdRef.current, initialActivityAt);
    }
    syncInactivityState(initialActivityAt);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorage);
      clearTimers();
    };
  }, [
    announceActivity,
    clearTimers,
    currentUser,
    dismissInactivityWarning,
    isPublicAuthRoute,
    performLogout,
    syncInactivityState
  ]);

  const loginMutation = useMutation(
    async (credentials: { email: string; password: string }) => {
      return await loginService(credentials.email, credentials.password);
    },
    {
      onSuccess: (data) => {
        setAuth({ access: '', refresh: '' });

        //console.debug('[AuthProvider] login response roles:', data.user?.roles);
        const user: UserModel = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          fullname: `${data.user.first_name} ${data.user.last_name}`,
          roles: data.user?.roles,
          department: data?.user?.department,
          is_superuser: data?.user?.is_superuser
        };
        setCurrentUser(user);
        localStorage.removeItem('auth');
        localStorage.setItem('currentUser', JSON.stringify(user));
      },
      onError: (error) => {
        console.error('Login failed:', error);
      }
    }
  );

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (error) {
      console.error('Login failed in async login:', error);
      throw error;
    }
  };

  const normalizeRoleName = (value: unknown): string | null => {
    if (typeof value !== 'string') {
      return null;
    }

    return value.trim().toLowerCase();
  };

  const hasRole = (role: string): boolean => {
    const targetRole = normalizeRoleName(role);
    if (!targetRole) {
      return false;
    }

    if (targetRole === 'admin' && currentUser?.is_superuser) {
      return true;
    }

    if (!currentUser?.roles) {
      return false;
    }

    return currentUser.roles.some((r: any) => {
      if (typeof r === 'string') {
        return normalizeRoleName(r) === targetRole;
      }
      if (r && typeof r.name === 'string') {
        return normalizeRoleName(r.name) === targetRole;
      }
      return false;
    });
  };

  return (
    <AuthContext.Provider
      value={{ auth, currentUser, login, logout, hasRole, isLoading: isVerifying }}
    >
      {children}

      <ModalInactivityWarning
        open={showInactivityWarning}
        onLogout={() => {
          clearTimers();
          logout();
        }}
        onStayLoggedIn={() => {
          announceActivity();
        }}
      />
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
