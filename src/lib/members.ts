import { PookieFriend } from '@/types';

/**
 * The closed roster of the 11 people this app is for. No sign-ups, no
 * "add a pookie" — membership is fixed. Passwords live server-side only,
 * in the login API route, never in this client-importable file.
 */
export interface PookieMember {
  id: string;
  email: string;
  name: string;
  avatarEmoji: string;
  /** Default profile picture filename within /public/waifu/ — fixed, distinct per member. */
  avatarImage: string;
  color: string;
}

export const MEMBERS: PookieMember[] = [
  { id: 'm012', email: 'me25b012@smail.iitm.ac.in', name: 'Lanjay', avatarEmoji: '🎀', avatarImage: 'Alya.png', color: '#FF6FAE' },
  { id: 'm002', email: 'me25b002@smail.iitm.ac.in', name: 'Kudithya', avatarEmoji: '🌸', avatarImage: 'ichika.png', color: '#EC4899' },
  { id: 'm011', email: 'me25b011@smail.iitm.ac.in', name: 'Gooney', avatarEmoji: '🧸', avatarImage: 'mikasa.png', color: '#8B5CF6' },
  { id: 'm016', email: 'me25b016@smail.iitm.ac.in', name: 'Kundirudh', avatarEmoji: '🍓', avatarImage: 'marin.png', color: '#F43F5E' },
  { id: 'm017', email: 'me25b017@smail.iitm.ac.in', name: 'Niggamol', avatarEmoji: '🐰', avatarImage: 'Rem.png', color: '#3B82F6' },
  { id: 'm020', email: 'me25b020@smail.iitm.ac.in', name: 'Ara vindhu', avatarEmoji: '🦋', avatarImage: 'yor.png', color: '#10B981' },
  { id: 'm022', email: 'me25b022@smail.iitm.ac.in', name: 'Kunjuna', avatarEmoji: '🍩', avatarImage: 'miku.png', color: '#F59E0B' },
  { id: 'm023', email: 'me25b023@smail.iitm.ac.in', name: 'Kunju Kumaran', avatarEmoji: '🥑', avatarImage: 'ruby.png', color: '#14B8A6' },
  { id: 'm034', email: 'me25b034@smail.iitm.ac.in', name: 'Kojja swaroop', avatarEmoji: '🐻', avatarImage: 'umi.png', color: '#F97316' },
  { id: 'm039', email: 'me25b039@smail.iitm.ac.in', name: 'Chutvik', avatarEmoji: '🐱', avatarImage: 'yotsuba.png', color: '#6366F1' },
  { id: 'm093', email: 'me25b093@smail.iitm.ac.in', name: 'RGITH', avatarEmoji: '🧋', avatarImage: 'frieren.png', color: '#DB2777' },
];

export function findMemberByEmail(email: string): PookieMember | undefined {
  const normalized = email.trim().toLowerCase();
  return MEMBERS.find((m) => m.email.toLowerCase() === normalized);
}

export function findMemberById(id: string): PookieMember | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export function memberToFriend(member: PookieMember): PookieFriend {
  return {
    id: member.id,
    name: member.name,
    avatarEmoji: member.avatarEmoji,
    avatarImage: member.avatarImage,
    color: member.color,
    createdAt: '2026-09-01T00:00:00Z',
  };
}
