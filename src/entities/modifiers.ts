import { FalloffType } from './constants'
import { Modifier } from './modifier'

type Modifiers = {
  [key: string]: Modifier
}

type ModifiersKey = keyof Modifiers | undefined

let modifiers: Modifiers
let modifierKeys: string[]

/**
 * 
 */
export const defineModifiers = () => {
  modifiers = {
    example: new Modifier({
      id: -1,
      name: 'Example',
      description: 'Makes the target slightly ill',
      duration: 20,
      targets: ['Sentient'],
      criteria: ['*'],
      falloffType: FalloffType.Linear,
      tags: [],
      maxStacks: 1,
      impact: {
        health: 1
      }
    })
  }

  modifierKeys = Object.keys(modifiers)
}

/**
 *
 */
export const getModifierById = (modifierId: number) => {
  const key: ModifiersKey = modifierKeys.find(key => modifiers[key].id === modifierId)

  if (key !== undefined) {
    return modifiers[key]
  } else {
    throw new RangeError(`Modifier ID ${modifierId} does not exist`)
  }
}
