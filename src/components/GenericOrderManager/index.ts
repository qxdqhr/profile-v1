/**
 * GenericOrderManager - 通用排序管理器组件
 * 
 * 这是一个高度可复用的排序管理组件，可以用于任何需要排序功能的数据管理场景。
 * 通过泛型设计，支持任何具有 id 字段的数据类型。
 * 
 * 主要特性：
 * - 泛型支持：TypeScript 泛型确保类型安全
 * - 拖拽排序：支持直观的拖拽操作
 * - 按钮排序：提供上移/下移按钮
 * - 批量操作：支持批量保存和重置
 * - 错误处理：完善的错误处理和加载状态
 * - 样式隔离：使用 CSS Modules 避免样式冲突
 * 
 * 使用示例：
 * ```tsx
 * import { GenericOrderManager } from '@/components/GenericOrderManager';
 * 
 * const MyOrderManager = () => {
 *   const operations = {
 *     loadItems: async () => { /* 加载数据 *\/ },
 *     moveItemUp: async (id) => { /* 上移 *\/ },
 *     moveItemDown: async (id) => { /* 下移 *\/ },
 *     updateItemOrder: async (orders) => { /* 批量更新 *\/ }
 *   };
 * 
 *   const renderItem = (item, index, isFirst, isLast) => (
 *     <div>{item.name}</div>
 *   );
 * 
 *   return (
 *     <GenericOrderManager
 *       operations={operations}
 *       renderItem={renderItem}
 *       title="排序管理"
 *       description="拖拽或使用按钮调整顺序"
 *     />
 *   );
 * };
 * ```
 * 
 * @author Profile-v1 Team
 * @version 1.0.0
 */

export { GenericOrderManager } from './GenericOrderManager';

// 导出相关类型定义
export type {
  OrderableItem,
  OrderManagerOperations,
  GenericOrderManagerProps
} from './GenericOrderManager'; 