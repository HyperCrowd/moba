import type {
  Entities,
} from './types.d'

import 'phaser'
import { createMovement, updateMovement } from './gameplay/movement'
import { createProjectiles, updateProjectiles } from './gameplay/projectiles'
import { createMap, updateMap } from './gameplay/map'

let entities: Entities

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
      const { map, maskData } = createMap(this)
      const { player, cursors } = createMovement(this)
      const { projectiles } = createProjectiles(this, player)
    
      entities = {
        cursors,
        player,
        map,
        maskData,
        projectiles
      }
    },

    /**
     * 
     */
    update: function (this: Phaser.Scene): void {
      updateMovement(this, entities)
      updateMap(this)
      updateProjectiles(this, entities)
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
export function startEngine (config = CONFIG): Phaser.Game { 
  const game = new Phaser.Game(config)

  window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight)
  })

  return game
}