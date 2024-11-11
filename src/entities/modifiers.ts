import { Modifier } from './modifier'
import { FalloffType } from './types'

type Modifiers = {
  [key: string]: Modifier
}
type ModifiersKey = keyof Modifiers | undefined

const modifiers: Modifiers = {
  famous: new Modifier({
    id: 0,
    name: 'Famous',
    description: 'This person is well-known.',
    duration: 20,
    amount: 1,
    targets: ['Sentient'],
    criteria: '*',
    falloffType: FalloffType.None,
    tags: [],
    maxStacks: 1
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
    return false
  }
}
