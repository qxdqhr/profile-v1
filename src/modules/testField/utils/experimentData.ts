/**
 * 实验项目数据配置
 */

import type { ExperimentItem } from '../types';

export const experiments: ExperimentItem[] = [
  // 实用工具类
  {
    id: '1',
    title: '实验考试系统',
    description: '一个用于创建和管理在线考试的实验性系统',
    path: '/testField/experiment',
    tags: ['考试', '教育', '实验'],
    category: 'utility',
    isCompleted: false
  },
  {
    id: '2',
    title: '实时活动',
    description: '用于展示实时活动状态的实验性功能',
    path: '/testField/LiveActivity',
    tags: ['实时', '活动', '实验'],
    category: 'utility',
    isCompleted: false
  },
  {
    id: "config-default",
    title: "通用考试配置",
    description: "配置通用考试系统的题目和设置",
    path: "/testField/experiment/config",
    tags: ["配置", "考试"],
    category: "utility",
    isCompleted: false
  },
  {
    id: "config-arknights",
    title: "明日方舟配置",
    description: "配置明日方舟知识测试的题目和设置",
    path: "/testField/experiment/config?type=arknights",
    tags: ["配置", "游戏"],
    category: "utility",
    isCompleted: false
  },

  {
    id: "sync-text",
    title: "多端文本同步",
    description: "在多个设备间同步和共享文本内容",
    path: "/testField/SyncText",
    tags: ["同步", "剪贴板"],
    category: "utility",
    isCompleted: false
  },
  {
    id: "home-page-config",
    title: "首页配置",
    description: "首页配置",
    path: "/testField/HomePageConfig",
    tags: ["配置页面", "首页"],
    category: "utility",
    isCompleted: false
  },
  {
    id: "show-master-pieces",
    title: "艺术画集展览",
    description: "浏览各种艺术画集，支持逐页查看和画集管理",
    path: "/testField/ShowMasterPieces",
    tags: ["艺术", "画集", "展览"],
    category: "leisure",
    isCompleted: false
  },
  {
    id: "image-downloader",
    title: "图片下载器",
    description: "通过图片URL快速下载图片到本地，支持预览和自定义文件名",
    path: "/testField/ImageDownloader",
    tags: ["下载", "图片", "工具"],
    category: "utility",
    isCompleted: false
  },
  {
    id: "work-calculate",
    title: "工作计算器",
    description: "工作计算器",
    path: "/testField/WorkCalculate",
    tags: ["计算器", "工具"],
    category: "utility",
    isCompleted: false
  },

  // 休闲娱乐类
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
    tags: ["投屏", "工具"],
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
    category: "leisure",
    isCompleted: false
  },
  {
    id: "VocaloidtoGO",
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
    category: "leisure",
    isCompleted: false
  },
  {
    id: "linkGame_v1",
    title: "葱韵环京连连看_v1",
    description: "葱韵环京连连看_v1",
    path: "/testField/linkGame_v1",
    tags: ["小游戏", "葱韵环京","改进代码"],
    category: "leisure",
    isCompleted: false
  },
  {
    id: "pushBox",
    title: "推箱子",
    description: "推箱子",
    path: "/testField/pushBox",
    tags: ["小游戏", "赛博无料","初版完成"],
    category: "leisure",
    isCompleted: false
  },
  {
    id: "raceGame",
    title: " 赛车游戏",
    description: "赛车游戏",
    path: "/testField/raceGame",
    tags: ["小游戏", "赛博无料","初版完成"],
    category: "leisure",
    isCompleted: false
  },
  {
    id: "tribleGame",
    title: " 三消游戏",
    description: "三消游戏",
    path: "/testField/tribleGame",
    tags: ["小游戏", "赛博无料","初版完成"],
    category: "leisure",
    isCompleted: false
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

  // 新增模块
  {
    id: "notification",
    title: "通知中心",
    description: "查看和管理系统通知，支持筛选和操作",
    path: "/testField/notification",
    tags: ["通知", "管理", "系统"],
    category: "utility",
    isCompleted: true
  },
  {
    id: "filetransfer", 
    title: "文件中转站",
    description: "安全、快速的文件传输服务，支持文件上传和下载",
    path: "/testField/filetransfer",
    tags: ["文件", "传输", "上传", "下载"],
    category: "utility", 
    isCompleted: true
  }
];