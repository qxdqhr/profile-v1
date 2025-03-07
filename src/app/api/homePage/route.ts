import { NextResponse } from 'next/server';

const config = {
  // 首页配置
  homeConfig: {
    title: "你好，我是皋月朔星",
    subtitle: "我会在这里记录coding生活中遇到的大大小小的故事",
    buttons: [
      { text: "查看作品", link: "#projects" },
      { text: "联系我", link: "#contact" },
    ],
    imageSrc: "/images/home.webp",
  },
  // 导航配置
  navConfig: {
    avatar: "/images/avatar.jpg",
    direction: "vertical",
    items: [
      { id: "home", label: "主页", href: "#home" },
      {
        id: "about",
        label: "关于我",
        href: "#about",
      },
      {
        id: "projects",
        label: "项目",
        href: "#projects",
      },
      {
        id: "blog",
        label: "博客",
        href: "/blog",
      },
      {
        id: "testField",
        label: "实验田",
        href: "/testField",
      },
      {
        id: "gameField",
        label: "休闲区",
        href: "/gameField",
      },
      { id: "contact",
        label: "联系方式",
        href: "#contact"
      },
    ],
  },
  // 时间线配置
  timelineConfig: {
    timelines: [
      {
        direction: "vertical" as const,
        items: [
          { date: "Career Start" },
          {
            date: "2021.6",
            title: "哈尔滨理工大学",
            description: "在学校学习了C++ 与Qt开发、网络编程、数据结构、算法等",
            tags: ["C++", "Qt"],
          },
          { date: "北京篇" },
          {
            date: "2021.7",
            title: "校招实习：Go开发工程师",
            description:
                "在公司学习了Go开发、Gin、Gorm、MySQL 对于后端应用的curd操作有了一定的了解",
            tags: ["Go", "Gin", "Gorm", "MySQL"],
          },
          {
            date: "2021.12",
            title: "校招实习+报道：Mac开发工程师",
            description:
                "在公司学习了Objective-C、Swift、Mac开发、CocoaPods、Xcode等",
            tags: ["Objective-C", "Swift", "CocoaPods", "Xcode"],
          },
          {
            date: "2024.04",
            title: "第一次社招：iOS开发工程师",
            description:
                "在公司学习了Objective-C、Swift、iOS开发、CocoaPods、Xcode等",
            tags: ["Objective-C", "Swift", "CocoaPods", "Xcode"],
          },
          {
            date: "2025.01",
            title: "个人学习：React",
            description:
                "在个人学习了React、TypeScript、Next.js、Tailwind CSS等",
            tags: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
          },
        ],
      },
    ],
  },
  // 碰撞球配置
  collisionBallsConfig: {
    balls: [
      { text: "Swift", textColor: "#fff", weight: 35, color: "#FA7343" },
      { text: "Objective-C", textColor: "#fff", weight: 45, color: "#438EFF" },
      { text: "TypeScript", textColor: "#fff", weight: 25, color: "#3178C6" },
      { text: "React", textColor: "#000", weight: 25, color: "#61DAFB" },
      { text: "ReactNative", textColor: "#000", weight: 25, color: "#61DAFB" },
    ],
    width: 800,
    height: 600,
    minVelocity: 0,
    maxVelocity: 2,
  },
  // 项目展示配置
  projectsConfig: {
    projects: [
      {
        id: "1",
        title: "个人博客系统",
        description:
            "使用 React + TypeScript 开发的个人博客系统，支持文章管理、评论系统等功能",
        image: "/images/blog-image.jpg",
        tags: ["React", "TypeScript", "Node.js"],
        link: "https://github.com/yourusername/blog",
      },
      {
        id: "2",
        title: "在线聊天应用",
        description: "基于 WebSocket 的实时聊天应用，支持群聊和私聊功能",
        image: "/images/chat-image.jpg",
        tags: ["WebSocket", "React", "Express"],
        link: "https://github.com/yourusername/chat",
      },
      // 添加更多项目...
    ],
  },
};

export async function GET(request: Request) {
  return NextResponse.json(config);
}   