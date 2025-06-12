# ShowMasterpiece 模块

这是一个完整的画集展示管理模块，包含前端组件、API路由、数据库服务和性能优化。

## 📁 模块结构

```
src/modules/showmasterpiece/
├── index.ts                    # 模块主导出文件
├── server.ts                   # 服务端专用导出文件
├── components/                 # UI组件
│   ├── CollectionCard.tsx      # 画集卡片组件
│   ├── ArtworkViewer.tsx       # 作品查看器
│   ├── ThumbnailSidebar.tsx    # 缩略图侧边栏
│   └── CollectionOrderManager.tsx # 画集顺序管理组件 🆕
├── pages/                      # 页面组件
├── hooks/                      # React Hooks
├── services/                   # 客户端服务
├── db/                         # 数据库服务
├── api/                        # API路由
└── types/                      # 类型定义
```

## ⚡ 性能优化

### API优化

1. **缓存机制**：
   - 服务端内存缓存（2分钟）
   - HTTP缓存头（120秒缓存，300秒过期重验证）

2. **查询优化**：
   - 分离复杂JOIN查询为独立查询
   - 使用Promise.all并行执行查询
   - 构建内存映射表提高数据处理效率

3. **数据分层**：
   - `getAllCollections()` - 完整数据（包含所有作品）
   - `getCollectionsOverview()` - 概览数据（不含作品详情，只有数量）

### API端点

#### 获取画集列表

```typescript
// 完整数据（包含所有作品）
GET /api/masterpieces/collections

// 概览数据（快速加载，不含作品详情）
GET /api/masterpieces/collections?overview=true
```

#### 画集顺序管理 🆕

```typescript
// 批量重排序
PATCH /api/masterpieces/collections?action=reorder
Body: { collectionOrders: [{ id: number, displayOrder: number }] }

// 移动到指定位置
PATCH /api/masterpieces/collections?action=move
Body: { collectionId: number, targetOrder: number }

// 上移画集
PATCH /api/masterpieces/collections?action=up
Body: { collectionId: number }

// 下移画集
PATCH /api/masterpieces/collections?action=down
Body: { collectionId: number }
```

#### 作品顺序管理 🆕

```typescript
// 获取指定画集的所有作品（按顺序）
GET /api/masterpieces/collections/{collectionId}/artworks

// 批量重排序
PATCH /api/masterpieces/collections/{collectionId}/artworks?action=reorder
Body: { artworkOrders: [{ id: number, pageOrder: number }] }

// 移动到指定位置
PATCH /api/masterpieces/collections/{collectionId}/artworks?action=move
Body: { artworkId: number, targetOrder: number }

// 上移作品
PATCH /api/masterpieces/collections/{collectionId}/artworks?action=up
Body: { artworkId: number }

// 下移作品
PATCH /api/masterpieces/collections/{collectionId}/artworks?action=down
Body: { artworkId: number }
```

#### 缓存控制

```
Cache-Control: public, max-age=120, stale-while-revalidate=300
```

## 🔄 缓存管理

### 自动缓存清理

当以下操作发生时，缓存会自动清理：
- 创建画集
- 更新画集
- 删除画集
- 添加作品
- 更新作品
- 删除作品
- **调整画集顺序** 🆕
- **调整作品顺序** 🆕

### 手动清理缓存

```typescript
import { collectionsDbService } from '@/modules/showmasterpiece/server';

// 清理画集缓存
collectionsDbService.clearCache();
```

## 🎯 画集顺序管理功能 🆕

### 功能特点

1. **多种操作方式**：
   - 拖拽排序：直观的拖放操作
   - 按钮操作：上移/下移按钮
   - 批量排序：一次性调整多个画集顺序

2. **实时预览**：
   - 拖拽时显示视觉反馈
   - 实时显示当前顺序编号
   - 变更检测和保存提示

3. **用户体验**：
   - 响应式设计，支持移动端
   - 加载状态和错误处理
   - 操作确认和成功提示

### 作品顺序管理功能 🆕

### 功能特点

1. **画集内作品排序**：
   - 拖拽排序：直观的拖放操作
   - 按钮操作：上移/下移按钮
   - 批量排序：一次性调整多个作品顺序

2. **实时预览**：
   - 拖拽时显示视觉反馈
   - 实时显示当前顺序编号
   - 变更检测和保存提示

3. **用户体验**：
   - 响应式设计，支持移动端
   - 作品缩略图显示
   - 加载状态和错误处理
   - 操作确认和成功提示

### 使用方法

#### 在配置页面中使用

访问 `/testField/ShowMasterPieces/config` 页面：

**画集管理：**
1. **画集列表管理**：
   - 点击"添加画集"创建新画集
   - 使用编辑/删除按钮管理现有画集

