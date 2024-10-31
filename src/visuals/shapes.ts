/*
TODO

- The filling appears to be shape-specific, so a system needs to be invented
- Following doesn't appear to be working

*/
import type { Actors } from '../types'
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
function prepareGraphics (scene: Phaser.Scene, config: ShapeConfig) {
  const {
    // width,
    colors,
    fillType = 'solid',
    borderWidth = 0,
    borderColor = 0x000000,
    pulseDelay = 1000,
    // height = width,
    opacity = 1,
    // follows,
    // duration = 0,
    // deleteAfterComplete = false
  } = config

  const graphics = scene.add.graphics()
  graphics.setAlpha(opacity)

  if (fillType === 'pulse') {
    // Start pulsing effect
    let pulseProgress = 0

    scene.tweens.add({
      targets: graphics,
      alpha: { from: 0, to: 1 },
      duration: pulseDelay,
      repeat: -1,
      yoyo: true,
      onUpdate: () => {
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.IntegerToColor(colors[0]),
            Phaser.Display.Color.IntegerToColor(colors[1]),
            1,
            pulseProgress / pulseDelay
        );
        graphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), color.a);
        pulseProgress += 1;
      }
    });
  } else {
    // Solid fill color
    graphics.fillStyle(colors[0], 1)
  }

  // Draw the shape based on shapeType
  if (borderWidth) {
    graphics.lineStyle(borderWidth, Phaser.Display.Color.IntegerToColor(borderColor).color);
  }

  // TODO: Fix
  // if (follows) {
  //   actorFollow(graphics, follows, duration, deleteAfterComplete)
  // }

  return {
    graphics
  } 
}

/**
 * 
 */
export function createCircle (scene: Phaser.Scene, x: number, y: number, config: ShapeConfig) {
  const { graphics } = prepareGraphics(scene, config)
  const { width } = config

  graphics.fillCircle(x, y, width)
  graphics.strokeCircle(x, y, width)
  return graphics
}

/**
 * 
 */

export function createRectangle (scene: Phaser.Scene, x: number, y: number, config: ShapeConfig) {
  const { graphics } = prepareGraphics(scene, config)
  const { width, height } = config

  graphics.fillRect(x, y, width, height ?? width);
  graphics.strokeRect(x, y, width, height ?? width);
  return graphics
}

/**
 * 
 */

export function createTriangle (scene: Phaser.Scene, x: number, y: number, config: ShapeConfig) {
  const { graphics } = prepareGraphics(scene, config)
  const { width, height } = config

  const points = [
    new Phaser.Math.Vector2(x, y - (height ?? width) / 2),
    new Phaser.Math.Vector2(x - width / 2, y + (height ?? width) / 2),
    new Phaser.Math.Vector2(x + width / 2, y + (height ?? width) / 2)
  ];
  graphics.fillPoints(points, true);
  graphics.strokePoints(points, true);
  return graphics
}

/**
 * 
 */
export function createPolygon (scene: Phaser.Scene, x: number, y: number, config: ShapeConfig) {
    const { graphics } = prepareGraphics(scene, config)
    const { width, height } = config

    const sides = 5;
    const step = (Math.PI * 2) / sides;
    const polygonPoints = [];
    for (let i = 0; i < sides; i++) {
        const angle = step * i;
        polygonPoints.push(new Phaser.Math.Vector2(x + Math.cos(angle) * (width / 2), y + Math.sin(angle) * ((height ?? width) / 2)));
    }
    graphics.fillPoints(polygonPoints, true);
    graphics.strokePoints(polygonPoints, true);
    return graphics
}
