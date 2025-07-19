import React from 'react';
import { ConfigCategory } from '../types';

interface ConfigCategoryListProps {
  categories: ConfigCategory[];
  selectedCategory: ConfigCategory | null;
  onSelectCategory: (category: ConfigCategory) => void;
}

export const ConfigCategoryList: React.FC<ConfigCategoryListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="divide-y divide-gray-200">
      {categories.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          暂无配置分类
        </div>
      ) : (
        categories.map((category) => (
          <div
            key={category.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedCategory?.id === category.id
                ? 'bg-blue-50 border-r-2 border-blue-500'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelectCategory(category)}
          >
            <div className="flex items-center">
              {category.icon && (
                <span className="mr-3 text-gray-400">
                  <i className={category.icon}></i>
                </span>
              )}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {category.displayName}
                </h3>
                {category.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}; 