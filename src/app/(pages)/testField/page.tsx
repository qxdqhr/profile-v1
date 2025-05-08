'use client';

import Link from 'next/link';
import "./index.css";
import { BackButton } from '@/app/_components/BackButton';
import { ExperimentCard } from '@/app/_components/ExperimentCard';
import { ProfileButton } from '@/utils/popWindow';

interface ExperimentItem {
    id: string;
    title: string;
    description: string;
    path: string;
    tags: string[];
}

const games: ExperimentItem[] = [
    {
        id: "exam-default",
        title: "考试系统",
        description: "通用考试系统，支持各种类型题目",
        path: "/testField/experiment",
        tags: ["考试", "问卷"]
    },
    {
        id: "exam-arknights",
        title: "明日方舟测试",
        description: "关于明日方舟游戏的知识测试",
        path: "/testField/experiment?type=arknights",
        tags: ["考试", "游戏"]
    },
    {
        id: "config-default",
        title: "通用考试配置",
        description: "配置通用考试系统的题目和设置",
        path: "/testField/experiment/config",
        tags: ["配置", "考试"]
    },
    {
        id: "config-arknights",
        title: "明日方舟配置",
        description: "配置明日方舟知识测试的题目和设置",
        path: "/testField/experiment/config?type=arknights",
        tags: ["配置", "游戏"]
    },
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
        id: "share-monitor",//diolacov
        title: " 手机投屏",
        description: "手机投屏",
        path: "/testField/ShareMonitor",
        tags: ["小游戏", "赛博无料"]
    },
    {
        id: "work-calculate",//diolacov
        title: " 工作计算器",
        description: "工作计算器",
        path: "/testField/WorkCalculate",
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

        <ProfileButton />    
        <div className="grid">
          {games.map((games) => (
            <ExperimentCard
              key={games.id}
              href={games.path}
              title={games.title}
              description={games.description}
              tags={games.tags}
            />
          ))}
        </div>
      </div>
    </div>
  );
}