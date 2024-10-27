import EventQueue from './events'

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type Primitive = number | string | boolean | Function | null | Date

// Define a type for a generalized struct
export type Struct<T = Struct> = {
  [key: string]: Primitive | Primitive[] | Struct | Struct[] | T | T[]
}

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

export type System = {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys,
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  map: Phaser.GameObjects.Image
  maskData: Uint8ClampedArray
  projectiles: Projectiles[]
  eventQueue: EventQueue
}
