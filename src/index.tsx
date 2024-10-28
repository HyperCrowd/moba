import './ui/app.css'
import type { System } from './types.d'

import 'phaser'
import { UI } from './ui'
import { render } from 'solid-js/web'
import { startEngine } from './engine'
import { connect } from './network'

/**
 * 
 */
async function main (): Promise<System> {
  // UI
  const root = document.getElementById('root')
  render(() => <canvas id="game"></canvas>, root!)

  // Game
  const system = await startEngine()
  render(() => <UI system={system}/>, root!)

  // Network
  await connect()

  return system
}

main()
