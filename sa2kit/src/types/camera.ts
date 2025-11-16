/**
 * 相机相关类型定义
 */

import * as THREE from 'three'

/**
 * 相机配置
 */
export interface CameraConfig {
  /** 初始位置 */
  position: [number, number, number]
  /** 初始目标点 */
  target: [number, number, number]
  /** 视角（FOV）*/
  fov?: number
  /** 近裁剪面 */
  near?: number
  /** 远裁剪面 */
  far?: number
  /** 最小距离 */
  minDistance?: number
  /** 最大距离 */
  maxDistance?: number
}

/**
 * 相机状态
 */
export interface CameraState {
  /** 当前位置 */
  position: THREE.Vector3
  /** 当前目标点 */
  target: THREE.Vector3
  /** 当前缩放级别 */
  zoom: number
  /** 当前距离 */
  distance: number
}

/**
 * 相机控制配置
 */
export interface CameraControlConfig {
  /** 移动灵敏度（默认: 0.03）*/
  moveSensitivity?: number
  /** 缩放灵敏度（默认: 0.5）*/
  zoomSensitivity?: number
  /** 升降灵敏度（默认: 0.5）*/
  elevateSensitivity?: number
  /** 是否启用阻尼（惯性）（默认: true）*/
  enableDamping?: boolean
  /** 阻尼系数（默认: 0.05）*/
  dampingFactor?: number
}

