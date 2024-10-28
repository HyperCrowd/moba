import './css/ui.css'
import './css/skills.css'
import type { System } from '../types.d'

import { Console } from './console'

type Props = {
  system: System
}

/**
 * 
 */
export function UI({ system }: Props) {
  return (
    <>
      <canvas id="game"></canvas>
      <div class="overlay">
        <div class="tray" id="tray-left">

        </div>
        <div class="tray" id="tray-right">

        </div>
        <div class="tray" id="tray-top">

        </div>
        <div class="tray" id="tray-bottom">
          <div class="skill-container">
            <button class="skill-slot">Skill 1</button>
            <button class="skill-slot">Skill 2</button>
            <button class="skill-slot">Skill 3</button>
            <button class="skill-slot">Skill 4</button>
            <button class="skill-slot">Skill 5</button>
          </div>
        </div>

        <div class="middle">
          <div class="tray" id="tray-ul">

          </div>
          <div class="tray" id="tray-um">

          </div>
          <div class="tray" id="tray-ur">

          </div>
          <div class="tray" id="tray-cl">

          </div>
          <div class="tray" id="tray-cm">

          </div>
          <div class="tray" id="tray-cr">

          </div>
          <div class="tray" id="tray-ll">

          </div>
          <div class="tray" id="tray-lm">

          </div>
          <div class="tray" id="tray-lr">

          </div>
        </div>
    </div>
    <Console system={system} />
  </>
  )
}
