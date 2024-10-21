import type {
  Entities,
  Projectiles
} from './types.d'

type Result = Pick<Entities, 'projectiles'>

import 'phaser'
import {
  FIREBALL_SPEED,
  FIREBALL_RANGE
} from './constants'

const projectiles: Projectiles[] = []

/**
 * 
 */
export function createProjectiles (scene: Phaser.Scene, player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody): Result {
  const result: Result = {
    projectiles
  }

  scene.input.on('pointerdown', (pointer: { worldX: number, worldY: number}) => {
    projectiles.push({
      sprite: scene.physics.add.sprite(player.x, player.y, 'fireball'),
      startX: player.x,
      startY: player.y,
      targetX: pointer.worldX,
      targetY: pointer.worldY
    })
  });

  return result
}

/**
 * 
 */
export function updateProjectiles (_scene: Phaser.Scene, entities: Entities): void {
  entities.projectiles?.forEach(({ sprite, startX, startY, targetX, targetY }, index) => {
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
      sprite.destroy()
      entities.projectiles?.splice(index, 1)
    }
  })
}
