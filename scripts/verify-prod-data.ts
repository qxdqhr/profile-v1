import { db } from '../src/db/index';
import { 
  comicUniverseConfigs,
  comicUniverseCategories,
  comicUniverseCollections,
  comicUniverseArtworks
} from '../src/modules/showmasterpiece/db/schema/masterpieces';
import { users, userSessions } from '../src/db/schema/auth';
import 'dotenv/config';

async function verifyProdData() {
  try {
    console.log('🔍 验证生产环境数据...');

    // 1. 检查用户数据
    const userList = await db.select().from(users);
    console.log('\n👥 用户数据:', userList.length, '条');
    userList.forEach(user => {
      console.log(`  - ${user.phone} (${user.name || '未设置姓名'}) - 角色: ${user.role}`);
      console.log(`    状态: ${user.isActive ? '激活' : '禁用'}, 注册时间: ${user.createdAt?.toLocaleDateString()}`);
    });

    // 2. 检查用户会话
    const sessions = await db.select().from(userSessions);
    console.log('\n🔐 用户会话:', sessions.length, '条');

    // 3. 检查配置
    const configs = await db.select().from(comicUniverseConfigs);
    console.log('\n📊 配置数据:', configs.length, '条');
    if (configs.length > 0) {
      console.log('  - 网站名称:', configs[0].siteName);
      console.log('  - 主题:', configs[0].theme);
      console.log('  - 语言:', configs[0].language);
    }

    // 4. 检查分类
    const categories = await db.select().from(comicUniverseCategories);
    console.log('\n📂 分类数据:', categories.length, '条');
    categories.forEach(cat => {
      console.log(`  - ${cat.name}: ${cat.description}`);
    });

    // 5. 检查画集
    const collections = await db.select().from(comicUniverseCollections);
    console.log('\n🎨 画集数据:', collections.length, '条');
    collections.forEach(col => {
      console.log(`  - ${col.title} (${col.artist})`);
      console.log(`    描述: ${col.description?.substring(0, 50)}...`);
      console.log(`    发布状态: ${col.isPublished ? '已发布' : '草稿'}`);
    });

    // 6. 检查作品
    const artworks = await db.select().from(comicUniverseArtworks);
    console.log('\n🖼️  作品数据:', artworks.length, '件');
    const groupedArtworks = artworks.reduce((acc: any, artwork) => {
      if (!acc[artwork.collectionId]) {
        acc[artwork.collectionId] = [];
      }
      acc[artwork.collectionId].push(artwork);
      return acc;
    }, {});

    Object.entries(groupedArtworks).forEach(([collectionId, works]: [string, any]) => {
      const collection = collections.find(c => c.id === parseInt(collectionId));
      console.log(`  画集: ${collection?.title}`);
      works.forEach((artwork: any) => {
        console.log(`    - ${artwork.title} (${artwork.createdTime}) - 主题: ${artwork.theme}`);
      });
    });

    // 7. 验证数据库字段更新
    console.log('\n✅ 字段验证:');
    const sampleArtwork = artworks[0];
    if (sampleArtwork) {
      console.log('  - createdTime 字段存在:', sampleArtwork.createdTime !== undefined);
      console.log('  - theme 字段存在:', sampleArtwork.theme !== undefined);
      console.log('  - 示例作品创作时间:', sampleArtwork.createdTime);
      console.log('  - 示例作品主题:', sampleArtwork.theme);
    }

    console.log('\n🎉 生产环境数据验证完成！');
    console.log('📈 数据统计:');
    console.log(`  - 用户: ${userList.length} 个`);
    console.log(`  - 会话: ${sessions.length} 个`);
    console.log(`  - 配置: ${configs.length} 条`);
    console.log(`  - 分类: ${categories.length} 条`);
    console.log(`  - 画集: ${collections.length} 条`);
    console.log(`  - 作品: ${artworks.length} 件`);

    if (userList.length > 0) {
      console.log('\n🔑 登录信息:');
      const adminUser = userList.find(u => u.role === 'admin');
      const testUser = userList.find(u => u.role === 'user');
      
      if (adminUser) {
        console.log('  管理员账户:');
        console.log(`    手机号: ${adminUser.phone}`);
        console.log('    密码: admin123456');
      }
      
      if (testUser) {
        console.log('  测试账户:');
        console.log(`    手机号: ${testUser.phone}`);
        console.log('    密码: test123456');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 验证生产环境数据失败：', error);
    process.exit(1);
  }
}

verifyProdData(); 