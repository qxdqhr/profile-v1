// ===== 服务端专用导出 =====
// 这些只能在服务端使用（API路由、服务器组件等）

export { ideaListDbService } from './db/ideaListDbService';

// 重新导出类型，方便服务端使用
export type {
  IdeaList,
  IdeaItem,
  NewIdeaList,
  NewIdeaItem,
  IdeaListWithItems,
  IdeaListFormData,
  IdeaItemFormData,
} from './types'; 