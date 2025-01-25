import React from 'react';
import Link from 'next/link';
import "@/styles/index.css";

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
    <div className="blog-container">
      <div className="blog-wrapper">
        <div className="blog-nav-buttons">
          <Link href="/" className="back-button">
            ←返回主页
          </Link>
        </div>
        <h1 className="blog-title">博客文章</h1>
        <div className="blog-grid">
          {blogPosts.map((post) => (
            <Link 
              href={`/blog/${post.slug}`} 
              key={post.id}
              className="blog-card"
            >
              <article>
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-description">{post.description}</p>
                <time className="blog-card-date">{post.date}</time>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
