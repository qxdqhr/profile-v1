 /**
 * TailwindCSS 测试模块类型定义
 */

export interface TestComponent {
    id: string
    name: string
    description: string
    category: 'layout' | 'typography' | 'colors' | 'spacing' | 'animation' | 'responsive'
  }
  
  export interface TestSection {
    title: string
    description: string
    components: TestComponent[]
  }