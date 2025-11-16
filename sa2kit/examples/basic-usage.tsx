/**
 * SA2Kit Basic Usage Example
 * 
 * This example demonstrates the basic usage of SA2Kit's MMDViewer component
 */

import React from 'react'
import { MMDViewer } from 'sa2kit'

/**
 * Example 1: Basic MMD Viewer
 * 
 * The simplest way to use SA2Kit - just provide a model path
 */
export function BasicExample() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <MMDViewer
        modelPath="/models/miku/miku.pmx"
        onLoad={(model) => console.log('Model loaded!', model)}
        onError={(error) => console.error('Failed to load:', error)}
      />
    </div>
  )
}

/**
 * Example 2: Customized Viewer
 * 
 * Customize colors, camera position, and other settings
 */
export function CustomizedExample() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <MMDViewer
        modelPath="/models/miku/miku.pmx"
        backgroundColor={0x1a1a2e}          // Dark blue background
        groundColor={0x2d3250}              // Dark ground
        cameraPosition={[0, 15, 30]}        // Higher camera
        cameraTarget={[0, 10, 0]}           // Look at center
        ambientLightIntensity={1.2}         // Brighter ambient light
        targetModelSize={25}                // Larger model
        debugMode={true}                    // Enable debug logs
        onLoad={(model) => console.log('Loaded:', model)}
      />
    </div>
  )
}

/**
 * Example 3: With Camera Controls
 * 
 * Get camera control methods to integrate with custom UI
 */
export function WithControlsExample() {
  const [cameraControls, setCameraControls] = React.useState<any>(null)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <MMDViewer
        modelPath="/models/miku/miku.pmx"
        onCameraReady={(controls) => {
          setCameraControls(controls)
          console.log('Camera controls ready!')
        }}
      />

      {/* Custom control buttons */}
      {cameraControls && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          display: 'flex',
          gap: 10
        }}>
          <button onClick={() => cameraControls.zoomCamera(-0.5)}>
            Zoom In
          </button>
          <button onClick={() => cameraControls.zoomCamera(0.5)}>
            Zoom Out
          </button>
          <button onClick={() => cameraControls.resetCamera()}>
            Reset
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Example 4: With Progress Indicator
 * 
 * Show loading progress
 */
export function WithProgressExample() {
  const [progress, setProgress] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <MMDViewer
        modelPath="/models/miku/miku.pmx"
        onProgress={(percent) => setProgress(percent)}
        onLoad={() => setIsLoading(false)}
      />

      {/* Custom progress bar */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: 8
        }}>
          Loading: {progress.toFixed(0)}%
        </div>
      )}
    </div>
  )
}

/**
 * Example 5: Multiple Viewers
 * 
 * Display multiple models side by side
 */
export function MultipleViewersExample() {
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <div style={{ flex: 1, borderRight: '1px solid #ccc' }}>
        <MMDViewer
          modelPath="/models/miku/miku.pmx"
          backgroundColor={0xe8f4f8}
        />
      </div>
      <div style={{ flex: 1 }}>
        <MMDViewer
          modelPath="/models/luka/luka.pmx"
          backgroundColor={0xffe8f4}
        />
      </div>
    </div>
  )
}

/**
 * Example 6: Minimal Configuration
 * 
 * The most minimal example possible
 */
export function MinimalExample() {
  return (
    <div style={{ width: '800px', height: '600px' }}>
      <MMDViewer modelPath="/models/miku.pmx" />
    </div>
  )
}

/**
 * Example 7: Custom Styling
 * 
 * Apply custom styles and className
 */
export function CustomStyledExample() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <MMDViewer
        modelPath="/models/miku/miku.pmx"
        className="my-custom-viewer"
        style={{
          border: '2px solid #333',
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      />
    </div>
  )
}

export default BasicExample

