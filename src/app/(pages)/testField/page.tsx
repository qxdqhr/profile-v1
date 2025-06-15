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