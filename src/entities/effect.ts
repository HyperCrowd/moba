import type { Struct, PartialPublicMembers, NumericKeyPair } from '../types'
import type { ModifierJson } from './modifier'
import { getModifierById } from './modifiers'

type EffectJson = PartialPublicMembers<Effect>

export const defaultAdjustment = {
  duration: 0,
  amount: 0,
  target: 0,
  falloffType: 0,
  tags: [],
  maxStacks: 0
}

export class Effect {
  public readonly id: number

  // The modifier the effect applies
  public readonly modifierId: number

  // This person needs to be active for the effect to be active
  public readonly demographyId: number

  // The Current Degree the effect starts at
  public readonly startsAt: number

  // The Current Degree the effect ends at
  public readonly endsAt: number

  // What adjustments are applied to the modifier before the effect makes an impact
  public readonly adjustments: ModifierJson

  /**
   *
   */
  static fromJSON (json: string) {
    const effectJson: Struct = JSON.parse(json)

    return new Effect(effectJson)
  }

  constructor (options: EffectJson) {
    this.id = options.id ?? 0 // TODO default value
    this.modifierId = options.modifierId ?? 0 // TODO default value
    this.demographyId = options.demographyId ?? 0 // TODO default value
    this.startsAt = options.startsAt ?? 0 // TODO default value
    this.endsAt = options.endsAt ?? 0 // TODO default value
    this.adjustments = options.adjustments || defaultAdjustment
  }

  /**
   *
   */
  toJSON () {
    return JSON.stringify({
      id: this.id,
      modifierId: this.modifierId,
      demographyId: this.demographyId,
      startsAt: this.startsAt,
      endsAt: this.endsAt,
      adjustments: this.adjustments
    })
  }

  /**
   *
   */
  isActive (currentTime: number) {
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
    const modifier = this.getModifier(this.modifierId)

    if (modifier === false) {
      return false
    }

    const falloffFactor = modifier.getFalloffFactor(currentTime, this.startsAt, this.endsAt)

    const impact = { ...modifier.impact }
    const result = {}

    for (const key of Object.keys(impact)) {
      let value = impact[key]

      if (this.adjustments[key]) {
        value += this.adjustments[key]
      }

      value *= falloffFactor

      result[key] = value
    }

    return result
  }
}
