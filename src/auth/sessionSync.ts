export type LogoutReason = 'manual' | 'inactivity' | 'session-invalidated';

type SessionActivityPayload = {
  at: number;
  nonce: string;
  tabId: string;
};

type SessionLogoutPayload = {
  at: number;
  nonce: string;
  reason: LogoutReason;
  tabId: string;
};

type SessionStorageEvent =
  | { type: 'activity'; payload: SessionActivityPayload }
  | { type: 'logout'; payload: SessionLogoutPayload };

const SESSION_ACTIVITY_KEY = 'auth:session:last-activity';
const SESSION_LOGOUT_KEY = 'auth:session:logout';

const isBrowser = () => typeof window !== 'undefined';

const createNonce = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;

const readPayload = <T>(key: string): T | null => {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
};

const writePayload = (key: string, payload: object) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(payload));
};

export const createSessionTabId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return createNonce();
};

export const getStoredSessionActivityAt = () => {
  const payload = readPayload<SessionActivityPayload>(SESSION_ACTIVITY_KEY);
  return typeof payload?.at === 'number' ? payload.at : null;
};

export const broadcastSessionActivity = (tabId: string, at = Date.now()) => {
  writePayload(SESSION_ACTIVITY_KEY, { at, nonce: createNonce(), tabId });
};

export const broadcastSessionLogout = (tabId: string, reason: LogoutReason, at = Date.now()) => {
  writePayload(SESSION_LOGOUT_KEY, { at, nonce: createNonce(), reason, tabId });
};

export const readSessionStorageEvent = (event: StorageEvent): SessionStorageEvent | null => {
  if (!event.key || !event.newValue) {
    return null;
  }

  try {
    const payload = JSON.parse(event.newValue) as SessionActivityPayload | SessionLogoutPayload;

    if (event.key === SESSION_ACTIVITY_KEY) {
      return { type: 'activity', payload: payload as SessionActivityPayload };
    }

    if (event.key === SESSION_LOGOUT_KEY) {
      return { type: 'logout', payload: payload as SessionLogoutPayload };
    }
  } catch {
    return null;
  }

  return null;
};
