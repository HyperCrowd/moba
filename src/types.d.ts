export type MaskData = CanvasImageSource & {
  width: number
  height: number
}

export type Projectiles = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  startX: number
  startY: number
  targetX: number
  targetY: number
}

export type Entities = {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys,
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  map: Phaser.GameObjects.Image
  maskData: Uint8ClampedArray
  projectiles: Projectiles[]
}
