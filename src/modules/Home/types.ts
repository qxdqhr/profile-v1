import type { CollisionBallsConfig } from 'sa2kit/components';

export interface HomeTimelineItem {
  id?: string;
  date: string;
  title: string;
  description: string;
  tags?: string[];
}

export interface HomeTimelineConfig {
  items: HomeTimelineItem[];
}

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

export interface HomeContactConfig {
  feishuWebhookUrl: string | null;
  feishuSignSecret: string | null;
  qqUserId: number | null;
  qqGroupId: number | null;
}

export interface HomePageConfig {
  navConfig: {
    direction: 'vertical' | 'horizontal';
    items: NavItem[];
    avatar: string;
  };
  homeConfig: HomeConfig;
  timelineConfig: HomeTimelineConfig;
  collisionBallsConfig: CollisionBallsConfig;
  projectsConfig: {
    projects: ProjectItem[];
  };
  contactConfig: HomeContactConfig;
}
