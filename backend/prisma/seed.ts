import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial demo user...');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo.user@reachinbox.ai' },
    update: {},
    create: {
      id: 'demo-user-uuid-12345',
      googleId: 'google-demo-123456789',
      name: 'Demo Architect',
      email: 'demo.user@reachinbox.ai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    },
  });

  console.log(`Seeded demo user: ${demoUser.email} (ID: ${demoUser.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
