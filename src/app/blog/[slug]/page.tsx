import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import "@/styles/index.css";

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
    <div className="blog-post-container">
      <div className="blog-post-wrapper">
        <div className="blog-nav-buttons">
          <Link href="/" className="back-button">
            返回主页
          </Link>
          <Link href="/blog" className="back-button">
            返回博客列表
          </Link>
        </div>
        
        <article>
          <h1 className="blog-post-title">{post.title}</h1>
          <time className="blog-post-date">{post.date}</time>
          <div className="blog-post-content">
            {post.content}
          </div>
        </article>
      </div>
    </div>
  );
} 