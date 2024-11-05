// Module Types

import type {
  System
} from '../types'

type Result = Pick<System, 'player' | 'cursors'>

// Module Definition

import EventQueue from '../events'
import {
  EventType
} from '../events/events'
import {
  PLAYER_X,
  PLAYER_Y,
  PLAYER_SPEED,
  MAP_WIDTH,
  MAP_HEIGHT
} from '../constants'
import {
  initializeCamera, followEntity
} from './camera'
import { hasMaskCollisions } from '../maps/masks'

/**
 * 
 */
export function createMovement (scene: Phaser.Scene, eventQueue: EventQueue): Result {
  const keyboard = scene.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin

  const player = scene.physics.add.sprite(PLAYER_X, PLAYER_Y, 'player')
  const cursors = keyboard.createCursorKeys()

  player.setOrigin(0.5, 0.5)
  player.setCollideWorldBounds(true)
  scene.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)

  // Camera follows the player
  initializeCamera(scene)
  followEntity(player)

  eventQueue.emit(EventType.SYSTEM_LOADED, { name: 'movement' })

  return {
    player,
    cursors
  }
}

/**
 * 
 */
export function updateMovement (scene: Phaser.Scene, system: System): void {
  // Movement
  const keyboard = scene.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin

  // Reset desired velocities
  let desiredVelocityX = 0
  let desiredVelocityY = 0

  // Calculate desired velocity based on input and collision state
  if ((system.cursors.left.isDown || keyboard.checkDown(keyboard.addKey('A'), 0))) {
    desiredVelocityX = -PLAYER_SPEED
  }

  if ((system.cursors.right.isDown || keyboard.checkDown(keyboard.addKey('D'), 0))) {
    desiredVelocityX = PLAYER_SPEED
  }

  if ((system.cursors.up.isDown || keyboard.checkDown(keyboard.addKey('W'), 0))) {
    desiredVelocityY = -PLAYER_SPEED
  }

  if ((system.cursors.down.isDown || keyboard.checkDown(keyboard.addKey('S'), 0))) {
    desiredVelocityY = PLAYER_SPEED
  }

  // Check for potential collisions with the desired velocity
  const newX = system.player.x + desiredVelocityX / 30 // TODO figure out why 30 works
  const newY = system.player.y + desiredVelocityY / 30 // TODO figure out why 30 works

  const collision = hasMaskCollisions(newX, newY)

  switch (collision) {
    case 0: // top
    case 2: // bottom
    desiredVelocityY = 0
      break
    case 1: // right
    case 3: // left
    desiredVelocityX = 0
      break
  }

  // Apply the calculated velocities
  system.player.setVelocityX(desiredVelocityX)
  system.player.setVelocityY(desiredVelocityY)
}