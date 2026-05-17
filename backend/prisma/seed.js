const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  
  console.log('Creating default user...');
  const user = await prisma.user.create({
    data: {
      email: 'default@example.com',
      passwordHash,
    },
  });

  if (fs.existsSync('bks.json')) {
    const oldBookmarks = JSON.parse(fs.readFileSync('bks.json'));
    console.log(`Restoring ${oldBookmarks.length} bookmarks...`);
    
    for (const b of oldBookmarks) {
      try {
         await prisma.bookmark.create({
           data: {
             title: b.title,
             url: b.url,
             createdAt: new Date(b.created_at),
             userId: user.id
           }
         });
      } catch (e) {
         console.error('Failed to insert duplicate or invalid:', b.url);
      }
    }
  }

  console.log('✅ Restoration complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
