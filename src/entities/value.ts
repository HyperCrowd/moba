import type { PartialPublicMembers } from '../types'
import { minSigned32BitInteger, maxSigned32BitInteger } from './../utils/math';
import { Modifier } from './modifier'

export type ValueJson = PartialPublicMembers<Value>

export class Value {
  amount: number
  minimum: number
  maximum: number

  /**
   *
   */
  static getDefault() {
    return {
      amount: 0,
      minimum: minSigned32BitInteger,
      maximum: maxSigned32BitInteger
    }
  }

  constructor(options: ValueJson = Value.getDefault()) {
    this.amount = options.amount ?? 0
    this.maximum = options.maximum ?? minSigned32BitInteger
    this.minimum = options.minimum ?? maxSigned32BitInteger
  }

  /**
   *
   */
  getValue (time: number = 0, modifiers: Modifier[]): number {
    let totalModifier = 0

    for (const modifier of modifiers) {
      const modValue = modifier.getEffect(time)

      if (modValue !== false) {
        totalModifier += modValue
      }
    }

    const result = this.amount + totalModifier

    return result
  }

  isPercentDifference (percent: number): boolean {
    const range = this.maximum - this.minimum
    const decimal = percent / 100

    return percent > 0
      ? this.amount <= range * (decimal)
      : this.amount >= range * (1 - -decimal)
  }

  /**
   *
   */
  addModifier (modifier: Modifier, modifiers: Modifier[]): Modifier[] {
    const existingModifiers = modifiers.filter(element => element.id === modifier.id)

    if (existingModifiers.length > 0 && existingModifiers.length + 1 > existingModifiers[0].maxStacks) {
      // Do not add the modifier, it will exceed the maximum stacks
      return modifiers
    }

    modifiers.push(modifier)

    return modifiers
  }
}
