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
  {
    id: "idea-list",
    title: "想法清单",
    description: "管理和组织各种想法的清单工具，支持多个清单、优先级设置、标签分类和完成状态跟踪",
    path: "/testField/ideaList",
    tags: ["想法", "清单", "待办事项", "管理"],
    category: "utility",
    isCompleted: false
  },
  {
    id: "mmd-viewer",
    title: "MMD模型查看器",
    description: "基于Three.js的MMD(MikuMikuDance)模型查看器，支持PMD/PMX模型格式和VMD动画播放",
    path: "/testField/mmdViewer",
    tags: ["3D", "MMD", "Three.js", "模型", "动画"],
    category: "leisure",
    isCompleted: false
  },
  {
    id: "card-maker",
    title: "名片制作器",
    description: "移动端名片制作工具，支持角色头像、背景图片、文字编辑等功能，可创建个性化名片",
    path: "/testField/cardMaker",
    tags: ["名片", "设计", "移动端", "编辑器", "个性化"],
    category: "utility",
    isCompleted: false
  },
  {
    id: "tailwind-test",
    title: "TailwindCSS 测试场",
    description: "专门用于测试和学习TailwindCSS的实验模块，包含各种样式特性的示例和测试用例",
    path: "/testField/tailwindTest",
    tags: ["TailwindCSS", "样式", "测试", "学习", "CSS"],
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
  },
  {
    id: "calendar",
    title: "日历管理",
    description: "企业级日历应用，具备完整的事件管理、智能提醒、重复事件、事件搜索等高级功能。支持月/周/日视图切换，具备导入导出、时区支持、响应式设计等现代化特性",
    path: "/testField/calendar",
    tags: ["日历", "事件管理", "智能提醒", "重复事件", "搜索过滤", "企业级"],
    category: "utility",
    isCompleted: true
  },
  {
    id: "solar-system",
    title: "实时太阳系",
    description: "基于真实天文数据的太阳系3D可视化，使用Three.js展示太阳和八大行星的实时位置与轨道运动。支持时间控制、行星信息查看、轨道可视化等功能",
    path: "/testField/solarSystem",
    tags: ["太阳系", "3D", "Three.js", "天文", "可视化", "实时"],
    category: "leisure",
    isCompleted: true
  }
];