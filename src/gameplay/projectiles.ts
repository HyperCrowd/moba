// Module Types

import type {
  System,
  Projectiles
} from '../types'

type Result = Pick<System, 'projectiles'>
type PointerEvent = { worldX: number, worldY: number}

// Module Definition

import 'phaser'
import EventQueue from '../events'
import { EventType } from '../events/events'
import { act } from '../events/action'
import { Actions } from '../events/actions'
import {
  createCircleBurst,
  createFire
} from '../visuals/particles'
import {
  FIREBALL_SPEED,
  FIREBALL_RANGE
} from '../constants'

const projectiles: Projectiles[] = []

/**
 * 
 */
export function createProjectiles (scene: Phaser.Scene, eventQueue: EventQueue, player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody): Result {
  const result: Result = {
    projectiles
  }

  scene.input.on('pointerdown', (pointer: PointerEvent) => {
    act(Actions.CAST_FIREBALL, {
      startX: player.x,
      startY: player.y,
      targetX: pointer.worldX,
      targetY: pointer.worldY
    })
  })

  eventQueue.emit(EventType.SYSTEM_LOADED, { name: 'projectiles' })

  return result
}

/**
 * 
 */
export function updateProjectiles (scene: Phaser.Scene, system: System): void {
  system.projectiles?.forEach(({ sprite, startX, startY, targetX, targetY }, index) => {
    // Calculate direction and distance
    const dx = targetX - startX
    const dy = targetY - startY
    const distance = Math.sqrt(dx * dx + dy * dy)  

    // Normalize the direction
    sprite.x += ((dx / distance) * FIREBALL_SPEED) * (1 / 60)
    sprite.y += ((dy / distance) * FIREBALL_SPEED) * (1 / 60)

    // Calculate the distance between the start and the origin
    const between = Phaser.Math.Distance.Between(
      startX,
      startY,
      sprite.x,
      sprite.y
    )

    // Fade out the fireball
    const alpha = Math.max(0, 1 - (between / FIREBALL_RANGE))
    sprite.setAlpha(alpha)

    // Destroy the fireball if it exceeds 100 pixels from the origin
    if (between > FIREBALL_RANGE) {
      createCircleBurst(scene, sprite.x, sprite.y, 50, 250)
      createFire(scene, sprite.x, sprite.y, 0.7, 1000)
      sprite.destroy()
      system.projectiles?.splice(index, 1)
      
    }
  })
}
