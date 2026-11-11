import { beforeEach, describe, expect, it } from 'vitest';
import {
  broadcastSessionActivity,
  broadcastSessionLogout,
  createSessionTabId,
  getStoredSessionActivityAt,
  readSessionStorageEvent
} from './sessionSync';

type MockStorage = {
  clear: () => void;
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, value: string) => void;
};

const createLocalStorageMock = (): MockStorage => {
  const storage = new Map<string, string>();

  return {
    clear: () => {
      storage.clear();
    },
    getItem: (key: string) => storage.get(key) ?? null,
    removeItem: (key: string) => {
      storage.delete(key);
    },
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    }
  };
};

const createStorageEvent = (key: string, payload: object) =>
  ({
    key,
    newValue: JSON.stringify(payload)
  }) as StorageEvent;

describe('sessionSync', () => {
  beforeEach(() => {
    const localStorage = createLocalStorageMock();
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { localStorage }
    });
    localStorage.clear();
  });

  it('stores the latest shared activity timestamp', () => {
    broadcastSessionActivity('tab-1', 12345);

    expect(getStoredSessionActivityAt()).toBe(12345);
  });

  it('parses shared activity events from storage', () => {
    const payload = { at: 222, nonce: 'nonce-1', tabId: 'tab-2' };
    const event = createStorageEvent('auth:session:last-activity', payload);

    expect(readSessionStorageEvent(event)).toEqual({
      type: 'activity',
      payload
    });
  });

  it('parses shared logout events from storage', () => {
    const payload = {
      at: 333,
      nonce: 'nonce-2',
      reason: 'session-invalidated' as const,
      tabId: 'tab-3'
    };
    const event = createStorageEvent('auth:session:logout', payload);

    expect(readSessionStorageEvent(event)).toEqual({
      type: 'logout',
      payload
    });
  });

  it('writes a logout payload to local storage', () => {
    broadcastSessionLogout('tab-4', 'inactivity', 444);

    const storedValue = window.localStorage.getItem('auth:session:logout');
    expect(storedValue).not.toBeNull();
    expect(JSON.parse(storedValue || '{}')).toMatchObject({
      at: 444,
      reason: 'inactivity',
      tabId: 'tab-4'
    });
  });

  it('creates non-empty tab identifiers', () => {
    expect(createSessionTabId()).toBeTruthy();
  });
});
