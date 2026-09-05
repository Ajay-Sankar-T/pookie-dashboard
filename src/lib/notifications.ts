const KEY_PREFIX = 'pookie_activity_last_seen_';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function loadActivityLastSeen(memberId: string): string | null {
  if (!isClient()) return null;
  try {
    return localStorage.getItem(KEY_PREFIX + memberId);
  } catch {
    return null;
  }
}

export function saveActivityLastSeen(memberId: string, iso: string): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(KEY_PREFIX + memberId, iso);
  } catch {
    // ignore
  }
}
