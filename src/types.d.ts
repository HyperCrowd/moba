import EventQueue from './events'

export type ENV = {
  LOG_LEVEL: string
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type Primitive = number | string | boolean | Function | null | Date | unknown

// Define a type for a generalized struct
export type Struct = {
  [key: string]: 
    | Primitive 
    | Primitive[]
    | Struct
    | Struct[]
};

export type Any = Primitive | Struct

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
  map: Phaser.GameObjects.GameObjectFactory.blitter
  projectiles: Projectiles[]
  eventQueue: EventQueue
  game: Phaser.Game,
  scene: Phaser.Scene,
  performance: {
    getLastDelta: () => number
  }
}

export type KeyInputEvent = InputEvent & {
  currentTarget: HTMLInputElement
  target: HTMLInputElement
}

export type Shapes = Phaser.Geom.Circle
  | Phaser.Geom.Ellipse
  | Phaser.Geom.Line
  | Phaser.Geom.Polygon
  | Phaser.Geom.Rectangle
  | Phaser.Geom.Triangle
  | Phaser.Geom.Mesh

export type Actors = Phaser.GameObjects.Sprite
  | Phaser.GameObjects.Particles.ParticleEmitter
  | Phaser.GameObjects.Graphics