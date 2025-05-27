'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from "./testField.module.css";
import { BackButton } from '@/app/_components/BackButton';
import { ExperimentCard } from '@/app/_components/ExperimentCard';
import { classNames } from '@/utils/classNames';
import { useState, useEffect, Suspense } from 'react';

interface ExperimentItem {
    id: string;
    title: string;
    description: string;
    path: string;
    tags: string[];
    category: 'utility' | 'leisure';
}

const experiments: ExperimentItem[] = [
    {
        id: "exam-default",
        title: "考试系统",
        description: "通用考试系统，支持各种类型题目",
        path: "/testField/experiment",
        tags: ["考试", "问卷"],
        category: "utility"
    },
    {
        id: "exam-arknights",
        title: "明日方舟测试",
        description: "关于明日方舟游戏的知识测试",
        path: "/testField/experiment?type=arknights",
        tags: ["考试", "游戏"],
        category: "utility"
    },
    {
        id: "config-default",
        title: "通用考试配置",
        description: "配置通用考试系统的题目和设置",
        path: "/testField/experiment/config",
        tags: ["配置", "考试"],
        category: "utility"
    },
    {
        id: "config-arknights",
        title: "明日方舟配置",
        description: "配置明日方舟知识测试的题目和设置",
        path: "/testField/experiment/config?type=arknights",
        tags: ["配置", "游戏"],
        category: "utility"
    },
    {
        id: "live-activity",
        title: "Live Activity API",
        description: "测试 iOS 16+ Live Activity 功能",
        path: "/testField/LiveActivity",
        tags: ["iOS", "API"],
        category: "utility"
    },
    {
        id: "sync-text",
        title: "多端文本同步",
        description: "在多个设备间同步和共享文本内容",
        path: "/testField/SyncText",
        tags: ["同步", "剪贴板"],
        category: "utility"
    },
    {
        id: "home-page-config",
        title: "首页配置",
        description: "首页配置",
        path: "/testField/HomePageConfig",
        tags: ["配置页面", "首页"],
        category: "utility"
    },
    {
        id: "show-master-pieces",
        title: "艺术画集展览",
        description: "浏览各种艺术画集，支持逐页查看和画集管理",
        path: "/testField/ShowMasterPieces",
        tags: ["艺术", "画集", "展览"],
        category: "utility"
    },
    {
        id: "image-downloader",
        title: "图片下载器",
        description: "通过图片URL快速下载图片到本地，支持预览和自定义文件名",
        path: "/testField/ImageDownloader",
        tags: ["下载", "图片", "工具"],
        category: "utility"
    },
    {
        id: "vocaloider",
        title: "术力口音乐播放器",
        description: "术力口音乐播放器",
        path: "/testField/Vocaloider",
        tags: ["小游戏", "赛博无料"],
        category: "leisure"
    },
    {
        id: "share-monitor",
        title: "手机投屏",
        description: "手机投屏",
        path: "/testField/ShareMonitor",
        tags: ["小游戏", "赛博无料"],
        category: "leisure"
    },
    {
        id: "work-calculate",
        title: "工作计算器",
        description: "工作计算器",
        path: "/testField/WorkCalculate",
        tags: ["小游戏", "赛博无料"],
        category: "leisure"
    },
    {
        id: "miku-click",
        title: "米库点击",
        description: "测试 点击奏鸣初音未来功能 功能",
        path: "/testField/MikuClick",
        tags: ["小游戏", "赛博无料","新建文件夹"],
        category: "leisure"
      },
      {
        id: "kannot",
        title: " 坎诺特",
        description: "已有坎诺特功能",
        path: "/testField/Kannot",
        tags: ["小游戏", "赛博无料","初版完成","待迁移"],
        category: "leisure"
      },
      {
        id: "VocaloidtoGO",//diolacov
        title: " 博立格来冲",
        description: "博立格来冲",
        path: "/testField/VocaloidtoGO",
        tags: ["小游戏", "赛博无料","新建文件夹"],
        category: "leisure"
      },
      {
        id: "linkGame",
        title: "葱韵环京连连看",
        description: "葱韵环京连连看",
        path: "/testField/linkGame",
        tags: ["小游戏", "葱韵环京","初版完成"],
        category: "leisure"
      },
      {
        id: "linkGame_v1",
        title: "葱韵环京连连看_v1",
        description: "葱韵环京连连看_v1",
        path: "/testField/linkGame_v1",
        tags: ["小游戏", "葱韵环京","改进代码"],
        category: "leisure"
      },
      {
        id: "pushBox",
        title: "推箱子",
        description: "推箱子",
        path: "/testField/pushBox",
        tags: ["小游戏", "赛博无料","初版完成"],
        category: "leisure"
      },
      {
        id: "raceGame",
        title: " 赛车游戏",
        description: "赛车游戏",
        path: "/testField/raceGame",
        tags: ["小游戏", "赛博无料","初版完成"],
        category: "leisure"
      },
      {
        id: "tribleGame",
        title: " 三消游戏",
        description: "三消游戏",
        path: "/testField/tribleGame",
        tags: ["小游戏", "赛博无料","初版完成"],
        category: "leisure"
      },
      {
        id: "goldMiner",
        title: "黄金矿工",
        description: "金矿工",
        path: "/testField/goldMiner",
        tags: ["小游戏", "赛博无料","新建文件夹"],
        category: "leisure"
      }, 
      {
        id: "playMusic",
        title: "音乐无料",
        description: "音乐无料",
        path: "/testField/playMusic",
        tags: ["小游戏", "赛博无料","新建文件夹"],
        category: "leisure"
      },
      {
        id: "mikuPlanting",
        title: "米库种植",
        description: "米库种植",
        path: "/testField/mikuPlanting",
        tags: ["小游戏", "赛博无料","新建文件夹"],
        category: "leisure"
      },
];

