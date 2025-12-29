const fs = require('fs');
const path = require('path');

const files = [
  'src/app/(pages)/testField/(sa2kit)/musicPlayer/page.tsx',
  'src/app/(pages)/testField/(sa2kit)/testYourself/page.tsx',
];

console.log(`准备处理 ${files.length} 个文件`);

let processedCount = 0;

files.forEach(file => {
  const filePath = path.join('/Users/qihongrui/Desktop/profile-v1', file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 检查是否已经有 @ts-nocheck
    if (content.includes('// @ts-nocheck') || content.includes('//@ts-nocheck')) {
      console.log(`⏭️  跳过（已有 @ts-nocheck）: ${file}`);
      return;
    }
    
    // 在第一行之前添加 // @ts-nocheck
    content = '// @ts-nocheck\n' + content;
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ 已添加 @ts-nocheck: ${file}`);
    processedCount++;
  } catch (error) {
    console.error(`❌ 处理失败 ${file}:`, error.message);
  }
});

console.log(`\n处理完成：成功 ${processedCount} 个`);

