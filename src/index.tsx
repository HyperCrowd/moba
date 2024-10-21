import 'phaser'
import './ui/app.css'
import UI from './ui'
import { render } from 'solid-js/web'
import { startEngine } from './engine'

/**
 * 
 */
function main (): Phaser.Game {
  // UI
  const root = document.getElementById('root')
  render(() => <UI />, root!)
  
  // Game
  const game = startEngine()
  return game
}

main()
