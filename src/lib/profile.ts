export interface PookieProfile {
  upiId: string;
  createdAt: string;
}

const PROFILE_KEY_PREFIX = 'pookie_profile_v2_';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function loadProfile(memberId: string): PookieProfile | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY_PREFIX + memberId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.upiId) return null;
    return parsed as PookieProfile;
  } catch (err) {
    console.error('Failed to load pookie profile:', err);
    return null;
  }
}

export function saveProfile(memberId: string, upiId: string): PookieProfile {
  const profile: PookieProfile = {
    upiId: upiId.trim(),
    createdAt: new Date().toISOString(),
  };
  if (isClient()) {
    try {
      localStorage.setItem(PROFILE_KEY_PREFIX + memberId, JSON.stringify(profile));
    } catch (err) {
      console.error('Failed to save pookie profile:', err);
    }
  }
  return profile;
}

export function clearProfile(memberId: string): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(PROFILE_KEY_PREFIX + memberId);
  } catch (err) {
    console.error('Failed to clear pookie profile:', err);
  }
}
