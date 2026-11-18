type StorageType = 'local' | 'session';

function getStorage(type: StorageType): Storage {
  return type === 'local' ? window.localStorage : window.sessionStorage;
}

export function readStorage(type: StorageType, key: string): unknown {
  try {
    const text = getStorage(type).getItem(key);
    if (text === null) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function writeStorage(type: StorageType, key: string, value: unknown) {
  try {
    getStorage(type).setItem(key, JSON.stringify(value));
  } catch {
  }
}

export function removeFromStorage(type: StorageType, key: string) {
  try {
    getStorage(type).removeItem(key);
  } catch {
  }
}
