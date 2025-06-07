import { db } from '../src/db/index';
import { 
  comicUniverseConfigs,
  comicUniverseCategories,
  comicUniverseCollections,
  comicUniverseArtworks
} from '../src/modules/showmasterpiece/db/schema/masterpieces';
import 'dotenv/config';

async function createTestData() {
  try {
    console.log('开始创建测试数据...');

    // 1. 创建配置
    console.log('创建配置...');
    const config = await db.insert(comicUniverseConfigs).values({
      siteName: '艺术画集展览馆',
      siteDescription: '精选世界各地艺术大师的经典作品，每一页都是一次艺术的沉浸体验',
      heroTitle: '艺术画集展览馆',
      heroSubtitle: '精选世界各地艺术大师的经典作品，每一页都是一次艺术的沉浸体验',
      maxCollectionsPerPage: 9,
      enableSearch: true,
      enableCategories: true,
      defaultCategory: 'all',
      theme: 'light',
      language: 'zh'
    }).returning();

    console.log('配置创建成功:', config[0]);

    // 2. 创建分类
    console.log('创建分类...');
    const categories = await db.insert(comicUniverseCategories).values([
      {
        name: '古典艺术',
        description: '古典主义风格的艺术作品',
        displayOrder: 1,
        isActive: true
      },
      {
        name: '现代艺术',
        description: '现代主义风格的艺术作品',
        displayOrder: 2,
        isActive: true
      },
      {
        name: '风景画',
        description: '自然风景主题的画作',
        displayOrder: 3,
        isActive: true
      }
    ]).returning();

    console.log('分类创建成功:', categories);

    // 3. 创建画集
    console.log('创建画集...');
    const collections = await db.insert(comicUniverseCollections).values([
      {
        title: '莫奈印象派作品集',
        artist: '克劳德·莫奈',
        coverImage: 'https://images.unsplash.com/photo-1594736797933-d0401ba0ad24?w=800&h=600&fit=crop',
        description: '法国印象派画家莫奈的经典作品集，包括著名的《睡莲》系列等。',
        categoryId: categories[1].id,
        isPublished: true,
        publishedAt: new Date(),
        displayOrder: 1,
        viewCount: 0
      },
      {
        title: '梵高星夜系列',
        artist: '文森特·梵高',
        coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        description: '荷兰后印象派画家梵高的星夜主题作品，充满动感和情感表达。',
        categoryId: categories[1].id,
        isPublished: true,
        publishedAt: new Date(),
        displayOrder: 2,
        viewCount: 0
      },
      {
        title: '达芬奇素描集',
        artist: '列奥纳多·达·芬奇',
        coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        description: '文艺复兴时期大师达芬奇的素描作品，展现其精湛的绘画技巧。',
        categoryId: categories[0].id,
        isPublished: true,
        publishedAt: new Date(),
        displayOrder: 3,
        viewCount: 0
      }
    ]).returning();

    console.log('画集创建成功:', collections);

    // 4. 为每个画集创建作品
    console.log('创建作品...');
    
    // 莫奈作品
    const monetArtworks = await db.insert(comicUniverseArtworks).values([
      {
        collectionId: collections[0].id,
        title: '睡莲',
        artist: '克劳德·莫奈',
        image: 'https://images.unsplash.com/photo-1594736797933-d0401ba0ad24?w=1200&h=800&fit=crop',
        description: '莫奈最著名的系列作品之一，描绘了他花园中的睡莲池。',
        createdTime: '1919',
        theme: '自然风光',
        dimensions: '200 x 300 cm',
        pageOrder: 1,
        isActive: true
      },
      {
        collectionId: collections[0].id,
        title: '日出·印象',
        artist: '克劳德·莫奈',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop',
        description: '印象派运动的开山之作，画家对光线和色彩的独特表现。',
        createdTime: '1872',
        theme: '日出景象',
        dimensions: '48 x 63 cm',
        pageOrder: 2,
        isActive: true
      },
      {
        collectionId: collections[0].id,
        title: '鲁昂大教堂',
        artist: '克劳德·莫奈',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop',
        description: '莫奈以同一座教堂为主题，在不同光线下创作的系列作品。',
        createdTime: '1894',
        theme: '建筑光影',
        dimensions: '107 x 73 cm',
        pageOrder: 3,
        isActive: true
      }
    ]).returning();

    // 梵高作品
    const vanGoghArtworks = await db.insert(comicUniverseArtworks).values([
      {
        collectionId: collections[1].id,
        title: '星夜',
        artist: '文森特·梵高',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop',
        description: '梵高最著名的作品，表现了夜空中旋转的星云和村庄的宁静。',
        createdTime: '1889',
        theme: '星空夜景',
        dimensions: '73.7 x 92.1 cm',
        pageOrder: 1,
        isActive: true
      },
      {
        collectionId: collections[1].id,
        title: '向日葵',
        artist: '文森特·梵高',
        image: 'https://images.unsplash.com/photo-1594736797933-d0401ba0ad24?w=1200&h=800&fit=crop',
        description: '梵高向日葵系列中的经典之作，展现了生命的活力。',
        createdTime: '1888',
        theme: '花卉静物',
        dimensions: '92 x 73 cm',
        pageOrder: 2,
        isActive: true
      }
    ]).returning();

    // 达芬奇作品
    const daVinciArtworks = await db.insert(comicUniverseArtworks).values([
      {
        collectionId: collections[2].id,
        title: '维特鲁威人',
        artist: '列奥纳多·达·芬奇',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop',
        description: '达芬奇关于人体比例的著名素描，体现了文艺复兴时期的科学精神。',
        createdTime: '1490',
        theme: '人体研究',
        dimensions: '34.4 x 25.5 cm',
        pageOrder: 1,
        isActive: true
      },
      {
        collectionId: collections[2].id,
        title: '飞行器设计图',
        artist: '列奥纳多·达·芬奇',
        image: 'https://images.unsplash.com/photo-1594736797933-d0401ba0ad24?w=1200&h=800&fit=crop',
        description: '达芬奇设计的飞行器草图，展现了他超前的想象力。',
        createdTime: '1488',
        theme: '机械设计',
        dimensions: '23 x 16 cm',
        pageOrder: 2,
        isActive: true
      }
    ]).returning();

    console.log('作品创建成功');
    console.log('莫奈作品:', monetArtworks.length, '件');
    console.log('梵高作品:', vanGoghArtworks.length, '件');
    console.log('达芬奇作品:', daVinciArtworks.length, '件');

    console.log('✅ 所有测试数据创建完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 创建测试数据失败：', error);
    process.exit(1);
  }
}

createTestData(); 