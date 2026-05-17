const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching old bookmarks...');
  // Use raw SQL because Prisma Client expects relation fields which are currently broken
  const oldBookmarks = await prisma.$queryRawUnsafe('SELECT id, title, url, created_at FROM bookmarks');
  fs.writeFileSync('bks.json', JSON.stringify(oldBookmarks));
  console.log('Saved', oldBookmarks.length, 'bookmarks to bks.json. Ready to wipe DB.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
