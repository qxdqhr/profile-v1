/**
 * SA2Kit - Super Anime 2D/3D Kit
 * 
 * A comprehensive MMD (MikuMikuDance) model viewer and animation player library
 * 
 * @packageDocumentation
 * @module sa2kit
 * @author SA2Kit Team
 * @license MIT
 * @version 1.0.0
 */

// ===== Core Components =====
export { MMDViewer } from './components/MMDViewer'
export type { MMDViewerProps } from './components/MMDViewer/types'

export { MMDAnimationPlayer } from './components/MMDAnimationPlayer'
export type {
  MMDAnimationPlayerProps,
  PlaybackControls,
  AnimationLoadState,
} from './components/MMDAnimationPlayer/types'

export { MMDAnimationViewer } from './components/MMDAnimationViewer'
export type {
  MMDAnimationViewerProps,
  AnimationViewerState,
  PlaybackControlsExtended,
} from './components/MMDAnimationViewer/types'

export { MMDCameraControl } from './components/MMDCameraControl'
export type {
  MMDCameraControlProps,
  ControlSizeConfig,
  ControlThemeConfig,
} from './components/MMDCameraControl/types'

// ===== React Hooks =====
export {
  useMMDLoader,
  useMMDAnimation,
  useMMDCamera,
  useModelLoader,
  useBatchModelLoader,
} from './hooks'
export type {
  MMDLoadState,
  MMDLoadedResource,
  UseMMDLoaderReturn,
  MMDAnimationState,
  MMDAnimationOptions,
  UseMMDAnimationReturn,
  MMDCameraConfig,
  MMDCameraControls,
  UseMMDCameraReturn,
  ModelLoadState,
  UseModelLoaderOptions,
  UseModelLoaderReturn,
  UseBatchModelLoaderOptions,
  UseBatchModelLoaderReturn,
} from './hooks'

// ===== Core Types =====
export type {
  AnimationControls,
  CameraControls,
} from './types'

// ===== Utilities =====
export { 
  TexturePathResolver,
  resolveTexturePath,
} from './utils/texturePathResolver'

export {
  ModelLoader,
  getGlobalModelLoader,
  loadModel,
  preloadModel,
} from './utils/modelLoader'
export type {
  ModelLoaderConfig,
  LoadResult,
  LoadProgressCallback,
} from './utils/modelLoader'

// ===== Constants =====
export {
  DEFAULT_VIEWER_CONFIG,
  DEFAULT_CAMERA_CONTROL_CONFIG,
  TEXTURE_SUBDIRECTORIES,
  SUPPORTED_MODEL_EXTENSIONS,
  SUPPORTED_ANIMATION_EXTENSIONS,
  SUPPORTED_AUDIO_EXTENSIONS,
  SUPPORTED_TEXTURE_EXTENSIONS,
  AMMO_CONFIG,
  VERSION,
} from './constants/defaults'

export {
  DEFAULT_ANIMATION_VIEWER_CONFIG,
} from './constants/animationDefaults'

// ===== Default Export =====
export { MMDViewer as default } from './components/MMDViewer'
