import type {
  Entities
} from './types.d'

type Result = Pick<Entities, 'player' | 'cursors'>

import {
  PLAYER_X,
  PLAYER_Y,
  PLAYER_SPEED,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  MAP_WIDTH,
  MAP_HEIGHT
} from './constants'

let collidingLeft = false
let collidingRight = false
let collidingTop = false
let collidingBottom = false

/**
 * 
 */
export function createMovement (scene: Phaser.Scene): Result {
  const keyboard = scene.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin

  const player = scene.physics.add.sprite(PLAYER_X, PLAYER_Y, 'player')
  const cursors = keyboard.createCursorKeys()

  player.setOrigin(0.5, 0.5)
  player.setCollideWorldBounds(true)
  scene.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)

  // Camera follows the player
  scene.cameras.main.startFollow(player)
  scene.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)

  keyboard.addKey('W')
  keyboard.addKey('A')
  keyboard.addKey('S')
  keyboard.addKey('D')

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
        const r = maskData[index]
        const g = maskData[index + 1]
        const b = maskData[index + 2]

        // Check for a collision (black pixel)
        if (r === 0 && g === 0 && b === 0) {
          // Collision detected; determine which side
          if (pixelX === 0) collidingLeft = true
          if (pixelX === width - 1) collidingRight = true
          if (pixelY === 0) collidingTop = true
          if (pixelY === height - 1) collidingBottom = true
        }
      }
    }
  }

  return { collidingLeft, collidingRight, collidingTop, collidingBottom }
}

/**
 * 
 */
export function updateMovement (scene: Phaser.Scene, entities: Entities): void {
  // Movement
  const keyboard = scene.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin

  // Reset desired velocities
  let desiredVelocityX = 0
  let desiredVelocityY = 0

  // Calculate desired velocity based on input and collision state
  if ((entities.cursors.left.isDown || keyboard.checkDown(keyboard.addKey('A'), 0)) && !collidingLeft) {
    desiredVelocityX = -PLAYER_SPEED
  }

  if ((entities.cursors.right.isDown || keyboard.checkDown(keyboard.addKey('D'), 0)) && !collidingRight) {
    desiredVelocityX = PLAYER_SPEED
  }

  if ((entities.cursors.up.isDown || keyboard.checkDown(keyboard.addKey('W'), 0)) && !collidingTop) {
    desiredVelocityY = -PLAYER_SPEED
  }

  if ((entities.cursors.down.isDown || keyboard.checkDown(keyboard.addKey('S'), 0)) && !collidingBottom) {
    desiredVelocityY = PLAYER_SPEED
  }

  // Check for potential collisions with the desired velocity
  const newX = entities.player.x + desiredVelocityX / 30
  const newY = entities.player.y + desiredVelocityY / 30

  // Check for collisions with the player's pixel area
  const collisions = checkPixelCollision(
    newX,
    newY,
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
    entities.map,
    entities.maskData
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
  entities.player.setVelocityX(desiredVelocityX)
  entities.player.setVelocityY(desiredVelocityY)

  // Update the collision flags based on the latest checks
  collidingLeft = collisions.collidingLeft
  collidingRight = collisions.collidingRight
  collidingTop = collisions.collidingTop
  collidingBottom = collisions.collidingBottom
}