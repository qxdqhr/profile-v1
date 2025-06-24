/**
 * MMD模块类型定义
 */

import * as THREE from 'three';

// ===== 基础数据类型 =====

/** MMD模型信息 */
export interface MMDModel {
  id: string;
  name: string;
  description?: string;
  filePath: string;
  thumbnailPath?: string;
  fileSize: number;
  uploadTime: Date;
  format: 'pmd' | 'pmx';
  userId?: string;
  tags?: string[];
  isPublic: boolean;
  downloadCount: number;
}

/** MMD动画信息 */
export interface MMDAnimation {
  id: string;
  name: string;
  description?: string;
  filePath: string;
  fileSize: number;
  uploadTime: Date;
  duration: number; // 动画时长(秒)
  frameCount: number;
  userId?: string;
  tags?: string[];
  isPublic: boolean;
  compatibleModels?: string[]; // 兼容的模型ID列表
}

/** MMD音频信息 */
export interface MMDAudio {
  id: string;
  name: string;
  filePath: string;
  fileSize: number;
  uploadTime: Date;
  duration: number;
  format: 'wav' | 'mp3' | 'ogg';
  userId?: string;
}

/** MMD场景配置 */
export interface MMDScene {
  id: string;
  name: string;
  description?: string;
  modelId: string;
  animationId?: string;
  audioId?: string;
  cameraPosition: THREE.Vector3;
  cameraTarget: THREE.Vector3;
  lighting: {
    ambientLight: {
      color: string;
      intensity: number;
    };
    directionalLight: {
      color: string;
      intensity: number;
      position: THREE.Vector3;
    };
  };
  background: {
    type: 'color' | 'image' | 'skybox';
    value: string;
  };
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== 表单数据类型 =====

/** 模型上传表单数据 */
export interface ModelUploadFormData {
  name: string;
  description?: string;
  tags?: string[];
  isPublic: boolean;
  file: File;
  thumbnail?: File;
}

/** 动画上传表单数据 */
export interface AnimationUploadFormData {
  name: string;
  description?: string;
  tags?: string[];
  isPublic: boolean;
  file: File;
  compatibleModels?: string[];
}

/** 场景保存表单数据 */
export interface SceneSaveFormData {
  name: string;
  description?: string;
  modelId: string;
  animationId?: string;
  audioId?: string;
}

// ===== 组件Props类型 =====

/** MMD查看器组件Props */
export interface MMDViewerProps {
  className?: string;
  modelId?: string;
  animationId?: string;
  audioId?: string;
  autoPlay?: boolean;
  controls?: boolean;
  width?: number | string;
  height?: number | string;
  onLoad?: (model: THREE.Object3D) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  // 本地文件数据支持（用于前端直接解析，不上传到服务器）
  localFileData?: {
    file: File;
    arrayBuffer: ArrayBuffer;
    name: string;
    // 纹理文件支持
    textureFiles?: Map<string, File>;
  } | null;
}

/** 动画控制面板Props */
export interface AnimationControlProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onReset: () => void;
}

/** 模型管理器Props */
export interface ModelManagerProps {
  models: MMDModel[];
  selectedModelId?: string;
  onModelSelect: (modelId: string) => void;
  onModelUpload: (formData: ModelUploadFormData) => Promise<void>;
  onModelDelete: (modelId: string) => Promise<void>;
  isLoading?: boolean;
}

/** 文件上传器Props */
export interface FileUploaderProps {
  accept: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  onUpload: (files: File[]) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

// ===== Hook返回类型 =====

/** MMD加载器Hook返回类型 */
export interface UseMMDLoaderReturn {
  model: THREE.Object3D | null;
  animation: THREE.AnimationMixer | null;
  isLoading: boolean;
  error: Error | null;
  progress: number;
  loadModel: (modelPath: string) => Promise<void>;
  loadAnimation: (animationPath: string) => Promise<void>;
  cleanup: () => void;
}

/** 动画控制Hook返回类型 */
export interface UseAnimationReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setLoop: (loop: boolean) => void;
  setSpeed: (speed: number) => void;
}

