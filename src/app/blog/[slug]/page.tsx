import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// 模拟博客数据
const blogPosts = {
  'my-first-blog': {
    title: '我的第一篇博客',
    content: '这是我的第一篇博客的详细内容...',
    date: '2024-01-20'
  },
  'learning-nextjs': {
    title: '学习 Next.js 的心得',
    content: '这是关于学习 Next.js 的详细内容...',
    date: '2024-01-21'
  }
};

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts[params.slug as keyof typeof blogPosts];

  if (!post) {
    notFound();
  }

  return (
    <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
      <Link 
        href="/blog" 
        className="tw-inline-block tw-mb-8 tw-text-blue-600 hover:tw-text-blue-800"
      >
        ← 返回博客列表
      </Link>
      
      <article className="tw-prose lg:tw-prose-xl tw-mx-auto">
        <h1 className="tw-text-4xl tw-font-bold tw-mb-4">{post.title}</h1>
        <time className="tw-text-gray-500 tw-block tw-mb-8">{post.date}</time>
        <div className="tw-mt-8">
          {post.content}
        </div>
      </article>
    </div>
  );
} 