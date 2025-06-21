// ===== 页面组件导出 =====
export { default as IdeaListPage } from './pages/IdeaListPage';

// ===== 组件导出 =====
export { default as CreateIdeaListModal } from './components/CreateIdeaListModal';
export { default as EditIdeaListModal } from './components/EditIdeaListModal';
export { default as CreateIdeaItemModal } from './components/CreateIdeaItemModal';
export { default as EditIdeaItemModal } from './components/EditIdeaItemModal';

// ===== Hook导出 =====
export { useIdeaLists } from './hooks/useIdeaLists';
export { useIdeaItems } from './hooks/useIdeaItems';

// ===== 客户端服务导出 =====
export { IdeaListService } from './services/ideaListService';

// ===== 类型导出 =====
export type {
  IdeaList,
  IdeaItem,
  NewIdeaList,
  NewIdeaItem,
  IdeaListFormData,
  IdeaItemFormData,
  IdeaListWithItems,
  IdeaListResponse,
  IdeaListsResponse,
  IdeaItemResponse,
  IdeaItemsResponse,
  IdeaListCardProps,
  IdeaItemProps,
  CreateIdeaListModalProps,
  EditIdeaItemModalProps,
  UseIdeaListsState,
  UseIdeaItemsState,
  PriorityFilter,
  CompletionFilter,
  SortOption,
  FilterOptions,
  SortOptions,
  ColorTheme,
} from './types';

// ===== 模块信息 =====
export const IDEALIST_MODULE_VERSION = '1.0.0';
export const IDEALIST_MODULE_NAME = '@profile-v1/idealist'; 