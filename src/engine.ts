import type {
  System,
} from './types.d'

import 'phaser'
import EventQueue from './events'
import { createMovement, updateMovement } from './gameplay/movement'
import { createProjectiles, updateProjectiles } from './gameplay/projectiles'
import { createMap, updateMap } from './gameplay/map'

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

      this.game.events.emit('systemReady', system)
    },

    /**
     * 
     */
    update: function (this: Phaser.Scene, _, delta: number): void {
      lastDelta = delta
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
