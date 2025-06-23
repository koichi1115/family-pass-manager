import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

export const seedAdminUser = async () => {
  console.log('Seeding admin user...');

  // 開発用の管理者ユーザー
  const adminUser = {
    id: 'admin-user-dev',
    name: 'admin',
    role: 'admin' as const,
    displayName: 'システム管理者',
    email: 'admin@family-pass-manager.local',
    // 開発用の仮の証明書ハッシュ（実際の開発時には適切な証明書を使用）
    certHash: createHash('sha256').update('dev-admin-cert').digest('hex'),
    preferences: {
      ui: {
        theme: 'light',
        language: 'ja',
        timezone: 'Asia/Tokyo',
        itemsPerPage: 20,
        defaultView: 'list',
      },
      notifications: {
        passwordExpiry: true,
        newEntries: true,
        securityAlerts: true,
        emailNotifications: false,
      },
      security: {
        autoLogoutMinutes: 30,
        requireReasonForChanges: true,
        maskPasswordsInList: true,
      },
      misc: {
        favoriteCategories: ['cat-banking', 'cat-ecommerce'],
        quickAccessPasswords: [],
      },
    },
  };

  await prisma.familyMember.upsert({
    where: { id: adminUser.id },
    update: {
      displayName: adminUser.displayName,
      email: adminUser.email,
      preferences: adminUser.preferences,
    },
    create: adminUser,
  });

  console.log('Seeded admin user');
};

export const seedFamilyMembers = async () => {
  console.log('Seeding family members...');

  const familyMembers = [
    {
      id: 'family-father',
      name: 'father',
      role: 'father' as const,
      displayName: 'お父さん',
      email: 'father@family.example.com',
      // 開発用の仮の証明書ハッシュ
      certHash: createHash('sha256').update('dev-father-cert').digest('hex'),
      preferences: {
        ui: {
          theme: 'light',
          language: 'ja',
          timezone: 'Asia/Tokyo',
          itemsPerPage: 20,
          defaultView: 'card',
        },
        notifications: {
          passwordExpiry: true,
          newEntries: false,
          securityAlerts: true,
          emailNotifications: true,
        },
        security: {
          autoLogoutMinutes: 15,
          requireReasonForChanges: false,
          maskPasswordsInList: true,
        },
        misc: {
          favoriteCategories: ['cat-banking', 'cat-work', 'cat-utility'],
          quickAccessPasswords: [],
        },
      },
    },
    {
      id: 'family-mother',
      name: 'mother',
      role: 'mother' as const,
      displayName: 'お母さん',
      email: 'mother@family.example.com',
      certHash: createHash('sha256').update('dev-mother-cert').digest('hex'),
      preferences: {
        ui: {
          theme: 'light',
          language: 'ja',
          timezone: 'Asia/Tokyo',
          itemsPerPage: 15,
          defaultView: 'list',
        },
        notifications: {
          passwordExpiry: true,
          newEntries: true,
          securityAlerts: true,
          emailNotifications: true,
        },
        security: {
          autoLogoutMinutes: 20,
          requireReasonForChanges: true,
          maskPasswordsInList: true,
        },
        misc: {
          favoriteCategories: ['cat-ecommerce', 'cat-healthcare', 'cat-utility'],
          quickAccessPasswords: [],
        },
      },
    },
    {
      id: 'family-son',
      name: 'son',
      role: 'son' as const,
      displayName: '息子',
      email: 'son@family.example.com',
      certHash: createHash('sha256').update('dev-son-cert').digest('hex'),
      preferences: {
        ui: {
          theme: 'dark',
          language: 'ja',
          timezone: 'Asia/Tokyo',
          itemsPerPage: 25,
          defaultView: 'grid',
        },
        notifications: {
          passwordExpiry: false,
          newEntries: false,
          securityAlerts: true,
          emailNotifications: false,
        },
        security: {
          autoLogoutMinutes: 10,
          requireReasonForChanges: false,
          maskPasswordsInList: false,
        },
        misc: {
          favoriteCategories: ['cat-entertainment', 'cat-social', 'cat-education'],
          quickAccessPasswords: [],
        },
      },
    },
    {
      id: 'family-daughter',
      name: 'daughter',
      role: 'daughter' as const,
      displayName: '娘',
      email: 'daughter@family.example.com',
      certHash: createHash('sha256').update('dev-daughter-cert').digest('hex'),
      preferences: {
        ui: {
          theme: 'auto',
          language: 'ja',
          timezone: 'Asia/Tokyo',
          itemsPerPage: 20,
          defaultView: 'card',
        },
        notifications: {
          passwordExpiry: true,
          newEntries: false,
          securityAlerts: true,
          emailNotifications: false,
        },
        security: {
          autoLogoutMinutes: 15,
          requireReasonForChanges: false,
          maskPasswordsInList: true,
        },
        misc: {
          favoriteCategories: ['cat-social', 'cat-entertainment', 'cat-education'],
          quickAccessPasswords: [],
        },
      },
    },
  ];

  for (const member of familyMembers) {
    await prisma.familyMember.upsert({
      where: { id: member.id },
      update: {
        displayName: member.displayName,
        email: member.email,
        preferences: member.preferences,
      },
      create: member,
    });
  }

  console.log(`Seeded ${familyMembers.length} family members`);
};