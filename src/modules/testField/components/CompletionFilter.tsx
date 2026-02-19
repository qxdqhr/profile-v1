import type { CompletionFilter } from '../types';
import { getCompletionFilterDisplayName } from '../utils';
import { FilterButtonGroup } from 'sa2kit/components';

interface CompletionFilterProps {
  completionFilter: CompletionFilter;
  onCompletionFilterChange: (filter: CompletionFilter) => void;
  counts: { all: number; completed: number; inProgress: number };
}

export default function CompletionFilter({ 
  completionFilter, 
  onCompletionFilterChange, 
  counts 
}: CompletionFilterProps) {
  const options = [
    {
      value: 'all' as const,
      label: getCompletionFilterDisplayName('all'),
      icon: '📊',
      activeColor: {
        bg: 'bg-slate-500',
        shadow: 'shadow-slate-200'
      },
      count: counts.all,
      showCount: true
    },
    {
      value: 'completed' as const,
      label: getCompletionFilterDisplayName('completed'),
      icon: '✅',
      activeColor: {
        bg: 'bg-emerald-500',
        shadow: 'shadow-emerald-200'
      },
      count: counts.completed,
      showCount: true
    },
    {
      value: 'incomplete' as const,
      label: getCompletionFilterDisplayName('incomplete'),
      icon: '🚧',
      activeColor: {
        bg: 'bg-orange-500',
        shadow: 'shadow-orange-200'
      },
      count: counts.inProgress,
      showCount: true
    }
  ];

  return (
    <FilterButtonGroup
      label="完成状态"
      value={completionFilter}
      options={options}
      onChange={onCompletionFilterChange}
    />
  );
}