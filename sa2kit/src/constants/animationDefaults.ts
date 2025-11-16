/**
 * MMD Animation Viewer 默认配置
 */

export const DEFAULT_ANIMATION_VIEWER_CONFIG = {
  // Scene
  backgroundColor: 0x000000,
  enableFog: false,
  enableShadows: true,
  showGround: true,
  groundColor: 0x333333,
  showGrid: false,

  // Camera
  cameraPosition: [0, 10, 25] as [number, number, number],
  cameraTarget: [0, 10, 0] as [number, number, number],
  cameraFov: 45,
  enableCameraControls: true,

  // Lighting
  ambientLightIntensity: 1.0,
  directionalLightIntensity: 0.8,

  // Playback
  autoPlay: false,
  loop: false,
  volume: 0.7,

  // Physics
  enablePhysics: true,
  enableIK: true,
  enableGrant: true,

  // Debug
  debugMode: false,
  logLevel: 'warn' as const,
}

