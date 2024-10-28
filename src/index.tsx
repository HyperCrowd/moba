import './ui/css/app.css'
import type { System } from './types.d'

import 'phaser'
import { UI } from './ui'
import { render } from 'solid-js/web'
import { startEngine } from './engine'
//import { connect } from './network'

/**
 * 
 */
async function main (): Promise<System> {
  // Game
  const system = await startEngine()

  // UI
  const ui = document.getElementById('ui')
  render(() => <UI system={system}/>, ui!)

  // Network
  //await connect()

  return system
}

main()
