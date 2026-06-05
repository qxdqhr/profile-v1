import type { CollisionBallsConfig, TimelineConfig } from 'sa2kit/components';

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface HomeConfig {
  title: string;
  subtitle: string;
  buttons: Array<{ text: string; link: string }>;
  imageSrc: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  tags: string[];
  link?: string;
}

export interface HomePageConfig {
  navConfig: {
    direction: 'vertical' | 'horizontal';
    items: NavItem[];
    avatar: string;
  };
  homeConfig: HomeConfig;
  timelineConfig: TimelineConfig;
  collisionBallsConfig: CollisionBallsConfig;
  projectsConfig: {
    projects: ProjectItem[];
  };
}
