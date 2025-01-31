'use client';

import Link from 'next/link';
import "@/styles/index.css";
import { BackButton } from '@/app/_components/BackButton';
import { ExperimentCard } from '@/app/_components/ExperimentCard';
import LinkGame from './linkGame/page'

interface ExperimentItem {
    id: string;
    title: string;
    description: string;
    path: string;
    tags: string[];
}

const games: ExperimentItem[] = [
    {
        id: "miku-click",
        title: "米库点击",
        description: "测试 点击奏鸣初音未来功能 功能",
        path: "/gameField/MikuClick",
        tags: ["小游戏", "赛博无料","新建文件夹"]
    },
    {
        id: "kannot",
        title: " 坎诺特",
        description: "已有坎诺特功能",
        path: "/gameField/Kannot",
        tags: ["小游戏", "赛博无料","初版完成","待迁移"]
    },
    {
        id: "VocaloidtoGO",//diolacov
        title: " 博立格来冲",
        description: "博立格来冲",
        path: "/gameField/VocaloidtoGO",
        tags: ["小游戏", "赛博无料","新建文件夹"]
    },
    {
        id: "linkGame",
        title: "葱韵环京连连看",
        description: "葱韵环京连连看",
        path: "/gameField/linkGame",
        tags: ["小游戏", "葱韵环京","初版完成"]
    },
    {
        id: "pushBox",
        title: "推箱子",
        description: "推箱子",
        path: "/gameField/pushBox",
        tags: ["小游戏", "赛博无料","初版完成"]
    },
    {
        id: "raceGame",
        title: " 赛车游戏",
        description: "赛车游戏",
        path: "/gameField/raceGame",
        tags: ["小游戏", "赛博无料","初版完成"]
    },

];

export default function GameField() {
    return (
        <div className="container">
            <BackButton href="/" />
            <div className="wrapper">
                <h1 className="title">
                    实验田
                </h1>

                <div className="grid">
                    {games.map((game) => (
                        <ExperimentCard
                            key={game.id}
                            href={game.path}
                            title={game.title}
                            description={game.description}
                            tags={game.tags}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
