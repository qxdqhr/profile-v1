# 移动端考试系统

这是一个为移动端设计的在线考试系统，主要支持单选题和多选题，同时提供了良好的扩展性以支持其他题型。

## 功能特点

- 支持单选题和多选题
- 支持题目和选项显示图片
- 自适应移动端设备
- 题目导航和跳转功能
- 考试剩余时间显示
- 已答题和未答题状态显示
- 题目列表快速导航

## 项目结构

### 核心文件
- `types.ts` - 定义了题目类型和数据结构
- `mockData.ts` - 包含示例题目数据
- `page.tsx` - 主要的考试页面组件
- `styles.css` - 样式文件

### 组件化结构
- `components/` - 包含所有UI组件
  - `Question.tsx` - 根据题目类型渲染不同的题目组件
  - `QuestionContent.tsx` - 显示题目内容和图片
  - `OptionsList.tsx` - 显示选择题选项
  - `QuestionHeader.tsx` - 显示题目标题和分数信息
  - `QuestionTypeTag.tsx` - 显示题目类型标签
  - `Navigation.tsx` - 导航控制组件
  - `StatusBar.tsx` - 状态栏组件
  - `QuestionList.tsx` - 题目列表弹窗组件
  - `SubmitButton.tsx` - 提交答案按钮组件
  - `index.ts` - 导出所有组件

### 状态管理
- `context/` - 包含状态管理逻辑
  - `ExamContext.tsx` - 考试上下文提供者和钩子

## 数据模型

系统定义了多种题型的接口，便于扩展：

- `SingleChoiceQuestion` - 单选题
- `MultipleChoiceQuestion` - 多选题
- `FillBlankQuestion` - 填空题 (预留)
- `ShortAnswerQuestion` - 简答题 (预留)
- `EssayQuestion` - 论述题 (预留)

每种题型都继承自基础的 `BaseQuestion` 接口，包含通用属性如题目内容、分值等。

## 扩展新题型的步骤

要添加新的题型，请按照以下步骤操作：

1. 在 `types.ts` 中确保题型已在 `QuestionType` 枚举中定义
2. 为新题型创建对应的接口，继承自 `BaseQuestion`
3. 创建新的题型组件，如 `FillBlankAnswer.tsx`
4. 在 `Question.tsx` 中添加对新题型的条件渲染
5. 更新 `mockData.ts` 添加新题型的示例数据

## 移动端适配

- 使用自适应布局确保在不同尺寸的移动设备上都有良好的显示效果
- 针对触摸操作优化的交互设计
- 为全面屏手机提供底部安全区域
- 图片尺寸根据设备大小自动调整

## 未来扩展

系统设计支持以下扩展：

- 实现其他题型如填空题、简答题等
- 添加题目标记和笔记功能
- 增加考试提交后的答案分析和成绩报告
- 集成到服务端获取真实题目数据 