import { prisma } from '@/lib/db';
import { MEMBERS } from '@/lib/members';
import { INITIAL_CIRCLES } from '@/lib/sample-data';
import { MENU } from '@/lib/menu';

// Idempotent, race-safe seeding (skipDuplicates so two concurrent cold-start
// requests seeding at once don't crash each other with a unique violation).

export async function ensureUsersSeeded(): Promise<void> {
  await prisma.user.createMany({
    data: MEMBERS.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      avatarEmoji: m.avatarEmoji,
      avatarImage: m.avatarImage,
      color: m.color,
    })),
    skipDuplicates: true,
  });
}

export async function ensureCirclesSeeded(): Promise<void> {
  await ensureUsersSeeded();
  for (const c of INITIAL_CIRCLES) {
    await prisma.circle.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        description: c.description || null,
        members: {
          createMany: {
            data: c.memberIds.map((userId) => ({ userId })),
            skipDuplicates: true,
          },
        },
      },
    });
  }
}

export async function ensureMenuSeeded(): Promise<void> {
  await prisma.menuItem.createMany({
    data: MENU.map((m) => ({
      id: m.id,
      name: m.name,
      priceRupees: m.priceRupees,
      category: m.category,
      section: m.section,
    })),
    skipDuplicates: true,
  });
}
