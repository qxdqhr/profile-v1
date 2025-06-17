'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BackButton from '@/components/BackButton';
import ExperimentCard from '@/components/ExperimentCard';
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
        id: '1',
        title: '实验考试系统',
        description: '一个用于创建和管理在线考试的实验性系统',
        path: '/testField/experiment',
        tags: ['考试', '教育', '实验'],
        category: 'utility'
    },
    {
        id: '2',
        title: '实时活动',
        description: '用于展示实时活动状态的实验性功能',
        path: '/testField/LiveActivity',
        tags: ['实时', '活动', '实验'],
        category: 'utility'
    },
    {
        id: '3',
        title: '画集展览',
        description: '展示和管理艺术画集的实验性功能',
        path: '/testField/ShowMasterPieces',
        tags: ['艺术', '展览', '实验'],
        category: 'leisure'
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
             {
                id: '4',
                title: '画集展览',
                description: '展示和管理艺术画集的实验性功能',
                path: '/testField/ShowMasterPieces',
                tags: ['艺术', '展览', '实验'],
                category: 'leisure'
            }
];

function TestFieldContent() {
    const searchParams = useSearchParams();
    const [viewMode, setViewMode] = useState<'all' | 'utility' | 'leisure'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // 从 URL 参数中获取视图模式
    useEffect(() => {
        const mode = searchParams.get('mode') as 'all' | 'utility' | 'leisure';
        if (mode) {
            setViewMode(mode);
        }
    }, [searchParams]);

    // 过滤实验项目
    const filteredExperiments = experiments.filter(experiment => {
        const matchesViewMode = viewMode === 'all' || experiment.category === viewMode;
        const matchesSearch = experiment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            experiment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            experiment.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesViewMode && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 顶部导航 */}
                <div className="mb-8">
                    <BackButton />
                </div>

                {/* 页面标题 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">实验田</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        在这里，你可以尝试各种实验性的功能和项目
                    </p>
                </div>

                {/* 搜索和筛选 */}
                <div className="mb-8 space-y-4">
                    {/* 搜索框 */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="搜索实验项目..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* 视图模式切换 */}
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setViewMode('all')}
                            className={`px-4 py-2 rounded-lg ${
                                viewMode === 'all'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            全部
                        </button>
                        <button
                            onClick={() => setViewMode('utility')}
                            className={`px-4 py-2 rounded-lg ${
                                viewMode === 'utility'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            实用工具
                        </button>
                        <button
                            onClick={() => setViewMode('leisure')}
                            className={`px-4 py-2 rounded-lg ${
                                viewMode === 'leisure'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            休闲娱乐
                        </button>
                    </div>
                </div>

                {/* 实验项目列表 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                {/* 空状态 */}
                {filteredExperiments.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">没有找到匹配的实验项目</p>
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