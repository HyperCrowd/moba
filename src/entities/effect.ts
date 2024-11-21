import type { Struct, PublicMembers, NumericKeyPair } from '../types'
import { type ModifierJSON, Modifier } from './modifier'
import { getModifierById } from './modifiers'
import type { ModifierAdjustments, ModifierImpact } from './types'
import { FalloffType } from './constants'

export type EffectConfig = {
  id: number
  modifierId: number
  duration: number
  startsAt: number
  endsAt: number
  adjustments: NumericKeyPair,
  targets: string[]
  criteria: string[],
  falloffType: number
  tags: string[]
  maxStacks: number
}

export type EffectJSON = PublicMembers<EffectConfig>

/**
 * 
 */
function populateEffectConfig (startTime: number, modifierOrId: Modifier | number): EffectConfig {
  const modifier = modifierOrId instanceof Modifier
  ? modifierOrId
  : getModifierById(modifierOrId)

  return {
    id: 0, // TODO id generator
    modifierId: modifier.id,
    startsAt: startTime,
    endsAt: startTime + modifier.duration,
    adjustments: {} as NumericKeyPair,
    duration: modifier.duration,
    targets: [ ...modifier.targets],
    criteria: [modifier.criteria],
    falloffType: modifier.falloffType,
    tags: [...modifier.tags],
    maxStacks: modifier.maxStacks
  }
}

/**
 * 
 */
export function getEffectConfig (startTime: number, modifierOrId: Modifier | number, adjustments: ModifierAdjustments = {}): EffectConfig {
  const config = populateEffectConfig(startTime, modifierOrId)

  const replace = adjustments.replace || {}
  const add = adjustments.add || {}
  const remove = adjustments.remove || {}

  const replaceKeys = Object.keys(adjustments.replace || {})
  const addKeys = Object.keys(adjustments.add || {})
  const removeKeys = Object.keys(adjustments.remove || {})

  if (replace.length > 0) {
    for (const replaceKey of replaceKeys) {
      switch (replaceKey) {
        case 'duration':
          config.duration = replace.duration ?? config.duration
          config.endsAt = config.startsAt + config.duration
          break
        case 'targets':
          config.targets = [...(replace.targets ?? config.targets)]
          break
        case 'criteria':
          config.criteria = [...(replace.criteria ?? config.criteria)]
          break
        case 'falloffType':
          config.falloffType = replace.falloffType ?? config.falloffType
          break
        case 'tags':
          config.tags = [...(replace.tags ?? config.tags)]
          break
        case 'maxStacks':
          config.maxStacks = replace.maxStacks ?? config.maxStacks
          break
        default:
          config.adjustments[replaceKey] = replace[replaceKey] as number
          break
      }
    }
  } else {
    for (const addKey of addKeys) {
      switch (addKey) {
        case 'duration':
          config.duration += add.duration ?? 0
          config.endsAt = config.startsAt + config.duration
          break
        case 'targets':
          (add.targets ?? config.targets).forEach(target => config.targets.push(target))
          break
        case 'criteria':
          (add.criteria ?? config.criteria).forEach(criteria => config.criteria.push(criteria))
          break
        case 'falloffType':
          break
        case 'tags':
          (add.tags ?? config.tags).forEach(tag => config.tags.push(tag))
          break
        case 'maxStacks':
          config.maxStacks += add.maxStacks ?? 0
          break
        default:
          config.adjustments[addKey] += add[addKey] as number
          break
      }
    }

    for (const removeKey of removeKeys) {
      switch (removeKey) {
        case 'duration':
          break
        case 'targets':
          for (const target of remove.targets || []) {
            const index = config.targets.indexOf(target)

            if (index > -1) {
              config.targets = config.targets.splice(index, 1)
            }
          }
          break
        case 'criteria':
          for (const criteria of remove.criteria || []) {
            const index = config.criteria.indexOf(criteria)

            if (index > -1) {
              config.criteria = config.criteria.splice(index, 1)
            }
          }
          break
        case 'falloffType':
          config.falloffType = FalloffType.None
          break
        case 'tags':
          for (const tag of remove.tags || []) {
            const index = config.tags.indexOf(tag)

            if (index > -1) {
              config.tags = config.tags.splice(index, 1)
            }
          }  
          break
        case 'maxStacks':
          break
        default:
          delete config.adjustments[removeKey]
          break
      }
    }
  }

  return config
}


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

  // How long the effect lasts
  public readonly duration?: number

  // Who the effect targets
  public readonly targets?: string[]

  // Criteria of targeting
  public readonly criteria?: string[]

  // Effect falloff shape
  public readonly falloffType?: number

  // Additional effect tags
  public readonly tags?: string[]

  // How many stacks of the effect can be applied
  public readonly maxStacks?: number

  constructor (config: EffectJSON) {
    if (config.startsAt === undefined) {
      throw new RangeError('startsAt must be defined when creating a new Effect')
    }

    if (config.modifierId === undefined) {
      throw new RangeError('modifierId must be defined when creating a new Effect')
    }

    const actualConfig = getEffectConfig(config.startsAt, config.modifierId, config.adjustments)
    this.id = config.id
    this.modifierId = config.modifierId
    this.startsAt = config.startsAt
    this.endsAt = actualConfig.endsAt
    this.adjustments = actualConfig.adjustments
    this.targets = actualConfig.targets
    this.duration = actualConfig.duration
    this.criteria = actualConfig.criteria
    this.falloffType = actualConfig.falloffType
    this.tags = actualConfig.tags
    this.maxStacks = actualConfig.maxStacks
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
  getImpact (currentTime: number): NumericKeyPair {
    const modifier = getModifierById(this.modifierId)

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
