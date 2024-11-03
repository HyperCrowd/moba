import type { Actors, Shapes } from '../types'

import { getBasename } from '../utils/strings'
import { getSystem, actorFollow } from '../engine'
import { getIntFromReal, getIntFromRealRange } from '../utils/math'
import { getColorMode } from '../utils/colors'

type ParticleCache = {
  [key: string]: Phaser.GameObjects.Particles.ParticleEmitter
}

type OrbitConfig = {
  colorMode?: string
  color?: number[]
  flaring?: number // 0 - 1
  speed?: number // 0 -1
  tail?: number // 0 - 1
  follows?: Actors
}

const particles: ParticleCache = {}

/**
 * 
 * @param scene 
 * @param texturePaths 
 */
export function loadParticles (scene: Phaser.Scene, texturePaths: string[]): ParticleCache {
  const result: { [key: string]: Phaser.GameObjects.Particles.ParticleEmitter } = {}
  for (const texturePath of texturePaths) {
    const texture = getBasename(texturePath)
    scene.load.image(texture, texturePath)
    const particle = scene.add.particles(0, 0, texture)
    particles[texture] = particle
  }

  return result
}

export function createFire (scene: Phaser.Scene, x: number, y: number, radius: number, duration: number, texture: string = 'fireball', config: OrbitConfig = {}) {
  const flaring = getIntFromReal(config.flaring ?? 0.5, 200)
  const tail = getIntFromReal(config.tail ?? 0.25, 2400)

  const fire = scene.add.particles(x, y, texture, {
    color: config.color ??  [ 0xfacc22, 0xf89800, 0xf83600, 0x9f0404 ],
    colorEase: 'quad.out',
    lifespan: tail,
    angle: { min: -100, max: -80 },
    scale: { start: radius ?? 1, end: 0, ease: 'sine.out' },
    speed: flaring,
    quantity: 1,
    advance: 2000,
    blendMode: getColorMode(config.colorMode ?? 'blend'),
    duration
  })

  fire.on('complete', () => {
    fire.destroy()
  })

  if (config.follows) {
    actorFollow(fire, config.follows) 
  }
}

/**
 * 
 */
function emitZoneFollows (shape: Shapes, emitter: Phaser.GameObjects.Particles.ParticleEmitter, follows: Actors) {
  const system = getSystem()

  const widthOffset = follows && 'displayWidth' in follows
    ? follows.displayWidth
    : 0

  const heightOffset = follows && 'displayHeight' in follows
    ? follows.displayHeight
    : 0

  const unfollow = system.eventQueue.addUpdate(() => {
    const followX = follows?.body?.position.x as number
    const followY = follows?.body?.position.y as number

    emitter.setPosition(
      followX - shape.x + widthOffset / 2,
      followY - shape.y + heightOffset / 2
    )
  })

  return unfollow
}

/**
 * 
 */
export function createOrbit (scene: Phaser.Scene, x: number, y: number, radius: number, duration: number, texture: string = 'fireball', config: OrbitConfig = {}) {
  const circle = new Phaser.Geom.Circle(x, y, radius);
  const flaring = getIntFromReal(config.flaring ?? 0.5, 100)
  const speed = 225 - getIntFromRealRange(config.speed ?? 0.25, 25, 200)
  const tail = getIntFromReal(config.tail ?? 0.25, 800)

  const emitter = scene.add.particles(0, 0, texture, {
    color: config.color,
    blendMode: getColorMode(config.colorMode ?? ''),
    lifespan: tail,
    quantity: 1,
    speed: flaring,
    scale: { start: 0.5, end: 0 },
    duration
  })

  emitter.addEmitZone({
    type: 'edge',
    source: circle,
    quantity: speed,
    total: 1
  })

  const onComplete = [
    () => emitter.destroy()
  ]

  if (config.follows) {
    onComplete.push(
      emitZoneFollows(circle, emitter, config.follows)
    )
  }

  emitter.on('complete', () => {
    onComplete.forEach(cleanup => cleanup())
  })

  return emitter
}

/**
 * 
 */
export function createCircleBurst (scene: Phaser.Scene, x: number, y: number, radius: number, duration: number = 500, texture: string = 'fireball', config: OrbitConfig = {}) {
  const circle = new Phaser.Geom.Circle(x, y, radius);
  const emitter = scene.add.particles(0, 0, texture, {
    blendMode: 'ADD',
    lifespan: radius * 2,
    quantity: 1,
    scale: { start: 0.5, end: 0.1 },
    duration
  });

  emitter.addEmitZone({
    type: 'random',
    source: circle,
    quantity: 1
  })

  const onComplete = [
    () => emitter.destroy()
  ]

  if (config.follows) {
    onComplete.push(
      emitZoneFollows(circle, emitter, config.follows)
    )
  }

  emitter.on('complete', () => {
    onComplete.forEach(cleanup => cleanup())
  })

  return emitter
}
