import 'phaser'
import './index.css'
import App from './App'
import { render } from 'solid-js/web'
import { startEngine } from './engine'

/**
 * 
 */
function main (): Phaser.Game {
  // UI
  const root = document.getElementById('root')
  render(() => <App />, root!)
  
  // Game
  const game = startEngine()
  return game
}

main()
