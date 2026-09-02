import { SearchBox } from 'sa2kit/common/ui/patterns';

interface TestFieldSearchBoxProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

export default function TestFieldSearchBox({
  searchQuery,
  onSearchChange,
  className,
}: TestFieldSearchBoxProps) {
  return (
    <div className={className}>
      <SearchBox
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
    </div>
  );
}
