// Module Types

import type { System } from '../types'

// Module Definitions

import { createAction } from './action'
import { INT } from '../network/message'

// Should always be lower-case!
export enum Actions {
  CAST_FIREBALL = 'cast_fireball'
}

export const defineActions = () => [

  /**
   * 
   */
  createAction<{
    startX: number
    startY: number
    targetX: number
    targetY: number
  }>(Actions.CAST_FIREBALL, ({ startX, startY, targetX, targetY }, system: System) => {
    system.projectiles.push({
      sprite: system.scene.physics.add.sprite(startX, startY, 'fireball'),
      startX,
      startY,
      targetX,
      targetY
    })
  }, [
    ['startX', INT, 8],
    ['startY', INT, 8],
    ['targetX', INT, 8],
    ['targetY', INT, 8]
  ])
]