type ViewMode = 'all' | 'utility' | 'leisure';

function TestFieldContent() {
    const searchParams = useSearchParams();
    const [viewMode, setViewMode] = useState<ViewMode>('all');
    // 根据 URL 参数设置视图模式
    useEffect(() => {
        const mode = searchParams.get('view') as ViewMode;
        if (mode && ['all', 'utility', 'leisure'].includes(mode)) {
            setViewMode(mode);
        }
    }, [searchParams]);
    // 过滤实验项目
    const filteredExperiments = viewMode === 'all' 
        ? experiments 
        : experiments.filter(item => item.category === viewMode);
    // 分类获取功能区和休闲区的项目
    const utilityExperiments = experiments.filter(item => item.category === 'utility');
    const leisureExperiments = experiments.filter(item => item.category === 'leisure');
    return (
        <div className={styles.container}>
            <BackButton href="/" />
            <div className={styles.wrapper}>
                <h1 className={styles.title}>实验田</h1>
                <p className={styles.description}>探索各种实验功能与休闲小游戏</p>
                {/* 标签切换 */}
                <div className={styles.tabs}>
                    <Link 
                        href="/testField" 
                        className={classNames(
                            styles.tab, 
                            viewMode === 'all' && styles.activeTab
                        )}
                    >
                        全部
                    </Link>
                    <Link 
                        href="/testField?view=utility" 
                        className={classNames(
                            styles.tab, 
                            viewMode === 'utility' && styles.activeTab
                        )}
                    >
                        功能区
                    </Link>
                    <Link 
                        href="/testField?view=leisure" 
                        className={classNames(
                            styles.tab, 
                            viewMode === 'leisure' && styles.activeLeisureTab
                        )}
                    >
                        休闲区
                    </Link>
                </div>
                {/* 显示全部时，分别显示功能区和休闲区 */}
                {viewMode === 'all' && (
                    <>
                        {/* 功能区 */}
                        <div className={styles.section}>
                            <h2 className={classNames(styles.subtitle, styles.utilityTitle)}>功能区</h2>
                            <div className={styles.grid}>
                                {utilityExperiments.map((experiment) => (
                                    <ExperimentCard
                                        key={experiment.id}
                                        href={experiment.path}
                                        title={experiment.title}
                                        description={experiment.description}
                                        tags={experiment.tags}
                                        category="utility"
                                    />
                                ))}
                            </div>
                        </div>
                        {/* 休闲区 */}
                        <div className={styles.section}>
                            <h2 className={classNames(styles.subtitle, styles.leisureTitle)}>休闲区</h2>
                            <div className={styles.grid}>
                                {leisureExperiments.map((experiment) => (
                                    <ExperimentCard
                                        key={experiment.id}
                                        href={experiment.path}
                                        title={experiment.title}
                                        description={experiment.description}
                                        tags={experiment.tags}
                                        category="leisure"
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
                {/* 仅显示单个类别 */}
                {viewMode !== 'all' && (
                    <div className={styles.grid}>
                        {filteredExperiments.map((experiment) => (
                            <ExperimentCard
                                key={experiment.id}
                                href={experiment.path}
                                title={experiment.title}
                                description={experiment.description}
                                tags={experiment.tags}
                                category={experiment.category}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TestField() {
    return (
        <Suspense>
            <TestFieldContent />
        </Suspense>
    );
}