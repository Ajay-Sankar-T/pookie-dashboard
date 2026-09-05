export interface PookieSession {
  memberId: string;
  token: string;
  loggedInAt: string;
}

const SESSION_KEY = 'pookie_session_v2';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function loadSession(): PookieSession | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.memberId || !parsed?.token) return null;
    return parsed as PookieSession;
  } catch (err) {
    console.error('Failed to load pookie session:', err);
    return null;
  }
}

export function saveSession(memberId: string, token: string): PookieSession {
  const session: PookieSession = { memberId, token, loggedInAt: new Date().toISOString() };
  if (isClient()) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (err) {
      console.error('Failed to save pookie session:', err);
    }
  }
  return session;
}

export function clearSession(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear pookie session:', err);
  }
}
