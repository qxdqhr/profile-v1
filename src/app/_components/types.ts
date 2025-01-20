export interface NavItem {
    id: string;
    label: string;
    href: string;
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

export interface TimelineConfig {
    timelines: TimelineInterface[];
}

export interface TimelineItemInterface {
    date: string;
    title?: string;
    description?: string;
    tags?: string[];
}

export interface TimelineInterface {
    items: TimelineItemInterface[];
    direction?: "vertical" | "horizontal";
}


export interface CollisionBallsConfig {
    // 添加您需要的碰撞球配置字段
    balls: BallConfig[];
    width?: number;
    height?: number;
    minVelocity?: number;
    maxVelocity?: number;

}
export interface BallConfig {
    text?: string; // 球上显示的文本
    textColor?: string; // 文本颜色
    weight: number; // 球的质量
    image?: string; // 可选的图片URL
    color: string; // 球的颜色
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