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
    isCompleted: false,
    createdAt: '2023-01-15',
    updatedAt: '2023-06-20'
  },
  // 新增悬浮菜单演示
  {
    id: 'floating-menu',
    title: '可拖动悬浮菜单',
    description: '一个可在页面任意位置拖动的悬浮菜单，根据位置自动调整弹出方向',
    path: '/testField/FloatingMenuDemo',
    tags: ['UI组件', '交互', '菜单'],
    category: 'utility',
    isCompleted: true,
    createdAt: '2023-08-15',
    updatedAt: '2023-08-15'
  },
  {
    id: '2',
    title: '实时活动',
    description: '用于展示实时活动状态的实验性功能',
    path: '/testField/LiveActivity',
    tags: ['实时', '活动', '实验'],
    category: 'utility',
    isCompleted: false,
    createdAt: '2023-02-10',
    updatedAt: '2023-07-05'
  },
  {
    id: "config-default",
    title: "通用考试配置",
    description: "配置通用考试系统的题目和设置",
    path: "/testField/experiment/config",
    tags: ["配置", "考试"],
    category: "utility",
    isCompleted: false,
    createdAt: '2023-01-20',
    updatedAt: '2023-05-15'
  },
  {
    id: "config-arknights",
    title: "明日方舟配置",
    description: "配置明日方舟知识测试的题目和设置",
    path: "/testField/experiment/config?type=arknights",
    tags: ["配置", "游戏"],
    category: "utility",
    isCompleted: false,
    createdAt: '2023-02-05',
    updatedAt: '2023-04-10'
  },

  {
    id: "sync-text",
    title: "多端文本同步",
    description: "在多个设备间同步和共享文本内容",
    path: "/testField/SyncText",
    tags: ["同步", "剪贴板"],
    category: "utility",
    isCompleted: false,
    createdAt: '2023-03-12',
    updatedAt: '2023-08-01'
  },
  {
    id: "home-page-config",
    title: "首页配置",
    description: "首页配置",
    path: "/homePage/config",
    tags: ["配置页面", "首页"],
    category: "utility",
    isCompleted: false,
    createdAt: '2023-01-05',
    updatedAt: '2023-07-28'
  },
  {
    id: "show-master-pieces",
    title: "艺术画集展览",
    description: "浏览各种艺术画集，支持逐页查看和画集管理",
    path: "/showmasterpiece",
    tags: ["艺术", "画集", "展览"],
    category: "utility",
    isCompleted: false,
    createdAt: '2023-04-18',
    updatedAt: '2023-08-10'
  },
  {
    id: "show-master-pieces-config",
    title: "艺术画集管理后台",
    description: "艺术画集展览的管理后台，包括画集管理、作品管理、预订管理等功能，需要管理员权限",
    path: "/showmasterpiece/config",
    tags: ["艺术", "画集", "管理", "后台", "预订"],
    category: "utility",
    isCompleted: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
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
    id: "comfy-prompt",
    title: "ComfyUI 管理",
    description: "提示词资产 + 远程运行：管理提示词/工作流 JSON，经后端代理提交 ComfyUI 任务（v1 HTTP 轮询出图）",
    path: "/testField/comfyPrompt/prompts",
    tags: ["ComfyUI", "AI绘画", "提示词", "工作流", "Stable Diffusion"],
    category: "utility",
    isCompleted: true,
    createdAt: '2026-06-09',
    updatedAt: '2026-06-09'
  },
  {
    id: "mmd-test-playground",
    title: "MMD 功能测试场",
    description: "基于 sa2kit/business/mmd 的MMD播放器测试页面，封装所有逻辑，仅需传入配置即可使用",
    path: "/testField/mmdTest",
    tags: ["3D", "MMD", "测试", "SA2Kit"],
    category: "utility",
    isCompleted: true,
    createdAt: '2025-11-21',
    updatedAt: '2025-11-21'
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
  {
    id: "ticket-monitor",
    title: "开票信息聚合监控",
    description: "后台定时同步开票数据，飞书通知新演出与截止提醒，支持多档天数与平台配置",
    path: "/testField/ticketMonitor",
    tags: ["开票", "聚合", "票务", "动漫演出"],
    category: "utility",
    isCompleted: false,
    createdAt: "2026-03-08",
    updatedAt: "2026-03-08"
  },
  {
    id: "fitness-plan",
    title: "健身计划",
    description: "训练计划、日历排期、力量/有氧记录、饮食截图、跨模块打卡与数据统计（animal-island-ui）",
    path: "/testField/fitnessPlan",
    tags: ["健身", "训练", "饮食", "打卡", "计划"],
    category: "utility",
    isCompleted: false,
    createdAt: "2026-06-08",
    updatedAt: "2026-06-08"
  },
  {
    id: "node-notes",
    title: "节点笔记",
    description: "多文档节点图谱：有向连线、Markdown 导入导出、画布 PNG 导出",
    path: "/testField/nodeNotes",
    tags: ["笔记", "知识图谱", "画布", "Markdown", "导入导出"],
    category: "utility",
    isCompleted: false,
    createdAt: "2026-07-11",
    updatedAt: "2026-07-11"
  },

  {
    id: "vocaloider",
    title: "术力口音乐播放器",
    description: "术力口音乐播放器",
    path: "/testField/Vocaloider",
    tags: ["音乐", "播放器", "工具"],
    category: "utility"
  },
  {
    id: "share-monitor",
    title: "手机投屏",
    description: "手机投屏",
    path: "/testField/ShareMonitor",
    tags: ["投屏", "工具"],
    category: "utility"
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
    id: "skillManager",
    title: "Skill 管理平台",
    description: "管理本地与在线 Skill，支持预览、编辑、上传与同步",
    path: "/testField/skillManager",
    tags: ["Skill", "管理", "上传", "同步"],
    category: "utility",
    isCompleted: false
  },
  {
    id: "teach-hub",
    title: "Teach 学习工作区",
    description: "每人独立的 teach skill 工作区：管理 Mission、学习 HTML 课时、追踪进度，后续支持 Mimo 续备下一课",
    path: "/teach-hub",
    tags: ["教育", "乐理", "学习", "teach", "AI"],
    category: "utility",
    isCompleted: false,
    createdAt: "2026-06-15",
    updatedAt: "2026-06-15"
  },
  {
    id: "calendar",
    title: "日历管理",
    description: "企业级日历应用，具备完整的事件管理、智能提醒、重复事件、事件搜索等高级功能。支持月/周/日视图切换，具备导入导出、时区支持、响应式设计等现代化特性。现已集成用户认证系统，支持登录/登出、用户菜单、认证守卫等功能",
    path: "/calendar",
    tags: ["日历", "事件管理", "智能提醒", "重复事件", "搜索过滤", "企业级", "用户认证", "登录系统"],
    category: "utility",
    isCompleted: true
  },
  {
    id: "mikutap-config",
    title: "Mikutap 配置管理",
    description: "Mikutap音乐互动游戏的配置管理界面，支持网格布局自定义、音效设置、动画效果配置（脉冲、滑动、弹跳、闪烁、旋转、缩放、涟漪、自定义Lottie）、数据库持久化存储，可创建和管理多种配置预设",
    path: "/testField/mikutap/config",
    tags: ["配置", "管理", "音效", "动画", "Lottie", "数据库", "持久化", "预设"],
    category: "utility",
    isCompleted: true
  },
  {
    id: "mmd-test",
    title: "MMD 功能测试",
    description: "测试和验证 SA2Kit MMD 库的各项功能，包括模型加载、动画播放、相机控制、React Hooks 等。支持多种测试模式，提供详细的状态信息和调试工具",
    path: "/testField/mmdTest",
    tags: ["MMD", "3D", "测试", "SA2Kit", "Three.js", "开发工具"],
    category: "utility",
    isCompleted: false,
    createdAt: '2025-11-15',
    updatedAt: '2025-11-15'
  },
  {
    id: "mmd-upload",
    title: "MMD 资源上传",
    description: "上传 MMD 模型、动作、音频等资源到阿里云 OSS，获取 CDN 加速链接。支持拖拽上传、批量上传、进度显示，提供原始 URL 和 CDN URL，用于测试和优化 MMD 资源加载速度",
    path: "/testField/mmdUpload",
    tags: ["MMD", "上传", "OSS", "CDN", "文件管理", "开发工具"],
    category: "utility",
    isCompleted: true,
    createdAt: '2025-11-23',
    updatedAt: '2025-11-23'
  },
  {
    id: "mmd-playlist",
    title: "MMD 播放列表",
    description: "测试 MMD 播放列表功能，支持多个 MMD 场景的连续播放、节点管理、预加载优化等。可以配置播放列表、添加/删除节点、调整播放顺序",
    path: "/testField/mmdPlaylist",
    tags: ["MMD", "播放列表", "3D", "测试", "SA2Kit"],
    category: "utility",
    isCompleted: true,
    createdAt: '2025-11-23',
    updatedAt: '2025-11-23'
  },
  {
    id: "audio-detection-test",
    title: "SA2Kit 音频检测器",
    description: "调试 sa2kit 新增的音频检测模块，涵盖预设 UI、Hook 沙盒和参数调节器，便于验证音符与和弦识别表现",
    path: "/testField/audio-detection-test",
    tags: ["音频", "检测", "SA2Kit", "实验"],
    category: "utility",
    isCompleted: false,
    createdAt: '2025-12-06',
    updatedAt: '2025-12-06'
  },
  {
    id: "miku-contest",
    title: "Miku Contest 供稿系统",
    description: "测试 sa2kit/business/mikuContest 的观众端、画师端、管理员端页面骨架与路由联通",
    path: "/testField/mikuContest",
    tags: ["SA2Kit", "投稿", "投票", "管理后台"],
    category: "utility",
    isCompleted: true,
    createdAt: '2026-03-11',
    updatedAt: '2026-03-11'
  },
  {
    id: "huarongdao-config",
    title: "图片华容道（配置后台）",
    description: "测试 huarongdao 多套配置管理页面（名称、slug、图片、网格参数）",
    path: "/testField/huarongdao/config",
    tags: ["SA2Kit", "华容道", "配置后台"],
    category: "utility",
    isCompleted: true,
    createdAt: '2026-03-11',
    updatedAt: '2026-03-11'
  },
  {
    id: "festival-card-config",
    title: "节日贺卡配置中心",
    description: "管理多套节日贺卡配置，支持 /festivalCard/config + cardId 参数跳转主页面",
    path: "/testField/festivalCard/config",
    tags: ["SA2Kit", "配置中心", "节日贺卡"],
    category: "utility",
    isCompleted: true,
    createdAt: '2026-03-02',
    updatedAt: '2026-03-02'
  },
  {
    id: "ar-module-test",
    title: "AR 模块测试",
    description: "基于 sa2kit 的 AR 模块测试页面，用于验证摄像头、平面放置和模型播放链路",
    path: "/testField/ar",
    tags: ["SA2Kit", "AR", "测试", "摄像头"],
    category: "utility",
    isCompleted: true,
    createdAt: '2026-03-06',
    updatedAt: '2026-03-06'
  },
  {
    id: "xfyun-asr-test",
    title: "讯飞语音识别测试",
    description: "基于 iFlytek WebSocket 听写接口的语音识别测试台，用于验证 sa2kit 的语音链路",
    path: "/testField/xunfeiAsr",
    tags: ["SA2Kit", "语音识别", "讯飞", "测试"],
    category: "utility",
    isCompleted: true,
    createdAt: '2026-02-21',
    updatedAt: '2026-02-21'
  },
  {
    id: "qr-code-generator",
    title: "二维码生成器",
    description: "将任意 URL 或字符串转换为二维码图片，支持自定义尺寸、颜色、纠错级别，可下载 PNG/SVG",
    path: "/testField/qrCode",
    tags: ["工具", "二维码", "QR码", "图片"],
    category: "utility",
    isCompleted: true,
    createdAt: '2026-04-25',
    updatedAt: '2026-04-25'
  },
  {
    id: "date-calculator",
    title: "日期计算器",
    description: "计算两个日期的自然日间隔与年月日分解，或在基准日期上加减天/周/月/年",
    path: "/testField/dateCalculator",
    tags: ["工具", "日期", "时间", "计算器"],
    category: "utility",
    isCompleted: true,
    createdAt: '2026-05-06',
    updatedAt: '2026-05-06'
  }
];
