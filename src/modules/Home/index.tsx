'use client';

import React, { useEffect, useState } from 'react';
import { Navigation as NavigationContainer, NavigationToggle } from 'sa2kit/navigation';
import { About, Home as HomeSection, ProjectCarousel, Contact } from 'sa2kit/portfolio';
import type { NavigationConfig } from 'sa2kit/navigation';
import type { HomeConfig, ProjectsConfig } from 'sa2kit/portfolio';
import type { TimelineConfig, CollisionBallsConfig } from 'sa2kit/components';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { SectionReveal } from './components/SectionReveal';
import { HomeAmbientBackground } from './components/HomeAmbientBackground';
import './home-page.css';

interface Config {
  navConfig: {
    direction: 'vertical' | 'horizontal';
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
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/homePage');
        if (!response.ok) {
          throw new Error('Failed to fetch config');
        }
        const data = await response.json();
        setConfig(data);

        if (data.navConfig.items.length > 0) {
          const firstAnchorItem = data.navConfig.items.find((item: { href: string }) =>
            item.href.startsWith('#'),
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

  useEffect(() => {
    if (!config) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      const anchorItems = config.navConfig.items.filter((item) =>
        item.href.startsWith('#'),
      );

      let currentActiveId = '';

      for (const item of anchorItems) {
        const element = document.getElementById(item.id);
        if (element) {
          const elementTop = element.offsetTop;
          const elementBottom = elementTop + element.offsetHeight;

          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            currentActiveId = item.id;
            break;
          }
        }
      }

      if (!currentActiveId && scrollPosition < 200 && anchorItems.length > 0) {
        currentActiveId = anchorItems[0].id;
      }

      if (currentActiveId && currentActiveId !== activeNavId && !isUserClicking) {
        setActiveNavId(currentActiveId);
      }
    };

    let throttleTimeout: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        handleScroll();
        throttleTimeout = null as unknown as NodeJS.Timeout;
      }, 50);
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    if (activeNavId === '') {
      handleScroll();
    }

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [config, activeNavId, isUserClicking]);

  const handleItemClick = (item: { id: string }) => {
    setIsUserClicking(true);
    setActiveNavId(item.id);

    setTimeout(() => {
      setIsUserClicking(false);
    }, 1500);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !config) {
    return <ErrorMessage message={error ?? '配置为空'} />;
  }

  const navigationConfig: NavigationConfig = {
    direction: config.navConfig.direction,
    position: config.navConfig.direction === 'vertical' ? 'left' : 'top',
    items: config.navConfig.items.map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      isExternal: item.href.startsWith('//') || item.href.startsWith('http'),
      target:
        item.href.startsWith('//') || item.href.startsWith('http')
          ? '_blank'
          : '_self',
    })),
    avatar: {
      src: config.navConfig.avatar,
      alt: '头像',
    },
  };

  return (
    <div className="home-page relative min-h-screen overflow-x-hidden text-foreground antialiased">
      <HomeAmbientBackground />

      <NavigationToggle
        isOpen={isNavOpen}
        onClick={() => setIsNavOpen(!isNavOpen)}
        position={navigationConfig.position}
      />
      <NavigationContainer
        config={navigationConfig}
        activeItemId={activeNavId}
        onItemClick={handleItemClick}
        isOpen={isNavOpen}
        onToggle={() => setIsNavOpen(!isNavOpen)}
      />

      <main className="relative min-h-screen">
        <div className="container mx-auto px-4 py-2 sm:px-6 lg:px-8">
          <SectionReveal delay={0}>
            <HomeSection
              homeConfig={config.homeConfig}
              className="!bg-transparent min-h-[min(100vh,900px)]"
            />
          </SectionReveal>

          <SectionReveal delay={100}>
            <About
              timelineConfig={config.timelineConfig}
              collisionBallsConfig={config.collisionBallsConfig}
            />
          </SectionReveal>

          <SectionReveal delay={200}>
            <ProjectCarousel
              projects={config.projectsConfig.projects}
              className="!bg-transparent py-20"
            />
          </SectionReveal>

          <SectionReveal delay={300}>
            <Contact />
          </SectionReveal>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
