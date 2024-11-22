import type { Struct, PublicMembers, NumericKeyPair } from '../types'
import { getModifierById } from './modifiers'
import type { ModifierAdjustments } from './types'
import { FalloffType } from './constants'
import { mergeUniqueArrays } from '../utils/uniqueArray'

export type EffectConfig = {
  id?: number
  modifierId?: number
  startsAt?: number
  duration?: number
  endsAt?: number
  impact?: NumericKeyPair,
  targets?: string[]
  criteria?: string[],
  falloffType?: number
  tags?: string[]
  maxStacks?: number
}

export type EffectJSON = PublicMembers<Effect>

export class Effect {
  public readonly id?: number

  // The modifier the effect applies
  public readonly modifierId: number

    // The Current Degree the effect starts at
  public readonly startsAt: number

  // The Current Degree the effect ends at
  public endsAt: number = 0

  // What adjustments are applied to the modifier before the effect makes an impact
  public impact: NumericKeyPair

  // How long the effect lasts
  public duration: number = 0

  // Who the effect targets
  public targets: string[] = []

  // Criteria of targeting
  public criteria: string[] = []

  // Effect falloff shape
  public falloffType: number = FalloffType.None

  // Additional effect tags
  public tags: string[] = []

  // How many stacks of the effect can be applied
  public maxStacks: number = 1

  /**
   * 
   */
  constructor (config: EffectJSON) {
    if (config.startsAt === undefined) {
      throw new RangeError('startsAt must be defined when creating a new Effect')
    }

    if (config.modifierId === undefined) {
      throw new RangeError('modifierId must be defined when creating a new Effect')
    }

    this.id = config.id //TODO autogenerate
    this.modifierId = config.modifierId
    this.startsAt = config.startsAt

    const modifier = getModifierById(this.modifierId)

    this.duration = config.duration ?? modifier.duration ?? this.duration
    this.endsAt = config.endsAt ?? (this.startsAt + this.duration)
    this.targets = config.targets ?? modifier.targets ?? this.targets
    this.falloffType = config.falloffType ?? modifier.falloffType ?? this.falloffType
    this.maxStacks = config.maxStacks ?? modifier.maxStacks ?? this.maxStacks

    this.impact = {
      ...config.impact,
      ...modifier.impact
    }

    this.criteria = mergeUniqueArrays((config.criteria ?? []), modifier.criteria)
    this.tags = mergeUniqueArrays((config.tags ?? []), modifier.tags)
  }

  /**
   * 
   */
  adjust (adjustments: ModifierAdjustments = {}) {
    const modifier = getModifierById(this.modifierId)
    const impact: NumericKeyPair = { ...this.impact }
    const replace = adjustments.replace || {}
    const add = adjustments.add || {}
    const remove = adjustments.remove || {} 
    const replaceKeys = Object.keys(adjustments.replace || {})
    const addKeys = Object.keys(adjustments.add || {})
    const removeKeys = Object.keys(adjustments.remove || {})

    let endsAt = this.startsAt + modifier.duration
    let duration = modifier.duration
    let targets = [ ...modifier.targets]
    let criteria = [...modifier.criteria]
    let falloffType = modifier.falloffType
    let tags = [...modifier.tags]
    let maxStacks = modifier.maxStacks
  

    for (const replaceKey of replaceKeys) {
      switch (replaceKey) {
        case 'duration':
          duration = replace.duration ?? duration
          endsAt = this.startsAt + duration
          break
        case 'targets':
          targets = [...(replace.targets ?? targets)]
          break
        case 'criteria':
          criteria = [...(replace.criteria ?? criteria)]
          break
        case 'falloffType':
          falloffType = replace.falloffType ?? falloffType
          break
        case 'tags':
          tags = [...(replace.tags ?? tags)]
          break
        case 'maxStacks':
          maxStacks = replace.maxStacks ?? maxStacks
          break
        default:
          impact[replaceKey] = replace[replaceKey] as number
          break
      }
    }

    for (const addKey of addKeys) {
      switch (addKey) {
        case 'duration':
          duration += add.duration ?? 0
          endsAt = this.startsAt + duration
          break
        case 'targets':
          targets = mergeUniqueArrays(add.targets ?? [], targets)
          break
        case 'criteria':
          criteria = mergeUniqueArrays(add.criteria ?? [], targets)
          break
        case 'falloffType':
          break
        case 'tags':
          tags = mergeUniqueArrays(add.tags ?? [], targets)
          break
        case 'maxStacks':
          maxStacks += add.maxStacks ?? 0
          break
        default:
          if (impact[addKey] === undefined) {
            impact[addKey] = 0
          }

          impact[addKey] += add[addKey] as number
          break
      }
    }

    for (const removeKey of removeKeys) {
      switch (removeKey) {
        case 'duration':
          break
        case 'targets':
          for (const target of remove.targets || []) {
            const index = targets.indexOf(target)

            if (index > -1) {
              targets = targets.splice(index, 1)
            }
          }
          break
        case 'criteria':
          for (const query of remove.criteria || []) {
            const index = criteria.indexOf(query)

            if (index > -1) {
              criteria = criteria.splice(index, 1)
            }
          }
          break
        case 'falloffType':
          falloffType = FalloffType.None
          break
        case 'tags':
          for (const tag of remove.tags || []) {
            const index = tags.indexOf(tag)

            if (index > -1) {
              tags = tags.splice(index, 1)
            }
          }  
          break
        case 'maxStacks':
          break
        default:
          delete impact[removeKey]
          break
      }
    }
  
    this.endsAt = endsAt
    this.impact = impact
    this.targets = targets
    this.duration = duration
    this.criteria = criteria
    this.falloffType = falloffType
    this.tags = tags
    this.maxStacks = maxStacks
  }

  /**
   *
   */
  toJSON (): Struct {
    return {
      id: this.id,
      modifierId: this.modifierId,
      startsAt: this.startsAt,
      impact: this.impact,
      endsAt: this.endsAt,
      duration: this.duration,
      targets: this.targets,
      criteria: this.criteria,
      falloffType: this.falloffType,
      tags: this.tags,
      maxStacks: this.maxStacks
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
  getImpact (currentTime: number): NumericKeyPair {
    const modifier = getModifierById(this.modifierId)

    const falloffFactor = modifier.getFalloffFactor(currentTime, this.startsAt, this.endsAt)
    const result: NumericKeyPair = {}

    for (const key of Object.keys(this.impact)) {
      let value = this.impact[key]
      value *= falloffFactor
      result[key] = value
    }

    return result
  }
}
