/**
 * Three.js场景管理工具函数
 */

import * as THREE from 'three';
import type { SceneConfig, RenderConfig } from '../types';

/**
 * 默认场景配置
 */
export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  antialias: true,
  shadows: true,
  physicallyCorrectLights: true,
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1.0,
  outputColorSpace: THREE.SRGBColorSpace,
};

/**
 * 默认渲染配置
 */
export const DEFAULT_RENDER_CONFIG: RenderConfig = {
  width: 800,
  height: 600,
  pixelRatio: window.devicePixelRatio || 1,
  clearColor: '#000000',
  clearAlpha: 1.0,
};

/**
 * 创建Three.js渲染器
 */
export function createRenderer(
  canvas: HTMLCanvasElement,
  config: Partial<RenderConfig> = {}
): THREE.WebGLRenderer {
  const renderConfig = { ...DEFAULT_RENDER_CONFIG, ...config };
  
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: DEFAULT_SCENE_CONFIG.antialias,
    alpha: renderConfig.clearAlpha < 1.0,
  });

  // 设置渲染器基础配置
  renderer.setSize(renderConfig.width, renderConfig.height);
  renderer.setPixelRatio(renderConfig.pixelRatio);
  renderer.setClearColor(renderConfig.clearColor, renderConfig.clearAlpha);

  // 启用阴影
  if (DEFAULT_SCENE_CONFIG.shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  // 设置色调映射
  renderer.toneMapping = DEFAULT_SCENE_CONFIG.toneMapping;
  renderer.toneMappingExposure = DEFAULT_SCENE_CONFIG.toneMappingExposure;
  renderer.outputColorSpace = DEFAULT_SCENE_CONFIG.outputColorSpace;

  return renderer;
}

/**
 * 创建Three.js场景
 */
export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  
  // 设置默认背景色
  scene.background = new THREE.Color(0x333333);
  
  return scene;
}

/**
 * 创建默认相机
 */
export function createCamera(
  width: number = DEFAULT_RENDER_CONFIG.width,
  height: number = DEFAULT_RENDER_CONFIG.height
): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    50, // fov
    width / height, // aspect
    0.1, // near
    1000 // far
  );

  // 设置默认相机位置
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 0);

  return camera;
}

/**
 * 创建默认光源
 */
export function createLights(): {
  ambientLight: THREE.AmbientLight;
  directionalLight: THREE.DirectionalLight;
} {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);

  // 方向光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;

  // 配置阴影
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;

  return { ambientLight, directionalLight };
}

/**
 * 创建辅助网格
 */
export function createHelpers(): {
  gridHelper: THREE.GridHelper;
  axesHelper: THREE.AxesHelper;
} {
  const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
  const axesHelper = new THREE.AxesHelper(5);

  return { gridHelper, axesHelper };
}

/**
 * 更新相机纵横比
 */
export function updateCameraAspect(
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number
): void {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

/**
 * 更新渲染器尺寸
 */
export function updateRendererSize(
  renderer: THREE.WebGLRenderer,
  width: number,
  height: number,
  pixelRatio: number = window.devicePixelRatio || 1
): void {
  renderer.setSize(width, height);
  renderer.setPixelRatio(pixelRatio);
}

/**
 * 计算模型边界框
 */
export function getModelBounds(object: THREE.Object3D): THREE.Box3 {
  const box = new THREE.Box3();
  box.setFromObject(object);
  return box;
}

/**
 * 将相机聚焦到对象
 */
export function focusCameraOnObject(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  distance: number = 10
): void {
  const box = getModelBounds(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  // 计算适合的距离
  const maxDim = Math.max(size.x, size.y, size.z);
  const fitDistance = maxDim / (2 * Math.tan((camera.fov * Math.PI) / 360));
  const finalDistance = Math.max(fitDistance, distance);

  // 设置相机位置
  camera.position.copy(center);
  camera.position.z += finalDistance;
  camera.lookAt(center);
}

/**
 * 清理Three.js对象
 */
export function disposeObject(object: THREE.Object3D): void {
  if (!object) return;

  // 递归清理子对象
  while (object.children.length > 0) {
    disposeObject(object.children[0]);
    object.remove(object.children[0]);
  }

  // 清理几何体
  if (object instanceof THREE.Mesh) {
    if (object.geometry) {
      object.geometry.dispose();
    }

    // 清理材质
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => disposeMaterial(material));
      } else {
        disposeMaterial(object.material);
      }
    }
  }
}

/**
 * 清理材质
 */
export function disposeMaterial(material: THREE.Material): void {
  // 清理纹理
  const mat = material as any;
  if (mat.map && mat.map.dispose) {
    mat.map.dispose();
  }
  if (mat.normalMap && mat.normalMap.dispose) {
    mat.normalMap.dispose();
  }
  if (mat.roughnessMap && mat.roughnessMap.dispose) {
    mat.roughnessMap.dispose();
  }
  if (mat.metalnessMap && mat.metalnessMap.dispose) {
    mat.metalnessMap.dispose();
  }

  material.dispose();
}

/**
 * 创建完整的MMD场景设置
 */
export function createMMDScene(
  canvas: HTMLCanvasElement,
  renderConfig?: Partial<RenderConfig>
): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  lights: {
    ambientLight: THREE.AmbientLight;
    directionalLight: THREE.DirectionalLight;
  };
  helpers: {
    gridHelper: THREE.GridHelper;
    axesHelper: THREE.AxesHelper;
  };
} {
  const config = { ...DEFAULT_RENDER_CONFIG, ...renderConfig };
  
  const scene = createScene();
  const camera = createCamera(config.width, config.height);
  const renderer = createRenderer(canvas, config);
  const lights = createLights();
  const helpers = createHelpers();

  // 添加光源到场景
  scene.add(lights.ambientLight);
  scene.add(lights.directionalLight);

  // 添加辅助对象到场景（可选）
  scene.add(helpers.gridHelper);
  // scene.add(helpers.axesHelper); // 默认不显示坐标轴

  return {
    scene,
    camera,
    renderer,
    lights,
    helpers,
  };
} 