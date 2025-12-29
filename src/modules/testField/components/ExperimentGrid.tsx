import { ExperimentCard, Grid, GridItem, GridColumns, GridGap } from 'sa2kit';
import type { ExperimentItem } from '../types';


// ==================== 实验项目特定接口 ====================

/** 实验项目网格项接口 */
export interface ExperimentGridItem extends GridItem {
  title: string;
  description: string;
  path: string;
  tags: string[];
  category: string;
  isCompleted?: boolean;
  updatedAt?: string;
  createdAt?: string;
}

/** 实验项目网格组件 Props */
interface ExperimentGridProps<T extends ExperimentGridItem> {
  /** 数据项数组 */
  items: T[];
  /** 自定义渲染函数（可选） */
  renderItem?: (item: T, index: number) => React.ReactNode;
  /** 网格列数配置（可选） */
  columns?: GridColumns;
  /** 间距配置（可选） */
  gap?: GridGap;
  /** 额外的容器类名 */
  className?: string;
}

// ==================== 默认渲染器 ====================

/** 默认的 ExperimentCard 渲染器 */
function defaultExperimentRenderer(item: ExperimentItem) {
  return (
    <ExperimentCard
      href={item.path}
      title={item.title}
      description={item.description}
      tags={item.tags}
      category={item.category}
      isCompleted={item.isCompleted}
      updatedAt={item.updatedAt}
      createdAt={item.createdAt}
    />
  );
}

// ==================== 实验项目网格组件 ====================

/** 实验项目网格组件 */
export default function ExperimentGrid<T extends ExperimentGridItem>({
  items,
  renderItem,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md',
  className = ''
}: ExperimentGridProps<T>) {
  const itemRenderer = renderItem || ((item: T) => defaultExperimentRenderer(item as ExperimentItem));

  return (
    <Grid
      items={items}
      renderItem={itemRenderer}
      columns={columns}
      gap={gap}
      className={className}
    />
  );
}

// ==================== 向后兼容组件 ====================

/** 为了向后兼容，导出一个专门用于 ExperimentItem 的组件 */
export function ExperimentItemGrid({ 
  experiments, 
  ...props 
}: Omit<ExperimentGridProps<ExperimentItem>, 'items'> & { experiments: ExperimentItem[] }) {
  return <ExperimentGrid<ExperimentItem> items={experiments} {...props} />;
}