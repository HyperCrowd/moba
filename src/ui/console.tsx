import './css/console.css'
import type { System } from '../types.d'
import { createSignal, onCleanup } from 'solid-js'
import { Performance } from './performance'
import { EventType } from '../events/events'
import { act } from '../events/action'

type Command = {
  command: string
  output: string
}

type Props = {
  system: System
}

/**
 * 
 */
export const Console = ({ system }: Props) => {
  const [visible, setVisible] = createSignal(false)
  const [commands, setCommands] = createSignal<Command[]>([])
  const [outputs, setOutputs] = createSignal<string[]>([])
  const [input, setInput] = createSignal('')
  
  let historyRef: HTMLDivElement
  let inputRef: HTMLInputElement

  const toggleConsole = () => {
    setVisible((prev) => {
      if (!prev === true && inputRef) {
        system.eventQueue.emit(EventType.CONSOLE_OPEN)
        inputRef.focus()
      } else {
        system.eventQueue.emit(EventType.CONSOLE_CLOSE)
      }
      return !prev
    })
  }

  const handleKeyDown = async (event: KeyboardEvent) => {
    // TODO Only allow console activation in development mode
    if (event.key === '`') {
      event.preventDefault()
      toggleConsole()
    }

    const isVisible = visible() === true

    if (isVisible === true) {
      event.stopImmediatePropagation()
      system.cursors.up.enabled = false
      system.cursors.right.enabled = false
      system.cursors.down.enabled = false
      system.cursors.left.enabled = false
      system.cursors.space.enabled = false
      system.cursors.shift.enabled = false
    } else {
      system.cursors.up.enabled = true
      system.cursors.right.enabled = true
      system.cursors.down.enabled = true
      system.cursors.left.enabled = true
      system.cursors.space.enabled = true
      system.cursors.shift.enabled = true
    }

    const textInput = input()

    if (event.key === 'Enter' && isVisible) {
      const newCommands = [
        ...commands().slice(0, 100),
        {
          command: textInput,
          output: `Output: ${textInput}`
        }
      ]

      if (textInput === 'debugger') {
        // eslint-disable-next-line no-debugger
        debugger;
      }

      const parts = textInput.split(' ')
      setCommands(newCommands)
      setInput('')


      const options = parts.slice(1).map(o => {
        if (o[0] === '@') {
          switch (o.slice(1)) {
            case 'x': return system.player.x
            case 'y': return system.player.y
          }
        } else if (o[0] === '>') {
          switch (o.slice(1)) {
            case 'x': return system.game.input.mousePointer?.worldX
            case 'y': return system.game.input.mousePointer?.worldY
          }
        }
      })

      const { result } = await act(parts[0], options, true);

      if (result !== false) {
        setOutputs([...outputs(), `"${parts[0]}" does not exist`])
      } else {
        setOutputs([...outputs(), textInput])
      }
      
      if (historyRef) {
        historyRef.scrollTop = historyRef.scrollHeight;
      }
    }
  }

  // Add event listener for keydown
  document.addEventListener('keydown', handleKeyDown)
  onCleanup(() => document.removeEventListener('keydown', handleKeyDown))

  return (
    <div class={`console ${visible()
      ? 'open'
      : ''
    }`}>
      <Performance
        system={system}
      />
      <div
        class="command-history"
        ref={(el) => (historyRef = el)}
      >
        {commands().map((cmd) => (
          <div>
            <div>{cmd.command}</div>
            <div>{cmd.output}</div>
          </div>
        ))}
      </div>
      <div class="input-area">
        <input
          type="text"
          ref={(el) => (inputRef = el)}
          value={input()}
          onInput={(e) => setInput(e.target.value)}
          style={{ width: '100%' }}
          placeholder="Enter command..."
        />
      </div>
    </div>
  )
}

export default Console