/** 文件上传Hook返回类型 */
export interface UseFileUploadReturn {
  isUploading: boolean;
  progress: number;
  error: Error | null;
  uploadModel: (formData: ModelUploadFormData) => Promise<MMDModel>;
  uploadAnimation: (formData: AnimationUploadFormData) => Promise<MMDAnimation>;
  uploadAudio: (file: File, name: string) => Promise<MMDAudio>;
}

// ===== 服务类型 =====

/** MMD服务接口 */
export interface MMDService {
  // 模型相关
  getModels(): Promise<MMDModel[]>;
  getModel(id: string): Promise<MMDModel>;
  uploadModel(formData: ModelUploadFormData): Promise<MMDModel>;
  updateModel(id: string, data: Partial<MMDModel>): Promise<MMDModel>;
  deleteModel(id: string): Promise<void>;

  // 动画相关
  getAnimations(): Promise<MMDAnimation[]>;
  getAnimation(id: string): Promise<MMDAnimation>;
  uploadAnimation(formData: AnimationUploadFormData): Promise<MMDAnimation>;
  updateAnimation(id: string, data: Partial<MMDAnimation>): Promise<MMDAnimation>;
  deleteAnimation(id: string): Promise<void>;

  // 场景相关
  getScenes(): Promise<MMDScene[]>;
  getScene(id: string): Promise<MMDScene>;
  saveScene(formData: SceneSaveFormData): Promise<MMDScene>;
  updateScene(id: string, data: Partial<MMDScene>): Promise<MMDScene>;
  deleteScene(id: string): Promise<void>;
}

// ===== API响应类型 =====

/** API基础响应 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** 文件上传响应 */
export interface UploadResponse {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadTime: Date;
}

// ===== 状态管理类型 =====

/** MMD查看器状态 */
export interface MMDViewerState {
  // 当前加载的资源
  currentModel: MMDModel | null;
  currentAnimation: MMDAnimation | null;
  currentAudio: MMDAudio | null;
  currentScene: MMDScene | null;

  // 播放状态
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  loop: boolean;

  // 场景状态
  cameraPosition: THREE.Vector3;
  cameraTarget: THREE.Vector3;
  lighting: MMDScene['lighting'];
  background: MMDScene['background'];

  // UI状态
  showControls: boolean;
  showModelList: boolean;
  showAnimationList: boolean;
  fullscreen: boolean;

  // 加载状态
  isLoading: boolean;
  loadingProgress: number;
  error: Error | null;
}

/** MMD查看器动作 */
export interface MMDViewerActions {
  // 资源加载
  loadModel: (modelId: string) => Promise<void>;
  loadAnimation: (animationId: string) => Promise<void>;
  loadAudio: (audioId: string) => Promise<void>;
  loadScene: (sceneId: string) => Promise<void>;

  // 播放控制
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setLoop: (loop: boolean) => void;

  // 场景控制
  setCameraPosition: (position: THREE.Vector3) => void;
  setCameraTarget: (target: THREE.Vector3) => void;
  setLighting: (lighting: MMDScene['lighting']) => void;
  setBackground: (background: MMDScene['background']) => void;

  // UI控制
  toggleControls: () => void;
  toggleModelList: () => void;
  toggleAnimationList: () => void;
  toggleFullscreen: () => void;

  // 场景保存
  saveScene: (formData: SceneSaveFormData) => Promise<void>;

  // 错误处理
  setError: (error: Error | null) => void;
  clearError: () => void;
}

// ===== 工具类型 =====

/** 文件验证选项 */
export interface FileValidationOptions {
  maxSize?: number;
  allowedExtensions?: string[];
  allowedMimeTypes?: string[];
}

/** 文件验证结果 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/** 3D场景配置 */
export interface SceneConfig {
  antialias: boolean;
  shadows: boolean;
  physicallyCorrectLights: boolean;
  toneMapping: THREE.ToneMapping;
  toneMappingExposure: number;
  outputColorSpace: string;
}

/** 渲染配置 */
export interface RenderConfig {
  width: number;
  height: number;
  pixelRatio: number;
  clearColor: string;
  clearAlpha: number;
}

// 纹理文件管理相关类型
export interface TextureFileInfo {
  file: File;
  url: string;
  name: string;
  size: number;
}

export interface MMDTextureManager {
  textureFiles: Map<string, TextureFileInfo>;
  addTexture: (file: File) => void;
  getTextureUrl: (texturePath: string) => string | null;
  clear: () => void;
} 