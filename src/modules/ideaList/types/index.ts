import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { ideaLists, ideaItems } from '../db/schema';

// ===== 数据库模型类型 =====
export type IdeaList = InferSelectModel<typeof ideaLists>;
export type IdeaItem = InferSelectModel<typeof ideaItems>;
export type NewIdeaList = InferInsertModel<typeof ideaLists>;
export type NewIdeaItem = InferInsertModel<typeof ideaItems>;

// ===== 表单数据类型 =====
export interface IdeaListFormData {
  name: string;
  description?: string;
  color: string;
}

export interface IdeaItemFormData {
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

// ===== 扩展数据类型 =====
export interface IdeaListWithItems extends IdeaList {
  items: IdeaItem[];
  itemCount: number;
  completedCount: number;
}

// ===== API 响应类型 =====
export interface IdeaListResponse {
  success: boolean;
  data?: IdeaList;
  message?: string;
}

export interface IdeaListsResponse {
  success: boolean;
  data?: IdeaListWithItems[];
  message?: string;
}

export interface IdeaItemResponse {
  success: boolean;
  data?: IdeaItem;
  message?: string;
}

export interface IdeaItemsResponse {
  success: boolean;
  data?: IdeaItem[];
  message?: string;
}

// ===== 组件属性类型 =====
export interface IdeaListCardProps {
  ideaList: IdeaListWithItems;
  onEdit?: (ideaList: IdeaList) => void;
  onDelete?: (id: number) => void;
  onClick?: (id: number) => void;
}

export interface IdeaItemProps {
  item: IdeaItem;
  onToggleComplete?: (id: number) => void;
  onEdit?: (item: IdeaItem) => void;
  onDelete?: (id: number) => void;
  draggable?: boolean;
}

export interface CreateIdeaListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IdeaListFormData) => void;
  loading?: boolean;
}

export interface EditIdeaItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IdeaItemFormData) => void;
  item?: IdeaItem;
  loading?: boolean;
}

// ===== Hook 状态类型 =====
export interface UseIdeaListsState {
  ideaLists: IdeaListWithItems[];
  loading: boolean;
  error: string | null;
  refreshLists: () => Promise<void>;
  createList: (data: IdeaListFormData) => Promise<{ success: boolean; newListId?: number }>;
  updateList: (id: number, data: Partial<IdeaListFormData>) => Promise<boolean>;
  deleteList: (id: number) => Promise<boolean>;
  reorderLists: (orderedIds: number[]) => Promise<boolean>;
  updateListStats: (listId: number, itemCountChange: number, completedCountChange: number) => void;
}

export interface UseIdeaItemsState {
  items: IdeaItem[];
  loading: boolean;
  error: string | null;
  refreshItems: (showLoading?: boolean) => Promise<void>;
  createItem: (listId: number, data: IdeaItemFormData) => Promise<boolean>;
  updateItem: (id: number, data: Partial<IdeaItemFormData>) => Promise<boolean>;
  deleteItem: (id: number) => Promise<boolean>;
  toggleComplete: (id: number) => Promise<boolean>;
  reorderItems: (listId: number, orderedIds: number[]) => Promise<boolean>;
}

// ===== 过滤和排序类型 =====
export type PriorityFilter = 'all' | 'high' | 'medium' | 'low';
export type CompletionFilter = 'all' | 'completed' | 'pending';
export type SortOption = 'created' | 'updated' | 'priority' | 'alphabetical';

export interface FilterOptions {
  priority: PriorityFilter;
  completion: CompletionFilter;
  tags: string[];
  search: string;
}

export interface SortOptions {
  field: SortOption;
  direction: 'asc' | 'desc';
}

// ===== 颜色主题类型 =====
export type ColorTheme = 
  | 'blue' 
  | 'green' 
  | 'purple' 
  | 'red' 
  | 'yellow' 
  | 'pink' 
  | 'indigo' 
  | 'gray'; 