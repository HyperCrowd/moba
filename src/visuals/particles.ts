import { getBasename } from '../utils/strings'
import { getSystem } from '../engine'

type ParticleCache = {
  [key: string]: Phaser.GameObjects.Particles.ParticleEmitter
}

const infiniteDuration = () => false

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

/**
 * 
 */
export function createOrbit (scene: Phaser.Scene, x: number, y: number, radius: number, speed: number, duration: number, follows: Phaser.GameObjects.Sprite | undefined = undefined, texture: string = 'fireball',) {
  const emitter = scene.add.particles(x, y, texture, {
    lifespan: 300,
    speed: { min: 100, max: 200 },
    scale: { start: 0.4, end: 0 },
    quantity: 1,
    blendMode: 'ADD' 
  })

  const system = getSystem()
  let angle = 0
  let elapsed = 0

  const timed = () => elapsed >= duration

  const widthOffset = (follows?.displayWidth ?? 0) / 2
  const heightOffset = (follows?.displayHeight ?? 0) / 2

  system.eventQueue.addAction((delta: number) => {
    elapsed += delta
    angle += speed
    
    const cos = radius * Math.cos(angle)
    const sin = radius * Math.sin(angle)
    const followX = follows?.body?.position.x as number
    const followY = follows?.body?.position.y as number

    const emitterX = follows
      ? followX + cos + widthOffset
      : x + cos

    const emitterY = follows
      ? followY + sin + heightOffset
      : y + sin

      emitter.emitParticleAt(emitterX, emitterY, 1)

      emitter.setPosition(emitterX, emitterY)
      //emitter.setEmitterAngle(angle)
      emitter.setRotation(angle)
  }, duration === 0
    ? infiniteDuration
    : timed,
  () => emitter.destroy()
  )

  return emitter
}

/**
 * 
 */
export function createCircleBurst (scene: Phaser.Scene, x: number, y: number, radius: number, duration: number = 500, texture: string = 'fireball',) {
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

  emitter.on('complete', () => {
    emitter.destroy()
  })

  return emitter
}
