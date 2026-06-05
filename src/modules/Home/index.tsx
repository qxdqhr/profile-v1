'use client';

import 'animal-island-ui/style';

import { Cursor, Footer } from 'animal-island-ui';
import { useMemo, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { HeroSection } from './components/HeroSection';
import { HomeNavigation } from './components/HomeNavigation';
import { HomePageError } from './components/HomePageError';
import { HomePageLoading } from './components/HomePageLoading';
import { ProjectsSection } from './components/ProjectsSection';
import { SectionReveal } from './components/SectionReveal';
import { useHomePageConfig } from './hooks/useHomePageConfig';
import { useScrollSpy } from './hooks/useScrollSpy';
import type { NavItem } from './types';
import './home-page.css';

const HomePage = () => {
  const { config, loading, error, reload } = useHomePageConfig();
  const [isNavOpen, setIsNavOpen] = useState(false);

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
    <Cursor>
      <div className="home-page">
        <HomeNavigation
          items={config.navConfig.items}
          avatar={config.navConfig.avatar}
          activeItemId={activeId}
          isOpen={isNavOpen}
          onToggle={() => setIsNavOpen((open) => !open)}
          onItemClick={handleItemClick}
        />

        <main className="home-page__main">
          <SectionReveal delay={0}>
            <HeroSection homeConfig={config.homeConfig} />
          </SectionReveal>

          <SectionReveal delay={100}>
            <AboutSection
              timelineConfig={config.timelineConfig}
              collisionBallsConfig={config.collisionBallsConfig}
            />
          </SectionReveal>

          <SectionReveal delay={200}>
            <ProjectsSection projects={config.projectsConfig.projects} />
          </SectionReveal>

          <SectionReveal delay={300}>
            <ContactSection />
          </SectionReveal>

          <Footer type="tree" className="home-page__footer" />
        </main>
      </div>
    </Cursor>
  );
};

export default HomePage;
