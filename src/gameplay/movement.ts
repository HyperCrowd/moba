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

let xArrow: Phaser.GameObjects.Graphics
let yArrow: Phaser.GameObjects.Graphics

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

  // TODO move to debug overlay
  xArrow = scene.add.graphics()
  yArrow = scene.add.graphics()

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

// TODO move to debug overlay
function drawArrow (arrow: Phaser.GameObjects.Graphics, sx: number, sy: number, vx: number, vy: number, color: number) {
  arrow.clear()
  // Draw the arrow (create a line first)
  arrow.lineStyle(2, color, 1);
  arrow.beginPath();
  arrow.moveTo(sx, sy);
  arrow.lineTo(sx + vx, sy + vy);
  arrow.strokePath();

  arrow.lineStyle(2, color, 1);
  arrow.beginPath();
  arrow.strokePath();
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
  if ((system.cursors.left.isDown || keyboard.checkDown(keyLeft, 0))) {
    desiredVelocityX = -PLAYER_SPEED
  }

  if ((system.cursors.right.isDown || keyboard.checkDown(keyRight, 0))) {
    desiredVelocityX = PLAYER_SPEED
  }

  if ((system.cursors.up.isDown || keyboard.checkDown(keyUp, 0))) {
    desiredVelocityY = -PLAYER_SPEED
  }

  if ((system.cursors.down.isDown || keyboard.checkDown(keyDown, 0))) {
    desiredVelocityY = PLAYER_SPEED
  }

  // Check for potential collisions with the desired velocity
  const newX = system.player.x + desiredVelocityX
  const newY = system.player.y + desiredVelocityY

  // TODO move to debug overlay
  drawArrow(xArrow, system.player.x, system.player.y, desiredVelocityX, 0, 0xff0000)
  drawArrow(yArrow, system.player.x, system.player.y, 0, desiredVelocityY, 0x0000ff)
  
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