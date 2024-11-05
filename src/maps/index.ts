// Module Types

// import type {
//   MaskData
// } from '../types'
import { Line } from './masks'

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

function createLine(scene: Phaser.Scene, startX: number, startY: number, endX: number, endY: number) {
  // Create the image (the 1x1 black pixel)
  const line = scene.add.image(startX, startY, 'dot') // 'dot' is a 1x1 black pixel

  // Calculate the horizontal (dx) and vertical (dy) distances
  const dx = endX - startX
  const dy = endY - startY

  // Calculate the length (distance) of the line
  const length = Math.sqrt(dx * dx + dy * dy) // Pythagorean theorem: sqrt(dx^2 + dy^2)

  // Calculate the angle of the line
  const angle = Math.atan2(dy, dx) // atan2 handles both positive and negative slopes

  // Stretch the pixel to the correct length
  line.setDisplaySize(length, 1)  // 1px height, scale width to length

  // Rotate the line segment to match the angle of the line
  line.setRotation(angle)
}

/**
 * Create blitter chunks based on the map texture.
 */
export function createMap (scene: Phaser.Scene, eventQueue: EventQueue, mask: Line[]) {
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

  // TODO remove
  for (const coord of mask) {
    createLine(scene, coord[0][0], coord[0][1], coord[1][0], coord[1][1])
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
