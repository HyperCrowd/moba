import 'phaser'

type MaskData = CanvasImageSource & {
  width: number
  height: number
}

type Projectiles = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  startX: number
  startY: number
  targetX: number
  targetY: number
}

const PLAYER_X = 500
const PLAYER_Y = 3800
const PLAYER_WIDTH = 64
const PLAYER_HEIGHT = 64
const MAP_WIDTH = 4480
const MAP_HEIGHT = 4480
const PLAYER_SPEED = 200
const FIREBALL_RANGE = 400
const FIREBALL_SPEED = 600

const projectiles: Projectiles[] = []
let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
let cursors: Phaser.Types.Input.Keyboard.CursorKeys
let map: Phaser.GameObjects.Image
let maskData: Uint8ClampedArray
let collidingLeft = false
let collidingRight = false
let collidingTop = false
let collidingBottom = false

/**
 * 
 */
const preload: Phaser.Types.Scenes.ScenePreloadCallback = function (this: Phaser.Scene): void {
  this.load.image('map', 'map.jpg')
  this.load.image('mask', 'mask_map.png')
  this.load.image('player', 'player.png')
  this.load.image('fireball', 'fireball.png')
}

/**
 * 
 */
const create: Phaser.Types.Scenes.ScenePreloadCallback = function (this: Phaser.Scene): void {
  // Create the map
  map = this.add.image(0, 0, 'map').setOrigin(0, 0)
  map.setDisplaySize(MAP_WIDTH, MAP_HEIGHT)

  // Create the player
  player = this.physics.add.sprite(PLAYER_X, PLAYER_Y, 'player')
  player.setOrigin(0.5, 0.5)
  player.setCollideWorldBounds(true)
  this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)

  // Camera follows the player
  this.cameras.main.startFollow(player)
  this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)

  // Load the mask texture
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', {
    willReadFrequently: true
  }) as CanvasRenderingContext2D

  // Set canvas size to mask image size
  const maskImage = this.textures.get('mask').getSourceImage() as MaskData
  canvas.width = maskImage.width
  canvas.height = maskImage.height
  context.drawImage(maskImage, 0, 0)

  // Get image data
  const imageData = context.getImageData(
    -(PLAYER_WIDTH / 2),
    -(PLAYER_HEIGHT / 2),
    canvas.width,
    canvas.height
  );
  maskData = imageData.data // Store the pixel data

  // Input
  const keyboard = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
  cursors = keyboard.createCursorKeys()
  keyboard.addKey('W')
  keyboard.addKey('A')
  keyboard.addKey('S')
  keyboard.addKey('D')

  // Fireball
  this.input.on('pointerdown', (pointer: { worldX: number, worldY: number}) => {
    projectiles.push({
      sprite: this.physics.add.sprite(player.x, player.y, 'fireball'),
      startX: player.x,
      startY: player.y,
      targetX: pointer.worldX,
      targetY: pointer.worldY
    })
  });
}

/**
 * 
 */
const update: Phaser.Types.Scenes.ScenePreloadCallback = function (this: Phaser.Scene): void {
  projectiles.forEach(({ sprite, startX, startY, targetX, targetY }, index) => {
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
      projectiles.splice(index, 1)
    }
  })

  // Movement
  const keyboard = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin

  // Reset desired velocities
  let desiredVelocityX = 0
  let desiredVelocityY = 0

  // Calculate desired velocity based on input and collision state
  if ((cursors.left.isDown || keyboard.checkDown(keyboard.addKey('A'), 0)) && !collidingLeft) {
    desiredVelocityX = -PLAYER_SPEED
  }
  
  if ((cursors.right.isDown || keyboard.checkDown(keyboard.addKey('D'), 0)) && !collidingRight) {
    desiredVelocityX = PLAYER_SPEED
  }

  if ((cursors.up.isDown || keyboard.checkDown(keyboard.addKey('W'), 0)) && !collidingTop) {
    desiredVelocityY = -PLAYER_SPEED
  }
  
  if ((cursors.down.isDown || keyboard.checkDown(keyboard.addKey('S'), 0)) && !collidingBottom) {
    desiredVelocityY = PLAYER_SPEED
  }

  // Check for potential collisions with the desired velocity
  const newX = player.x + desiredVelocityX / 30
  const newY = player.y + desiredVelocityY / 30

  // Check for collisions with the player's pixel area
  const collisions = checkPixelCollision(newX, newY, PLAYER_WIDTH, PLAYER_HEIGHT)

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
  player.setVelocityX(desiredVelocityX)
  player.setVelocityY(desiredVelocityY)

  // Update the collision flags based on the latest checks
  collidingLeft = collisions.collidingLeft
  collidingRight = collisions.collidingRight
  collidingTop = collisions.collidingTop
  collidingBottom = collisions.collidingBottom
}

/**
 * 
 */
function checkPixelCollision(x: number, y: number, width: number, height: number) {
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

const CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        x: 0,
        y: 0
      },
      debug: false
    }
  }
}

export function startEngine (config = CONFIG): Phaser.Game { 
  const game = new Phaser.Game(config)

  window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight)
  })

  return game
}