// Module Types

import type { Line } from './maps/types'
import type {
  System,
  Actors
} from './types.d'

// Module Definitions

import 'phaser'
import EventQueue from './events'
import { createMovement, updateMovement } from './gameplay/movement'
import { createProjectiles, updateProjectiles } from './gameplay/projectiles'
import { createMap, updateMap } from './maps'
import { createOrbit } from './visuals/particles'
// import { createCircle, createRectangle } from './visuals/shapes'
import { startActions } from './events/action'
import { EventType } from './events/events'
import { loadMask } from './maps/masks'
// import { createSmoke } from './visuals/shaders'
import { defineModifiers } from './entities/modifiers'

// Phaser cannot handle await/async in the preload/create process, so we preload custom assets here
const assets: {
  boundaries: Line[]
} = {
  boundaries: []
}

let system: System
let lastDelta = 0

const CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: {
    /**
     * 
     */
    preload: function (this: Phaser.Scene): void {
      this.load.image('map', 'map.jpg')
      this.load.image('dot', 'black_pixel.png')
      this.load.image('player', 'player.png')
      this.load.image('fireball', 'fireball.png')
    },

    /**
     * 
     */
    create: async function (this: Phaser.Scene): Promise<void> {
      defineModifiers()
      const eventQueue = new EventQueue({ verbose: false })
      const { map } = createMap(this, eventQueue, )
      const { player, cursors } = createMovement(this, eventQueue)
      const { projectiles } = createProjectiles(this, eventQueue, player)
      

      // TODO move to debug 
      // for (const coord of assets.boundaries) {
      //   createLine(this, coord[0][0], coord[0][1], coord[1][0], coord[1][1])
      // }

      system = {
        cursors,
        player,
        map,
        projectiles,
        eventQueue,
        game: this.game,
        scene: this,
        performance: {
          getLastDelta: () => lastDelta
        }
      }

      startActions(system)

      // TODO remove these tests below

      createOrbit(this, player.x, player.y, 50, 0, 'fireball', {
        colorMode: 'light',
        color: [ 0xfacc22, 0xf89800, 0xf83600, 0x9f0404, 0x4b4a4f, 0x353438, 0x040404 ],
        tail: 1,
        speed: 0.75,
        flaring: 0.2,
        follows: player
      })

      // createCircle(this, player.x, player.y, {
      //   borderWidth: 6,
      //   borderColor: 0x000000,
      //   colors: [0xff0000],
      //   duration: 0,
      //   fillType: 'solid',
      //   width: 50,
      //   follows: player
      // })

      // createRectangle(this, player.x + 200, player.y, {
      //   borderWidth: 0,
      //   borderColor: 0x00ff00,
      //   colors: [0x0000ff, 0x008800],
      //   duration: 0,
      //   fillType: 'pulse',
      //   pulseDelay: 500,
      //   width: 100,
      //   height: 150,
      //   follows: player
      // })

      // createSmoke(this, player.x, player.y, 100, 100, 10000, {
      //   follows: player
      // })

      this.game.events.emit('gameReady', system)
    },

    /**
     * 
     */
    update: function (this: Phaser.Scene, _, delta: number): void {
      lastDelta = delta
      system.eventQueue.update(delta)
      updateMovement(this, system)
      updateMap(this)
      updateProjectiles(this, system)
    }
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

/**
 * 
 */
export async function startEngine (config = CONFIG): Promise<System> { 
  assets.boundaries = await loadMask('map_mask.json')
  
  return new Promise(resolve => {

    const game = new Phaser.Game(config)

    window.addEventListener('resize', () => {
      game.scale.resize(window.innerWidth, window.innerHeight)
    })

    game.events.once('gameReady', () => {
      resolve(system)
      system.eventQueue.emit(EventType.GAME_READY)
    })
  })
}

/**
 *
 */
export function getSystem() {
  return system
}

/**
 * TODO Add the ability to follow the mouse
 * TODO move this to an Action
 * @param source 
 * @param target 
 * @param duration 
 */
export function actorFollow(source: Actors, target: Actors, duration: number = 0, destroyOnComplete = true) {
  let elapsed = 0

  const widthOffset = 'displayWidth' in target
    ? target.displayWidth
    : 0

  const heightOffset = 'displayHeight' in target
    ? target.displayHeight
    : 0

  const unfollow = system.eventQueue.addUpdate((delta: number) => {
    elapsed += delta

    const followX = target.body
      ? target.body.position.x
      : target.x

      const followY = target.body
      ? target.body.position.y
      : target.y

    source.setPosition(
      followX + widthOffset / 2,
      followY + heightOffset / 2
    )
  },
  duration === 0
    ? undefined
    : () => elapsed >= duration,
  () => {
    if (destroyOnComplete === true) {
      source.destroy()
    }
  })

  return unfollow
}
