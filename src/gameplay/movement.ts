import type {
  System
} from '../types'

type Result = Pick<System, 'player' | 'cursors'>

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

let collidingLeft = false
let collidingRight = false
let collidingTop = false
let collidingBottom = false

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
function checkPixelCollision(
  x: number,
  y: number,
  width: number,
  height: number,
  map: Phaser.GameObjects.Image,
  maskData: Uint8ClampedArray
) {
  const maskWidth = map.displayWidth
  const maskHeight = map.displayHeight

  let collidingLeft = false
  let collidingRight = false
  let collidingTop = false
  let collidingBottom = false

  // Loop through each pixel in the player's bounding box
  for (let pixelY = 0; pixelY < height; pixelY++) {
    for (let pixelX = 0; pixelX < width; pixelX++) {
      const checkX = Math.floor(x) + pixelX
      const checkY = Math.floor(y) + pixelY

      // Check bounds
      if (checkX >= 0 && checkX < maskWidth && checkY >= 0 && checkY < maskHeight) {
        const index = (checkY * maskWidth + checkX) * 4
        const border = maskData[index]

        // Check for a collision (black pixel)
        if (border === 0) {
          // Collision detected; determine which side
          if (pixelX === 0)
            collidingLeft = true
          
          if (pixelX === width - 1)
              collidingRight = true
          
          if (pixelY === 0)
              collidingTop = true
          
          if (pixelY === height - 1)
              collidingBottom = true
        }
      }
    }
  }

  return { collidingLeft, collidingRight, collidingTop, collidingBottom }
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
  if ((system.cursors.left.isDown || keyboard.checkDown(keyboard.addKey('A'), 0)) && !collidingLeft) {
    desiredVelocityX = -PLAYER_SPEED
  }

  if ((system.cursors.right.isDown || keyboard.checkDown(keyboard.addKey('D'), 0)) && !collidingRight) {
    desiredVelocityX = PLAYER_SPEED
  }

  if ((system.cursors.up.isDown || keyboard.checkDown(keyboard.addKey('W'), 0)) && !collidingTop) {
    desiredVelocityY = -PLAYER_SPEED
  }

  if ((system.cursors.down.isDown || keyboard.checkDown(keyboard.addKey('S'), 0)) && !collidingBottom) {
    desiredVelocityY = PLAYER_SPEED
  }

  // Check for potential collisions with the desired velocity
  const newX = system.player.x + desiredVelocityX / 30
  const newY = system.player.y + desiredVelocityY / 30

  // Check for collisions with the player's pixel area
  const collisions = checkPixelCollision(
    newX,
    newY,
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
    system.map,
    system.maskData
  )

  // Set the player's velocity based on the collision results
  if (collisions.collidingLeft) {
    desiredVelocityX = 0
  }
  if (collisions.collidingRight) {
    desiredVelocityX = 0
  }
  if (collisions.collidingTop) {
    desiredVelocityY = 0
  }
  if (collisions.collidingBottom) {
    desiredVelocityY = 0
  }

  // Apply the calculated velocities
  system.player.setVelocityX(desiredVelocityX)
  system.player.setVelocityY(desiredVelocityY)

  // Update the collision flags based on the latest checks
  collidingLeft = collisions.collidingLeft
  collidingRight = collisions.collidingRight
  collidingTop = collisions.collidingTop
  collidingBottom = collisions.collidingBottom
}