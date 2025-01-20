'use client';

import React from 'react';
import Link from 'next/link';

// 模拟博客数据
const blogPosts = [
  {
    id: 1,
    title: '我的第一篇博客',
    description: '这是一篇关于技术和生活的思考...',
    date: '2024-01-20',
    slug: 'my-first-blog'
  },
  {
    id: 2,
    title: '学习 Next.js 的心得',
    description: '分享我在学习 Next.js 过程中的经验和技巧...',
    date: '2024-01-21',
    slug: 'learning-nextjs'
  }
];

export default function BlogPage() {
  return (
    <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
      <h1 className="tw-text-4xl tw-font-bold tw-mb-8 tw-text-center">博客文章</h1>
      <div className="tw-grid tw-gap-6 md:tw-grid-cols-2 lg:tw-grid-cols-3">
        {blogPosts.map((post) => (
          <Link 
            href={`/blog/${post.slug}`} 
            key={post.id}
            className="blog-card tw-block tw-p-6 tw-rounded-lg"
          >
            <article>
              <h2 className="tw-text-2xl tw-font-semibold tw-mb-2">{post.title}</h2>
              <p className="tw-text-gray-600 tw-mb-4">{post.description}</p>
              <time className="tw-text-sm tw-text-gray-500">{post.date}</time>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
} 