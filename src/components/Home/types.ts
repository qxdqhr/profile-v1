export interface NavItem {
    id: string;
    label: string;
    href: string;
    children?: NavItem[];
}

export interface NavConfig {
    direction: "vertical" | "horizontal";
    items: NavItem[];
    avatar: string;
}

export interface HomeConfig {
    // 添加您需要的首页配置字段
    title: string;
    subtitle: string;
    buttons: Array<{
        text: string;
        link: string;
    }>;
    imageSrc: string;
}

export interface TimelineItem {
    id: string;
    title: string;
    date: string;
    description: string;
    tags?: string[];
}

export interface TimelineConfig {
    items: TimelineItem[];
}

export interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    text?: string;
    isDragging?: boolean;
}

export interface CollisionBallsConfig {
    balls: {
        id: string;
        label: string;
        color: string;
        size: number;
    }[];
    width: number;
    height: number;
}

export interface ProjectConfig {
    // 添加您需要的项目配置字段
    projects: any[]; // 根据实际项目结构定义具体类型
}

export interface Config {
    navConfig: NavConfig;
    homeConfig: HomeConfig;
    timelineConfig: TimelineConfig;
    collisionBallsConfig: CollisionBallsConfig;
    projectsConfig: ProjectConfig;
} 