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
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  MAP_WIDTH,
  MAP_HEIGHT
} from '../constants'
import {
  initializeCamera, followEntity
} from './camera'
import { hasMaskCollisions } from '../maps/masks'

const halfWidth = Math.floor(PLAYER_WIDTH / 2)
const halfHeight = Math.floor(PLAYER_HEIGHT / 2)

let keyUp: Phaser.Input.Keyboard.Key
let keyRight: Phaser.Input.Keyboard.Key
let keyDown: Phaser.Input.Keyboard.Key
let keyLeft: Phaser.Input.Keyboard.Key

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

   // TODO: Custom movement keybindings?
  keyUp = keyboard.addKey('W')
  keyRight = keyboard.addKey('D')
  keyDown = keyboard.addKey('S')
  keyLeft = keyboard.addKey('A')

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
  if (system.cursors.left.enabled && (system.cursors.left.isDown || keyboard.checkDown(keyLeft, 0))) {
    desiredVelocityX = -PLAYER_SPEED
  }

  if (system.cursors.right.enabled && (system.cursors.right.isDown || keyboard.checkDown(keyRight, 0))) {
    desiredVelocityX = PLAYER_SPEED
  }

  if (system.cursors.up.enabled && (system.cursors.up.isDown || keyboard.checkDown(keyUp, 0))) {
    desiredVelocityY = -PLAYER_SPEED
  }

  if (system.cursors.down.enabled && (system.cursors.down.isDown || keyboard.checkDown(keyDown, 0))) {
    desiredVelocityY = PLAYER_SPEED
  }

  if (desiredVelocityX !== 0 || desiredVelocityY !== 0) {
    // Check for potential collisions with the desired velocity
    const newX = system.player.x + (desiredVelocityX / halfWidth)
    const newY = system.player.y + (desiredVelocityY / halfHeight)

    const collision = hasMaskCollisions(newX, newY, PLAYER_WIDTH, PLAYER_HEIGHT)

    if (collision === true) {
      // TODO be more selective about velocity halting
      desiredVelocityX = 0
      desiredVelocityY = 0
    }
  }

  // Apply the calculated velocities
  system.player.setVelocityX(desiredVelocityX)
  system.player.setVelocityY(desiredVelocityY)
}
