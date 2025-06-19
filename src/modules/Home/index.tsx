'use client';

import React, { useEffect, useState } from "react";
import NavigationContainer from "@/components/navigation";
import { NavigationConfig } from "@/components/navigation/types";
import About from "@/components/About";
import HomeSection, { HomeConfig } from "@/components/Home/Home";
import ProjectCarousel, { ProjectsConfig } from "@/components/ProjectCarousel";
import Contact from "@/components/Contact";
import { TimelineConfig } from "@/components/Timeline";
import { CollisionBallsConfig } from "@/components/CollisionBalls";


// 整体配置类型
interface Config {
  navConfig: {
    direction: "vertical" | "horizontal";
    items: Array<{
      id: string;
      label: string;
      href: string;
    }>;
    avatar: string;
  };
  homeConfig: HomeConfig;
  timelineConfig: TimelineConfig;
  collisionBallsConfig: CollisionBallsConfig;
  projectsConfig: ProjectsConfig;
}



const HomePage: React.FC = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeNavId, setActiveNavId] = useState<string>('');
  const [isUserClicking, setIsUserClicking] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/homePage');
        if (!response.ok) {
          throw new Error('Failed to fetch config');
        }
        const data = await response.json();
        setConfig(data);
        
        // 配置加载完成后，设置默认活动项为第一个锚点链接
        if (data.navConfig.items.length > 0) {
          const firstAnchorItem = data.navConfig.items.find((item: any) => 
            item.href.startsWith('#')
          );
          if (firstAnchorItem) {
            setActiveNavId(firstAnchorItem.id);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取配置失败');
        console.error('Error fetching config:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // 新增：监听滚动事件，自动更新活动导航项
  useEffect(() => {
    if (!config) return;

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // 标记正在滚动
      isScrolling = true;
      
      // 清除之前的超时
      clearTimeout(scrollTimeout);
      
      // 设置超时，在滚动停止后一段时间重置滚动状态
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 100);

      const scrollPosition = window.scrollY + 100; // 偏移量，提前触发
      
      // 获取所有锚点导航项
      const anchorItems = config.navConfig.items.filter((item: any) => 
        item.href.startsWith('#')
      );
      
      let currentActiveId = '';
      
      // 检查每个section的位置
      for (const item of anchorItems) {
        const element = document.getElementById(item.id);
        if (element) {
          const elementTop = element.offsetTop;
          const elementBottom = elementTop + element.offsetHeight;
          
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            currentActiveId = item.id;
            break; // 找到就直接跳出，不继续遍历
          }
        }
      }
      
      // 如果在页面顶部且没有找到section，默认选中第一个
      if (!currentActiveId && scrollPosition < 200 && anchorItems.length > 0) {
        currentActiveId = anchorItems[0].id;
      }
      
      // 仅当滚动引起的变化且活动项确实不同时才更新（排除用户点击期间）
      if (currentActiveId && currentActiveId !== activeNavId && !isUserClicking) {
        setActiveNavId(currentActiveId);
      }
    };

    // 节流处理，减少频繁调用
    let throttleTimeout: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      if (throttleTimeout) return;
      
      throttleTimeout = setTimeout(() => {
        handleScroll();
        throttleTimeout = null as any;
      }, 50); // 50ms 节流
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    // 初始检查（仅在配置首次加载时）
    if (activeNavId === '') {
      handleScroll();
    }
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout(scrollTimeout);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [config, activeNavId, isUserClicking]);

  // 处理导航项点击
  const handleItemClick = (item: any) => {
    setIsUserClicking(true);
    setActiveNavId(item.id);
    
    // 1.5秒后重新启用滚动监听
    setTimeout(() => {
      setIsUserClicking(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        加载配置失败: {error}
      </div>
    );
  }

  // 转换配置格式为新导航栏组件所需
  const navigationConfig: NavigationConfig = {
    direction: config.navConfig.direction,
    position: config.navConfig.direction === 'vertical' ? 'left' : 'top',
    items: config.navConfig.items.map(item => ({
      id: item.id,
      label: item.label,
      href: item.href,
      isExternal: item.href.startsWith('//') || item.href.startsWith('http'),
      target: item.href.startsWith('//') || item.href.startsWith('http') ? '_blank' : '_self'
    })),
    avatar: {
      src: config.navConfig.avatar,
      alt: '头像'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 新的通用导航栏组件 */}
      <NavigationContainer
        config={navigationConfig}
        activeItemId={activeNavId}
        onItemClick={handleItemClick}
        defaultOpen={false}
      />

      {/* 主内容 */}
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-4">
          <HomeSection homeConfig={config.homeConfig} />
          <About
            timelineConfig={config.timelineConfig}
            collisionBallsConfig={config.collisionBallsConfig}
          />
          <ProjectCarousel projects={config.projectsConfig.projects} />
          <Contact />
        </div>
      </main>
    </div>
  );
};

export default HomePage; 