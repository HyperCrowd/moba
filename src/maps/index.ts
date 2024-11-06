// Module Types

// Module Definition

import 'phaser'
import EventQueue from '../events'
import {
  EventType
} from '../events/events'

const chunkWidth = 256 // TODO put in constants.js
const chunkHeight = 256 // TODO put in constants.js
const chunks: Phaser.GameObjects.Bob[]  = []
const textureName = 'map'

/**
 * Create blitter chunks based on the map texture.
 */
export function createMap (scene: Phaser.Scene, eventQueue: EventQueue) {
  // Load the map
  const map = scene.add.blitter(0, 0, textureName)
  const texture = scene.textures.get(textureName)

  const image = texture.getSourceImage()
  const imageWidth = image.width
  const imageHeight = image.height
  
  for (let y = 0; y < imageHeight; y += chunkHeight) {
    for (let x = 0; x < imageWidth; x += chunkWidth) {
      // Create the frame using the texture key and dimensions
      const frame = new Phaser.Textures.Frame(
        texture,
        `map-${x}-${y}`,
        0,
        x,
        y,
        chunkWidth,
        chunkHeight
      );

      // Create the chunk with the specified texture and frame
      const chunk = map.create(x, y, frame)
      chunk.setVisible(false)
      chunks.push(chunk)
    }
  }

  scene.cameras.main.setBounds(0, 0, imageWidth, imageHeight)

  eventQueue.emit(EventType.SYSTEM_LOADED, { name: 'map' })

  return {
    map
  }
}

/**
 * 
 * @param scene 
 */
export function updateMap (scene: Phaser.Scene) {
  const camera = scene.cameras.main
  const cameraView = camera.worldView

  // Calculate the chunk grid coordinates for chunks that are one chunkWidth and chunkHeight outside the camera bounds
  const adjustedStartX = Math.floor((cameraView.x - chunkWidth) / chunkWidth)
  const adjustedStartY = Math.floor((cameraView.y - chunkHeight) / chunkHeight)
  const adjustedEndX = Math.ceil((cameraView.right + chunkWidth) / chunkWidth)
  const adjustedEndY = Math.ceil((cameraView.bottom + chunkHeight) / chunkHeight)

  // Loop through the chunks and update visibility
  chunks.forEach(chunk => {
    const chunkX = Math.floor(chunk.x / chunkWidth)
    const chunkY = Math.floor(chunk.y / chunkHeight)
    
    // Determine if the chunk should be visible based on the adjusted camera view
    const isVisible = chunkX >= adjustedStartX && chunkX < adjustedEndX && chunkY >= adjustedStartY && chunkY < adjustedEndY

    // Only update visibility if it has changed to optimize performance
    if (chunk.visible !== isVisible) {
      chunk.setVisible(isVisible)
    }
  })
}
