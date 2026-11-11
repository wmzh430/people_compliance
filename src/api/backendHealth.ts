type BackendHealthStatus = 'healthy' | 'unhealthy';

type BackendHealthSnapshot = {
  status: BackendHealthStatus;
  lastChangedAt: number;
};

type BackendHealthListener = (snapshot: BackendHealthSnapshot) => void;

const listeners = new Set<BackendHealthListener>();

const getNow = () => Date.now();

let snapshot: BackendHealthSnapshot = {
  status: 'healthy',
  lastChangedAt: getNow()
};

const emit = () => {
  for (const listener of listeners) {
    listener(snapshot);
  }
};

const setBackendHealth = (status: BackendHealthStatus) => {
  if (snapshot.status === status) {
    return;
  }

  snapshot = {
    status,
    lastChangedAt: getNow()
  };
  emit();
};

const markBackendHealthy = () => setBackendHealth('healthy');

const markBackendUnhealthy = () => setBackendHealth('unhealthy');

const getBackendHealth = () => snapshot;

const subscribeBackendHealth = (listener: BackendHealthListener) => {
  listeners.add(listener);
  listener(snapshot);

  return () => {
    listeners.delete(listener);
  };
};

const isBackendAvailabilityError = (error: any) => {
  const status = error?.response?.status;
  if (typeof status === 'number') {
    return status >= 500;
  }

  return error?.code === 'ERR_NETWORK' || error?.message === 'Network Error';
};

export {
  getBackendHealth,
  isBackendAvailabilityError,
  markBackendHealthy,
  markBackendUnhealthy,
  subscribeBackendHealth
};
export type { BackendHealthSnapshot, BackendHealthStatus };
