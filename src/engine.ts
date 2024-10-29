import type {
  System,
} from './types.d'

import 'phaser'
import EventQueue from './events'
import { createMovement, updateMovement } from './gameplay/movement'
import { createProjectiles, updateProjectiles } from './gameplay/projectiles'
import { createMap, updateMap } from './gameplay/map'
import { createOrbit } from './visuals/particles'

let system: System
let lastDelta = 0

const CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  // type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: {
    /**
     * 
     */
    preload: function (this: Phaser.Scene): void {
      this.load.image('map', 'map.jpg')
      this.load.image('mask', 'mask_map.png')
      this.load.image('player', 'player.png')
      this.load.image('fireball', 'fireball.png')
    },

    /**
     * 
     */
    create: function (this: Phaser.Scene): void {
      const eventQueue = new EventQueue({ verbose: false })
      const { map, maskData } = createMap(this, eventQueue)
      const { player, cursors } = createMovement(this, eventQueue)
      const { projectiles } = createProjectiles(this, eventQueue, player)

      system = {
        cursors,
        player,
        map,
        maskData,
        projectiles,
        eventQueue,
        game: this.game,
        performance: {
          getLastDelta: () => lastDelta
        }
      }

      createOrbit(this, player.x, player.y, 50, 0, 'fireball', {
        colorMode: 'light',
        color: [ 0xfacc22, 0xf89800, 0xf83600, 0x9f0404, 0x4b4a4f, 0x353438, 0x040404 ],
        tail: 1,
        speed: 0.75,
        flaring: 0.2,
        follows: player
      })

      this.game.events.emit('systemReady', system)
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
  return new Promise(resolve => {
    const game = new Phaser.Game(config)

    window.addEventListener('resize', () => {
      game.scale.resize(window.innerWidth, window.innerHeight)
    })

    game.events.once('systemReady', () => {
      resolve(system)
    })
  })
}

/**
 *
 */
export function getSystem() {
  return system
}