2. **画集排序**：
   - 点击"画集排序"按钮进入排序模式
   - **拖拽排序**：点击并拖动画集项左侧的 ⋮⋮ 图标，拖动到目标位置后释放
   - **按钮操作**：点击 ↑ 按钮上移画集，点击 ↓ 按钮下移画集
   - **批量操作**：拖拽调整多个画集后，点击"保存顺序"按钮一次性提交
   - 点击"关闭排序"返回普通画集管理界面

**作品管理：**
1. **选择画集**：从下拉菜单中选择要管理的画集
2. **作品列表管理**：点击"添加作品"创建新作品
3. **作品排序**：
   - 点击"作品排序"按钮进入排序模式
   - 支持拖拽和按钮操作调整作品顺序
   - 点击"关闭排序"返回普通作品管理界面

#### 编程方式使用

```typescript
import { 
  updateCollectionOrder,
  moveCollectionUp,
  moveCollectionDown,
  CollectionOrderManager,
  updateArtworkOrder,
  moveArtworkUp,
  moveArtworkDown,
  ArtworkOrderManager 
} from '@/modules/showmasterpiece';

// 批量更新画集顺序
await updateCollectionOrder([
  { id: 1, displayOrder: 3 },
  { id: 2, displayOrder: 2 },
  { id: 3, displayOrder: 1 }
]);

// 上移画集
await moveCollectionUp(collectionId);

// 下移画集
await moveCollectionDown(collectionId);

// 使用画集排序组件
<CollectionOrderManager 
  onOrderChanged={() => console.log('顺序已更新')} 
/>

// 批量更新作品顺序
await updateArtworkOrder(collectionId, [
  { id: 1, pageOrder: 0 },
  { id: 2, pageOrder: 1 },
  { id: 3, pageOrder: 2 }
]);

// 上移作品
await moveArtworkUp(collectionId, artworkId);

// 下移作品
await moveArtworkDown(collectionId, artworkId);

// 使用作品排序组件
<ArtworkOrderManager 
  collectionId={collectionId}
  onOrderChanged={() => console.log('作品顺序已更新')} 
/>
```

## 🛠️ 使用方法

### 客户端使用

```typescript
import { 
  getAllCollections, 
  getCollectionsOverview,
  getArtworksByCollection,
  useMasterpieces,
  CollectionCard,
  CollectionOrderManager,
  ArtworkOrderManager
} from '@/modules/showmasterpiece';

// 获取完整画集数据
const collections = await getAllCollections();

// 获取概览数据（更快）
const overview = await getCollectionsOverview();

// 获取指定画集的作品数据 🆕
const artworks = await getArtworksByCollection(collectionId);

// 使用React Hook
const { collections, loading } = useMasterpieces();

// 使用UI组件
<CollectionCard collection={collection} />
<CollectionOrderManager onOrderChanged={handleOrderChange} />
<ArtworkOrderManager collectionId={collectionId} onOrderChanged={handleArtworkOrderChange} />
```

### 服务端使用

```typescript
import { 
  collectionsDbService,
  artworksDbService 
} from '@/modules/showmasterpiece/server';

// 获取画集数据
const collections = await collectionsDbService.getAllCollections();

// 创建新画集
const newCollection = await collectionsDbService.createCollection(data);

// 调整画集顺序
await collectionsDbService.moveCollectionUp(collectionId);
await collectionsDbService.updateCollectionOrder(orders);

// 获取作品数据 🆕
const artworks = await artworksDbService.getArtworksByCollection(collectionId);

// 调整作品顺序 🆕
await artworksDbService.moveArtworkUp(collectionId, artworkId);
await artworksDbService.updateArtworkOrder(collectionId, orders);
```

## 📊 性能指标

### 优化前
- 复杂JOIN查询导致响应时间长
- 每次都查询完整数据
- N+1查询问题

### 优化后
- 分离查询，提升查询效率
- 概览API响应时间减少60-80%
- 内存缓存减少数据库压力
- HTTP缓存减少网络请求
- **画集顺序调整响应迅速** 🆕

### 建议使用场景

- **列表展示**：使用 `getCollectionsOverview()` 
- **详情查看**：使用 `getAllCollections()`
- **管理界面**：根据需要选择合适的API
- **顺序管理**：使用配置页面的"画集排序"标签页 🆕

## 🔧 配置

缓存配置可在数据库服务中调整：

```typescript
// 缓存持续时间（毫秒）
private readonly CACHE_DURATION = 2 * 60 * 1000; // 2分钟

// HTTP缓存头
response.headers.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
```

## 🎨 界面预览

### 画集顺序管理界面

- 📋 画集列表显示：封面图、标题、作者、分类
- 🔢 顺序编号：实时显示当前排序位置
- 🎯 拖拽操作：支持直观的拖放排序
- ⬆️⬇️ 按钮操作：精确的上移下移控制
- 💾 批量保存：支持一次性保存多个变更
- 📱 响应式设计：完美适配移动端操作 