export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

export interface NavConfig {
  direction: "vertical" | "horizontal";
  items: NavItem[];
  avatar: string;
}

export interface HomeConfig {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage?: string;
}

export interface TimelineItem {
  date: string;
  title: string;
  description: string;
}

export interface TimelineConfig {
  items: TimelineItem[];
}

export interface CollisionBallsConfig {
  count: number;
  speed: number;
  colors: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  tags: string[];
}

export interface ProjectsConfig {
  projects: Project[];
}

export interface Config {
  navConfig: NavConfig;
  homeConfig: HomeConfig;
  timelineConfig: TimelineConfig;
  collisionBallsConfig: CollisionBallsConfig;
  projectsConfig: ProjectsConfig;
} 