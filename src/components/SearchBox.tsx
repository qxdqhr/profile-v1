interface SearchBoxProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export default function SearchBox({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "搜索实验项目的标题、描述或标签..." 
}: SearchBoxProps) {
  return (
    <div className="relative group w-full">
      {/* 搜索输入框 */}
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="
          w-full h-16 pl-6 pr-16 text-lg
          border-2 border-gray-200 rounded-2xl 
          bg-white shadow-lg 
          focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 
          hover:border-gray-300 hover:shadow-xl
          transition-all duration-300 ease-out
          text-gray-800 placeholder-gray-500
          font-medium
        "
      />

      {/* 清除按钮 */}
      {searchQuery && (
        <button
          onClick={() => onSearchChange('')}
          className="
            absolute top-1/2 right-4 transform -translate-y-1/2
            z-10 group/clear
          "
        >
          <div className="
            w-8 h-8 flex items-center justify-center
            rounded-full 
            bg-gray-100 hover:bg-gray-200 
            transition-all duration-200 
            group-hover/clear:scale-105
          ">
            <svg 
              className="h-4 w-4 text-gray-500 group-hover/clear:text-gray-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}