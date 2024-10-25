import 'phaser'
import './ui/app.css'
import UI from './ui'
import { render } from 'solid-js/web'
import { startEngine } from './engine'
import { connect } from './network'

/**
 * 
 */
async function main (): Promise<Phaser.Game> {
  // UI
  const root = document.getElementById('root')
  render(() => <UI />, root!)
  
  // Game
  const game = startEngine()

  // Network
  await connect()

  return game
}

main()
