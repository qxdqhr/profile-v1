'use client';

import { Cursor, Footer } from '@sa2kit-ui/react';
import Link from 'next/link';
import { useMemo } from 'react';
import { HomePageError } from '../Home/components/HomePageError';
import { HomePageLoading } from '../Home/components/HomePageLoading';
import { useHomePageConfig } from '../Home/hooks/useHomePageConfig';
import { useScrollSpy } from '../Home/hooks/useScrollSpy';
import type { NavItem } from '../Home/types';
import { AboutSectionV2 } from './components/AboutSectionV2';
import { ContactSectionV2 } from './components/ContactSectionV2';
import { HeroSectionV2 } from './components/HeroSectionV2';
import { HomeNavigationV2 } from './components/HomeNavigationV2';
import { HomeV2ThemeProvider } from './components/HomeV2ThemeProvider';
import { ProjectsSectionV2 } from './components/ProjectsSectionV2';
import { SectionRevealV2 } from './components/SectionRevealV2';

const HomePageV2 = () => {
  const { config, loading, error, reload } = useHomePageConfig();

  const initialActiveId = useMemo(() => {
    if (!config) return '';
    return (
      config.navConfig.items.find((item) => item.href.startsWith('#'))?.id ?? ''
    );
  }, [config]);

  const { activeId, setActiveId } = useScrollSpy(config?.navConfig.items ?? [], {
    enabled: Boolean(config),
    initialActiveId,
  });

  if (loading) {
    return <HomePageLoading />;
  }

  if (error || !config) {
    return <HomePageError message={error ?? '配置为空'} onRetry={reload} />;
  }

  const handleItemClick = (item: NavItem) => {
    setActiveId(item.id);
  };

  return (
    <HomeV2ThemeProvider>
      <Cursor>
        <div className="home-v2">
          <HomeNavigationV2
            items={config.navConfig.items}
            avatar={config.navConfig.avatar}
            activeItemId={activeId}
            onItemClick={handleItemClick}
          />

          <main className="home-v2__main">
            <SectionRevealV2 delay={0}>
              <HeroSectionV2 homeConfig={config.homeConfig} />
            </SectionRevealV2>

            <SectionRevealV2 delay={80}>
              <AboutSectionV2
                timelineConfig={config.timelineConfig}
                collisionBallsConfig={config.collisionBallsConfig}
              />
            </SectionRevealV2>

            <SectionRevealV2 delay={160}>
              <ProjectsSectionV2 projects={config.projectsConfig.projects} />
            </SectionRevealV2>

            <SectionRevealV2 delay={240}>
              <ContactSectionV2 />
            </SectionRevealV2>

            <Footer type="tree" className="home-v2__footer" />
          </main>

          <Link href="/" className="home-v2-badge" title="返回经典版首页">
            经典版
          </Link>
        </div>
      </Cursor>
    </HomeV2ThemeProvider>
  );
};

export default HomePageV2;
