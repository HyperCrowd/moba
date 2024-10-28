import './console.css'
import type { System } from '../types.d'
import { createSignal, onCleanup } from 'solid-js'
import { Performance } from './performance'

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
  const [input, setInput] = createSignal('')
  
  let historyRef: HTMLDivElement
  let inputRef: HTMLInputElement

  const toggleConsole = () => {
    setVisible((prev) => {
      if (!prev === true && inputRef) {
        inputRef.focus()
      }
      return !prev
    })
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === '`') {
      event.preventDefault()
      toggleConsole()
    }

    if (event.key === 'Enter' && visible()) {
      const newCommands = [
        ...commands(),
        {
          command: input(),
          output: `Output: ${input()}`
        }
      ]

      setCommands(newCommands)
      setInput('')

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
