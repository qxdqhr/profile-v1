/**
 * MMDCameraControl 组件特定类型
 */

export interface MMDCameraControlProps {
  // ===== 回调函数（必需）=====
  /** 相机移动回调（旋转视角）*/
  onCameraMove: (deltaX: number, deltaY: number) => void
  /** 相机缩放回调（改变距离）*/
  onCameraZoom: (delta: number) => void
  /** 相机升降回调（Z轴移动）*/
  onCameraElevate: (delta: number) => void
  /** 重置相机回调 */
  onCameraReset: () => void
  
  // ===== UI 配置 =====
  /** 控制器位置（默认: 'bottom-right'）*/
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** 控制器大小（默认: 'medium'）*/
  size?: 'small' | 'medium' | 'large'
  /** 主题（默认: 'dark'）*/
  theme?: 'light' | 'dark' | 'auto'
  
  // ===== 功能开关 =====
  /** 是否显示虚拟摇杆（默认: true）*/
  showJoystick?: boolean
  /** 是否显示缩放按钮（默认: true）*/
  showZoomButtons?: boolean
  /** 是否显示升降按钮（默认: true）*/
  showElevateButtons?: boolean
  /** 是否显示重置按钮（默认: true）*/
  showResetButton?: boolean
  
  // ===== 灵敏度配置 =====
  /** 移动灵敏度（默认: 0.03）*/
  moveSensitivity?: number
  /** 缩放灵敏度（默认: 0.5）*/
  zoomSensitivity?: number
  /** 升降灵敏度（默认: 0.5）*/
  elevateSensitivity?: number
  
  // ===== 样式配置 =====
  /** 容器类名 */
  className?: string
  /** 容器样式 */
  style?: React.CSSProperties
  
  // ===== 调试配置 =====
  /** 是否启用调试模式 */
  debugMode?: boolean
}

/**
 * 控制器尺寸配置
 */
export interface ControlSizeConfig {
  /** 基座半径 */
  baseRadius: number
  /** 摇杆半径 */
  joystickRadius: number
  /** 按钮尺寸 */
  buttonSize: number
  /** 间距 */
  gap: number
}

/**
 * 控制器主题配置
 */
export interface ControlThemeConfig {
  /** 基座背景色 */
  baseBackground: string
  /** 基座边框色 */
  baseBorder: string
  /** 摇杆背景色 */
  joystickBackground: string
  /** 按钮背景色 */
  buttonBackground: string
  /** 按钮文字色 */
  buttonText: string
  /** 高亮色 */
  highlightColor: string
}
