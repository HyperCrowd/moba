import type {
  System,
  MaskData
} from '../types'

type Result = Pick<System, 'map' | 'maskData'>

import 'phaser'
import EventQueue from '../events'
import {
  EventType
} from '../events/events'
import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  MAP_WIDTH,
  MAP_HEIGHT
} from '../constants'

/**
 * 
 */
export function createMap (scene: Phaser.Scene, eventQueue: EventQueue): Result {
  const map = scene.add.image(0, 0, 'map').setOrigin(0, 0) 

  map.setDisplaySize(MAP_WIDTH, MAP_HEIGHT)

  // Load the mask texture
  const canvas = document.getElementById('game') as HTMLCanvasElement
  const context = canvas.getContext('2d', {
    willReadFrequently: true
  }) as CanvasRenderingContext2D

  // Set canvas size to mask image size
  const maskImage = scene.textures.get('mask').getSourceImage() as MaskData
  canvas.width = maskImage.width
  canvas.height = maskImage.height
  context.drawImage(maskImage, 0, 0)

  // Get image data
  const imageData = context.getImageData(
    -(PLAYER_WIDTH / 2),
    -(PLAYER_HEIGHT / 2),
    canvas.width,
    canvas.height
  );

  eventQueue.emit(EventType.SYSTEM_LOADED, { name: 'map' })

  return {
    map,
    maskData: imageData.data
  }
}

/**
 * TODO Probably don't need this
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function updateMap (_scene: Phaser.Scene): void {

}