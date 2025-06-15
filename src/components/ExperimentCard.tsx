'use client';

import React from 'react';
import Link from 'next/link';

interface ExperimentCardProps {
  href: string;
  title: string;
  description: string;
  tags: string[];
  category: 'utility' | 'leisure';
}

const ExperimentCard: React.FC<ExperimentCardProps> = ({ href, title, description, tags, category }) => {
  return (
    <Link href={href} className="block">
      <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {title}
            </h3>
            <span className={`px-3 py-1 text-sm rounded-full ${
              category === 'utility' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {category === 'utility' ? '实用工具' : '休闲娱乐'}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{description}</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ExperimentCard; 