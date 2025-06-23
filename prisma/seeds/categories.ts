import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seedCategories = async () => {
  console.log('Seeding categories...');

  const categories = [
    {
      id: 'cat-banking',
      name: 'banking',
      displayName: '銀行・金融',
      description: '銀行、信用金庫、証券会社などの金融機関',
      color: '#1976d2',
      icon: 'AccountBalance',
      isSystem: true,
      sortOrder: 1,
    },
    {
      id: 'cat-ecommerce',
      name: 'ecommerce',
      displayName: 'ECサイト',
      description: 'オンラインショッピング、通販サイト',
      color: '#f57c00',
      icon: 'ShoppingCart',
      isSystem: true,
      sortOrder: 2,
    },
    {
      id: 'cat-social',
      name: 'social',
      displayName: 'SNS',
      description: 'ソーシャルネットワーキングサービス',
      color: '#388e3c',
      icon: 'Share',
      isSystem: true,
      sortOrder: 3,
    },
    {
      id: 'cat-utility',
      name: 'utility',
      displayName: '公共料金',
      description: '電気、ガス、水道、電話などの公共料金',
      color: '#7b1fa2',
      icon: 'ElectricBolt',
      isSystem: true,
      sortOrder: 4,
    },
    {
      id: 'cat-entertainment',
      name: 'entertainment',
      displayName: 'エンタメ',
      description: '動画配信、音楽配信、ゲームなど',
      color: '#e91e63',
      icon: 'Movie',
      isSystem: true,
      sortOrder: 5,
    },
    {
      id: 'cat-work',
      name: 'work',
      displayName: '業務関連',
      description: '仕事で使用するシステム、ツール',
      color: '#5d4037',
      icon: 'Work',
      isSystem: true,
      sortOrder: 6,
    },
    {
      id: 'cat-communication',
      name: 'communication',
      displayName: '通信・連絡',
      description: 'メール、チャット、通信サービス',
      color: '#00796b',
      icon: 'Email',
      isSystem: true,
      sortOrder: 7,
    },
    {
      id: 'cat-healthcare',
      name: 'healthcare',
      displayName: '医療・健康',
      description: '病院、薬局、健康管理サービス',
      color: '#c62828',
      icon: 'LocalHospital',
      isSystem: true,
      sortOrder: 8,
    },
    {
      id: 'cat-education',
      name: 'education',
      displayName: '教育・学習',
      description: '学校、オンライン学習、資格取得',
      color: '#303f9f',
      icon: 'School',
      isSystem: true,
      sortOrder: 9,
    },
    {
      id: 'cat-travel',
      name: 'travel',
      displayName: '旅行・交通',
      description: '航空会社、ホテル、交通機関',
      color: '#689f38',
      icon: 'Flight',
      isSystem: true,
      sortOrder: 10,
    },
    {
      id: 'cat-insurance',
      name: 'insurance',
      displayName: '保険',
      description: '生命保険、自動車保険、火災保険など',
      color: '#455a64',
      icon: 'Security',
      isSystem: true,
      sortOrder: 11,
    },
    {
      id: 'cat-government',
      name: 'government',
      displayName: '行政・公的機関',
      description: '役所、税務署、年金機構など',
      color: '#8d6e63',
      icon: 'AccountBalance',
      isSystem: true,
      sortOrder: 12,
    },
    {
      id: 'cat-other',
      name: 'other',
      displayName: 'その他',
      description: 'その他のサービス',
      color: '#616161',
      icon: 'Category',
      isSystem: true,
      sortOrder: 99,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        displayName: category.displayName,
        description: category.description,
        color: category.color,
        icon: category.icon,
        sortOrder: category.sortOrder,
      },
      create: category,
    });
  }

  console.log(`Seeded ${categories.length} categories`);
};