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

// UPI ID is optional — this tracks whether someone has been through the
// onboarding UPI step at all (entered one OR explicitly skipped it), so we
// don't keep re-prompting just because they chose not to add one.
const ONBOARDED_KEY_PREFIX = 'pookie_onboarded_v1_';

export function hasSeenUpiStep(memberId: string): boolean {
  if (!isClient()) return false;
  try {
    return localStorage.getItem(ONBOARDED_KEY_PREFIX + memberId) === 'true';
  } catch {
    return false;
  }
}

export function markUpiStepSeen(memberId: string): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(ONBOARDED_KEY_PREFIX + memberId, 'true');
  } catch (err) {
    console.error('Failed to mark onboarding seen:', err);
  }
}
