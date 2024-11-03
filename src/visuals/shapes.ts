import type { Actors } from '../types'
import { getSystem } from '../engine'
import { getYoyoPercentage } from '../utils/math'
// import { actorFollow } from '../engine'

type ShapeConfig = {
  width: number
  colors: number[]
  fillType?: 'pulse' | 'solid'
  borderWidth?: number
  borderColor?: number
  pulseDelay?: number
  follows?: Actors,
  duration?: number,
  height?: number
  opacity?: number
  deleteAfterComplete?: boolean
}

// const NOOP = (graphics: Phaser.GameObjects.Graphics) => graphics

/**
 * 
 */
function prepareGraphics (scene: Phaser.Scene, config: ShapeConfig, fillInstructions: (graphics: Phaser.GameObjects.Graphics) => void) {
  const {
    colors,
    fillType = 'solid',
    borderWidth = 0,
    borderColor = 0x000000,
    pulseDelay = 1000,
    opacity = 1,
    // follows,
    // duration = 0,
    // deleteAfterComplete = false
  } = config

  const graphics = scene.add.graphics()
  graphics.setAlpha(opacity)

  if (fillType === 'pulse') {
    // Start pulsing effect
    const system = getSystem()
    let elapsed = 0

    system.eventQueue.addUpdate((delta: number) => {
      elapsed += delta
      const percentage = getYoyoPercentage(elapsed, pulseDelay)

      // TODO add opacity gradient

      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.IntegerToColor(colors[0]),
        Phaser.Display.Color.IntegerToColor(colors[1]),
        1,
        percentage
      )

      graphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b))
      graphics.lineStyle(borderWidth, borderColor)
      fillInstructions(graphics)
    })
  } else {
    // Solid fill color
    graphics.fillStyle(colors[0], 1)
  }

  // Draw the shape based on shapeType
  if (borderWidth) {
    graphics.lineStyle(borderWidth, Phaser.Display.Color.IntegerToColor(borderColor).color)
  }

  fillInstructions(graphics) 

  return graphics
}

/**
 * 
 */
export function createCircle (scene: Phaser.Scene, x: number, y: number, config: ShapeConfig) {
  const { width } = config
  return prepareGraphics(scene, config, graphics => {
    graphics.fillCircle(x, y, width)
    graphics.strokeCircle(x, y, width) 
  })
}

/**
 * 
 */

export function createRectangle (scene: Phaser.Scene, x: number, y: number, config: ShapeConfig) {
  const { width, height } = config
  return prepareGraphics(scene, config, graphics => {
    graphics.fillRect(x, y, width, height ?? width);
    graphics.strokeRect(x, y, width, height ?? width);
  })
}

/**
 * 
 */

export function createTriangle (scene: Phaser.Scene, x: number, y: number, config: ShapeConfig) {
  const { width, height } = config
  return prepareGraphics(scene, config, graphics => {
    const points = [
      new Phaser.Math.Vector2(x, y - (height ?? width) / 2),
      new Phaser.Math.Vector2(x - width / 2, y + (height ?? width) / 2),
      new Phaser.Math.Vector2(x + width / 2, y + (height ?? width) / 2)
    ];
    graphics.fillPoints(points, true)
    graphics.strokePoints(points, true)
  })
}

/**
 * 
 */
export function createPolygon (scene: Phaser.Scene, x: number, y: number, config: ShapeConfig) {
  const { width, height } = config  
  return prepareGraphics(scene, config, graphics => {
    const sides = 5
    const step = (Math.PI * 2) / sides
    const polygonPoints = []
    for (let i = 0; i < sides; i++) {
        const angle = step * i
        polygonPoints.push(new Phaser.Math.Vector2(x + Math.cos(angle) * (width / 2), y + Math.sin(angle) * ((height ?? width) / 2)))
    }

    graphics.fillPoints(polygonPoints, true)
    graphics.strokePoints(polygonPoints, true)
  })
}
