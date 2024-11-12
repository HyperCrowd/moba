import type { Struct, PublicMembers, NumericKeyPair } from '../types'
import type { ModifierJSON } from './modifier'
import { getModifierById } from './modifiers'
import type { ModifierImpact } from './types'

export type EffectJSON = PublicMembers<Effect>

export const defaultAdjustment = {
  duration: 0,
  amount: 0,
  target: 0,
  falloffType: 0,
  maxStacks: 0,
  tags: []
}

export class Effect {
  public readonly id?: number // TODO autogenerate?

  // The modifier the effect applies
  public readonly modifierId: number

    // The Current Degree the effect starts at
  public readonly startsAt: number

  // The Current Degree the effect ends at
  public readonly endsAt: number

  // What adjustments are applied to the modifier before the effect makes an impact
  public readonly adjustments: ModifierJSON

  constructor (config: EffectJSON) {
    this.id = config.id ?? 0
    this.modifierId = config.modifierId ?? -1
    this.startsAt = config.startsAt ?? -1
    this.endsAt = config.endsAt ?? -1
    this.adjustments = config.adjustments || defaultAdjustment
  }

  /**
   *
   */
  toJSON (): Struct {
    return {
      id: this.id,
      modifierId: this.modifierId,
      startsAt: this.startsAt,
      endsAt: this.endsAt,
      adjustments: this.adjustments
    }
  }

  /**
   *
   */
  isActive (currentTime: number) {
    if (this.endsAt === -1) {
      return true
    }

    if (currentTime < this.startsAt) {
      return false
    }

    if (currentTime >= this.endsAt) {
      return false
    }

    return true
  }

  /**
   *
   */
  getModifier (modifierId = this.modifierId) {
    return getModifierById(modifierId)
  }

  /**
   *
   */
  getImpact (currentTime: number): NumericKeyPair | false {
    const modifier = getModifierById(this.modifierId)

    if (modifier === false) {
      return false
    }

    const falloffFactor = modifier.getFalloffFactor(currentTime, this.startsAt, this.endsAt)

    const impact: ModifierImpact = { ...modifier.impact }
    const result: NumericKeyPair = {}

    for (const key of Object.keys(impact)) {
      const target = key as keyof ModifierJSON
      let value = impact[target]

      if (this.adjustments[target] !== undefined) {
        value += this.adjustments[target] as number
      }

      value *= falloffFactor

      result[key] = value
    }

    return result
  }
}
