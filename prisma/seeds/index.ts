import { PrismaClient } from '@prisma/client';
import { seedCategories } from './categories';
import { seedAdminUser, seedFamilyMembers } from './admin-user';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // カテゴリのシード
    await seedCategories();

    // 管理者ユーザーのシード
    await seedAdminUser();

    // 家族メンバーのシード
    await seedFamilyMembers();

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });