interface SearchResultHintProps {
    searchQuery: string;
    resultCount: number;
  }
  
  export default function SearchResultHint({ searchQuery, resultCount }: SearchResultHintProps) {
    if (!searchQuery) return null;
  
    return (
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          搜索 "<span className="font-medium">{searchQuery}</span>" 
          找到 {resultCount} 个结果
        </p>
      </div>
    );
  }