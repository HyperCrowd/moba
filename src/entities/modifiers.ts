import { Modifier } from './modifier'
import { FalloffType } from './constants'

type Modifiers = {
  [key: string]: Modifier
}
type ModifiersKey = keyof Modifiers | undefined

const modifiers: Modifiers = {
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

const modifierKeys = Object.keys(modifiers)

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
