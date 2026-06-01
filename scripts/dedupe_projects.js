const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Scanning for duplicate projects by (userId, lower(name))...');

  // Fetch projects grouped by userId and lowercased name
  const projects = await prisma.project.findMany({
    select: { id: true, userId: true, name: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const map = new Map();

  for (const p of projects) {
    const key = `${p.userId}||${p.name.trim().toLowerCase()}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  }

  let changes = 0;

  for (const [key, list] of map.entries()) {
    if (list.length <= 1) continue;
    // Keep first, rename rest
    for (let i = 1; i < list.length; i++) {
      const p = list[i];
      const baseName = list[0].name.trim();
      const newName = `${baseName} (duplicate ${i})`;
      console.log(`Renaming project ${p.id} for user ${p.userId} -> "${newName}"`);
      await prisma.project.update({ where: { id: p.id }, data: { name: newName } });
      changes++;
    }
  }

  console.log(`Done. Renamed ${changes} duplicate projects.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
