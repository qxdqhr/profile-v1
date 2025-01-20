'use client';

import Link from 'next/link';
import "@/styles/index.css";
import { BackButton } from '@/app/_components/BackButton';
import { ExperimentCard } from '@/app/_components/ExperimentCard';

interface ExperimentItem {
    id: string;
    title: string;
    description: string;
    path: string;
    tags: string[];
}

const experiments: ExperimentItem[] = [
    {
        id: "live-activity",
        title: "Live Activity API",
        description: "测试 iOS 16+ Live Activity 功能",
        path: "/testField/LiveActivity",
        tags: ["iOS", "API"]
    },
    {
        id: "sync-text",
        title: "多端文本同步",
        description: "在多个设备间同步和共享文本内容",
        path: "/testField/SyncText",
        tags: ["同步", "剪贴板"]
    },
    {
        id: "miku-click",
        title: "米库点击",
        description: "测试 点击奏鸣初音未来功能 功能",
        path: "/testField/MikuClick",
        tags: ["小游戏", "赛博无料"]
    },
    {
        id: "kannot",
        title: " 坎诺特",
        description: "已有坎诺特功能",
        path: "/testField/Kannot",
        tags: ["小游戏", "赛博无料"]
    },
    {
        id: "home-page-config",
        title: " 首页配置",
        description: "首页配置",
        path: "/testField/HomePageConfig",
        tags: ["配置页面", "首页"]
    },
    {
        id: "vocaloider",//diolacov
        title: " 术力口音乐播放器",
        description: "术力口音乐播放器",
        path: "/testField/Vocaloider",
        tags: ["小游戏", "赛博无料"]
    },
    {
        id: "VocaloidtoGO",//diolacov
        title: " 博立格来冲",
        description: "博立格来冲",
        path: "/testField/VocaloidtoGO",
        tags: ["小游戏", "赛博无料"]
    },

];

export default function TestField() {
    return (
        <div className="container">
            <BackButton href="/" />
            <div className="wrapper">
                <h1 className="title">
                    实验田
                </h1>

                <div className="grid">
                    {experiments.map((experiment) => (
                        <ExperimentCard
                            key={experiment.id}
                            href={experiment.path}
                            title={experiment.title}
                            description={experiment.description}
                            tags={experiment.tags}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
