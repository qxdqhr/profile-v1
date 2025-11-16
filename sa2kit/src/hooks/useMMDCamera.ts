/**
 * useMMDCamera Hook
 * 
 * A React hook for managing MMD camera controls
 * 
 * @module sa2kit/hooks/useMMDCamera
 * @author SA2Kit Team
 * @license MIT
 */

import { useCallback, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Camera config type
 */
export interface MMDCameraConfig {
  /** Initial camera position */
  position?: THREE.Vector3
  /** Initial target position */
  target?: THREE.Vector3
  /** Min distance */
  minDistance?: number
  /** Max distance */
  maxDistance?: number
  /** Enable damping */
  enableDamping?: boolean
  /** Damping factor */
  dampingFactor?: number
}

/**
 * Camera controls interface
 */
export interface MMDCameraControls {
  /** Move camera (rotate) */
  moveCamera: (deltaX: number, deltaY: number) => void
  /** Zoom camera */
  zoomCamera: (delta: number) => void
  /** Elevate camera (Z-axis) */
  elevateCamera: (delta: number) => void
  /** Reset camera */
  resetCamera: () => void
  /** Get camera reference */
  getCameraRef: () => THREE.PerspectiveCamera | null
  /** Get controls reference */
  getControlsRef: () => OrbitControls | null
}

/**
 * useMMDCamera hook return type
 */
export interface UseMMDCameraReturn {
  /** Camera reference */
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>
  /** Controls reference */
  controlsRef: React.RefObject<OrbitControls | null>
  /** Camera controls */
  controls: MMDCameraControls
  /** Initialize camera */
  initCamera: (camera: THREE.PerspectiveCamera, controls: OrbitControls) => void
}

/**
 * ========================================
 * useMMDCamera Hook
 * ========================================
 * 
 * A hook for managing camera controls in MMD scenes.
 * 
 * Features:
 * - Camera rotation (orbital movement)
 * - Zoom in/out
 * - Elevation (Z-axis movement)
 * - Reset to initial position
 * - OrbitControls integration
 * 
 * @example
 * ```tsx
 * const { cameraRef, controlsRef, controls, initCamera } = useMMDCamera({
 *   position: new THREE.Vector3(0, 10, 30),
 *   target: new THREE.Vector3(0, 10, 0),
 * })
 * 
 * useEffect(() => {
 *   const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000)
 *   const orbitControls = new OrbitControls(camera, renderer.domElement)
 *   initCamera(camera, orbitControls)
 * }, [])
 * 
 * // Use controls
 * controls.moveCamera(0.01, 0)
 * controls.zoomCamera(1)
 * controls.elevateCamera(0.5)
 * ```
 */
export const useMMDCamera = (
  config: MMDCameraConfig = {}
): UseMMDCameraReturn => {
  const {
    position = new THREE.Vector3(0, 10, 30),
    target = new THREE.Vector3(0, 10, 0),
    minDistance = 5,
    maxDistance = 100,
    enableDamping = true,
    dampingFactor = 0.05,
  } = config

  // ========================================
  // Refs
  // ========================================
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const initialPositionRef = useRef<THREE.Vector3>(position.clone())
  const initialTargetRef = useRef<THREE.Vector3>(target.clone())

  /**
   * Initialize camera
   */
  const initCamera = useCallback(
    (camera: THREE.PerspectiveCamera, controls: OrbitControls) => {
      cameraRef.current = camera
      controlsRef.current = controls

      // Set initial position
      camera.position.copy(position)
      controls.target.copy(target)
      
      // Configure controls
      controls.enableDamping = enableDamping
      controls.dampingFactor = dampingFactor
      controls.minDistance = minDistance
      controls.maxDistance = maxDistance
      
      controls.update()

      // Save initial state
      initialPositionRef.current = position.clone()
      initialTargetRef.current = target.clone()
    },
    [position, target, minDistance, maxDistance, enableDamping, dampingFactor]
  )

  /**
   * Move camera (rotate around target)
   */
  const moveCamera = useCallback((deltaX: number, deltaY: number) => {
    const controls = controlsRef.current
    const camera = cameraRef.current
    if (!controls || !camera) return

    // Calculate spherical coordinates
    const offset = camera.position.clone().sub(controls.target)
    const spherical = new THREE.Spherical().setFromVector3(offset)

    // Update angles
    spherical.theta -= deltaX
    spherical.phi -= deltaY

    // Clamp phi to prevent flipping
    const EPS = 0.000001
    spherical.phi = Math.max(EPS, Math.min(Math.PI - EPS, spherical.phi))

    // Update camera position
    offset.setFromSpherical(spherical)
    camera.position.copy(controls.target).add(offset)
    camera.lookAt(controls.target)
  }, [])

  /**
   * Zoom camera
   */
  const zoomCamera = useCallback((delta: number) => {
    const controls = controlsRef.current
    const camera = cameraRef.current
    if (!controls || !camera) return

    // Calculate direction vector
    const direction = camera.position.clone().sub(controls.target).normalize()
    
    // Move camera along direction
    const newPosition = camera.position.clone().add(direction.multiplyScalar(-delta))
    
    // Check distance constraints
    const distance = newPosition.distanceTo(controls.target)
    if (distance >= minDistance && distance <= maxDistance) {
      camera.position.copy(newPosition)
    }
  }, [minDistance, maxDistance])

  /**
   * Elevate camera (Z-axis)
   */
  const elevateCamera = useCallback((delta: number) => {
    const controls = controlsRef.current
    const camera = cameraRef.current
    if (!controls || !camera) return

    // Move both camera and target along Z-axis
    camera.position.z += delta
    controls.target.z += delta
    controls.update()
  }, [])

  /**
   * Reset camera
   */
  const resetCamera = useCallback(() => {
    const controls = controlsRef.current
    const camera = cameraRef.current
    if (!controls || !camera) return

    // Restore initial position and target
    camera.position.copy(initialPositionRef.current)
    controls.target.copy(initialTargetRef.current)
    controls.update()
  }, [])

  /**
   * Get camera reference
   */
  const getCameraRef = useCallback(() => cameraRef.current, [])

  /**
   * Get controls reference
   */
  const getControlsRef = useCallback(() => controlsRef.current, [])

  // ========================================
  // Return
  // ========================================
  const controls: MMDCameraControls = {
    moveCamera,
    zoomCamera,
    elevateCamera,
    resetCamera,
    getCameraRef,
    getControlsRef,
  }

  return {
    cameraRef,
    controlsRef,
    controls,
    initCamera,
  }
}

export default useMMDCamera
