import Phaser from 'phaser'

import { MAP_WIDTH, MAP_HEIGHT } from './../constants'
import { getSystem } from '../engine'

let camera: Phaser.Cameras.Scene2D.Camera
let following: {
  entity: Phaser.GameObjects.GameObject
  offsetX: number,
  offsetY: number
} | undefined

/**
 * Initializes the camera and sets its bounds to match the world size.
 * @param scene - The current Phaser scene.
 * @param width - The width of the camera bound
 * @param height - The height of the camera bound
 * @returns The initialized camera.
 */
export function initializeCamera(scene: Phaser.Scene, width = MAP_WIDTH, height = MAP_HEIGHT): Phaser.Cameras.Scene2D.Camera {
  if (camera !== undefined)   {
    return camera
  }

  camera = scene.cameras.main;

    // Set camera bounds to match the world size
    camera.setBounds(0, 0, width, height)

    return camera;
}

/**
 * Returns Camera
 * @returns Camera
 */
export function getCamera (): Phaser.Cameras.Scene2D.Camera {
  return camera
}

/**
 * Makes the camera follow a specified entity with an optional offset.
 * @param entity - The entity to follow.
 * @param offsetX - Horizontal offset from the entity.
 * @param offsetY - Vertical offset from the entity.
 */
export function followEntity(entity: Phaser.GameObjects.GameObject, offsetX: number = 0, offsetY: number = 0): void {
    // Start following the entity smoothly with easing
    camera.startFollow(entity, false, 1, 1, offsetX, offsetY);
    following = {
      entity,
      offsetX,
      offsetY
    }
}

/**
 * Stops the camera from following the current entity.
 */
export function stopFollowing(): void {
    // Stop following any entity
    camera.stopFollow()
}

/**
 * Resumes following the last entity the camera was following
 * @param duration - Duration of the pan in milliseconds.
 */
export function resumeFollowing(duration: number = 500): void {
  if (following) {
    camera.pan(
      following.entity.body?.position.x as number,
      following.entity.body?.position.y as number,
      duration,
      'Power2'
    )
    followEntity(following.entity, following.offsetX, following.offsetY)
  }
}

/**
 * Moves the camera to a specific position over a duration.
 * @param x - The target x-coordinate to move the camera to.
 * @param y - The target y-coordinate to move the camera to.
 * @param duration - Duration of the pan in milliseconds.
 */
export function moveTo(x: number, y: number, duration: number = 500): void {
    // Pan the camera to the specified position
    camera.pan(x, y, duration, 'Power2')
}

/**
 * Sets the zoom level of the camera.
 * @param zoomLevel - The desired zoom level (1 is normal).
 * @param duration - Duration of the zoom in milliseconds.
 */
export function setZoom(zoomLevel: number, duration: number = 400): void {
  const system = getSystem()
  const initialZoom = camera.zoom
  let elapsed = 0

  // Adjust the camera zoom
  system.eventQueue.addUpdate((delta: number) => {
    elapsed += delta;
    const t = Phaser.Math.Clamp(elapsed / duration, 0, 1)
    camera.setZoom(Phaser.Math.Linear(initialZoom, zoomLevel, t))
  }, () => elapsed >= duration)
}

/**
 * Sets dynamic bounds for the camera based on the game world.
 * @param x - The x-coordinate of the top-left corner of the bounds.
 * @param y - The y-coordinate of the top-left corner of the bounds.
 * @param width - The width of the bounds.
 * @param height - The height of the bounds.
 */
export function setBounds(x: number, y: number, width: number, height: number): void {
  // Define the camera bounds to prevent moving outside the game world
  camera.setBounds(x, y, width, height);
}

/**
 * Vibrates the camera lightly
 * @param duration - Duration of the shake in milliseconds.
 */
export function vibrate(duration: number): void {
  // Apply shake effect to the camera
  camera.shake(duration, 0.001);
}

/**
 * Shakes the camera
 * @param duration - Duration of the shake in milliseconds.
 */
export function shake(duration: number): void {
    // Apply shake effect to the camera
    camera.shake(duration, 0.01);
}

/**
 * Violently shakes the camera
 * @param duration - Duration of the shake in milliseconds.
 */
export function quake(duration: number): void {
  // Apply shake effect to the camera
  camera.shake(duration, 0.1);
}

/**
 * Rotates the camera
 * @param duration - Duration of the rotation in milliseconds.
 */
export function rotate (duration: number, rotations: number = 1): void {
  const system = getSystem()
  camera.setRotation(0)
  
  let elapsed = 0

  // Adjust the camera zoom
  system.eventQueue.addUpdate((delta: number) => {
    elapsed += delta;
    const t = Phaser.Math.Clamp(elapsed / duration, 0, 1)
    camera.setRotation(Phaser.Math.Linear(0, Math.PI * 2 * rotations, t))
  }, () => elapsed >= duration)
}

/**
 * 
 * @param scene 
 * @param targetScene 
 * @param duration 
 */
export function wipeTransition (scene: Phaser.Scene, duration: number = 2000, targetScene: string = 'default') {
  const fx = camera.postFX.addWipe(0.3, 1, 1)

  scene.tweens.add({
      targets: targetScene,
      duration,
      moveBelow: true,
      onUpdate: (progress: number) => {
          fx.progress = progress;
      }
  })
}

/**
 * Fades the camera to black
 * @param duration 
 */
export function toBlack (duration: number = 500) {
  camera.fadeOut(duration, 0, 0, 0)
}

/**
 * Fades the camera to black
 * @param duration 
 */
export function fromBlack (duration: number = 500) {
  camera.fadeIn(duration, 0, 0, 0)
}