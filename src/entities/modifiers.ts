import { Modifier } from './modifier'
import { FalloffType } from './types'

type IModifiers = {
  [key: string]: Modifier
}

const Modifiers: IModifiers = {
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

const modifierKeys = Object.keys(Modifiers)

/**
 *
 */
export const getModifierById = (modifierId: number) => {
  const key: keyof IModifiers | undefined = modifierKeys.find(key => Modifiers[key].id === modifierId)

  if (key !== undefined) {
    return Modifiers[key]
  } else {
    return false
  }
}
