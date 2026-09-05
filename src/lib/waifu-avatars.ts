// Filenames living in /public/waifu/. Everyone's profile picture MUST come
// from this fixed set — no uploads, no custom emoji avatars. Each member
// starts with a distinct default (see members.ts) and can re-pick from here.
export const WAIFU_AVATARS: string[] = [
  'Alya.png',
  'frieren.png',
  'ichika.png',
  'itsuki.png',
  'marin.png',
  'mikasa.png',
  'miku.png',
  'Nino.png',
  'Rem.png',
  'Reze.png',
  'ruby.png',
  'umi.png',
  'yor.png',
  'yotsuba.png',
  'Yuta Okkotsu.png',
  'Gakuganji.jpeg',
  'Sasha.png',
];

export function waifuAvatarPath(filename: string): string {
  return `/waifu/${encodeURIComponent(filename)}`;
}

export function waifuDisplayName(filename: string): string {
  return filename.replace(/\.[a-zA-Z0-9]+$/, '');
}
