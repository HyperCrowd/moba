import type { PublicMembers } from '../types'
import type { ModifierAdjustments } from './types'
import { Value } from './value'
import { EntityManager } from './entityManager'
import { Effect } from './effect'
import { isChildOfType } from './hierarchy/query'

export type EntityJSON = PublicMembers<Entity>
export type Stats = Record<string, Value>
export class Entity {
  // Group ID
  id: number

  // Group type
  type: number

  // Name of the group
  name: string

  // Tags for the entity
  tags: string[]

  // Active effects on the entity
  effects: Effect[]

  // The stats of the entity
  stats: Stats

  // What entities the Entity is focused on
  focus: EntityManager

  /**
   *
   */
  constructor(config: EntityJSON) {
    const focus = config.focus instanceof EntityManager
      ? config.focus
      : new EntityManager((config.focus ?? []) as EntityJSON[])

    this.id = config.id ?? -1
    this.type = config.type ?? -1
    this.name = config.name ?? 'Please provide a name'
    this.tags = config.tags || []
    this.effects = config.effects || []
    this.stats = config.stats || {}
    this.focus = focus
  }

  /**
   *
   */
  toJSON () {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      tags: this.tags,
      effects: this.effects,
      focus: this.focus
    }
  }

  /**
   * Add an effect
   */
  addEffect (modifierId: number, currentTime: number, effectId?: number, adjustments: ModifierAdjustments = {}): Effect | boolean {
    const effect = new Effect({
      id: effectId,
      modifierId,
      startsAt: currentTime
    })
    effect.adjust(adjustments)

    const appliedEffects = this.effects.filter(effect => effect.modifierId === modifierId).length

    if (appliedEffects >= (effect.maxStacks)) {
      // The modifier has been applied enough times
      return false
    }

    if (effect.duration <= 0 || effect.endsAt <= currentTime) {
      // The duration is invalid
      return false
    }

    this.effects.push(effect)

    return effect
  }

  /**
   *
   */
  isChildOfType (type: number) {
    return isChildOfType(this.type, type)
  }

  /**
   *
   */
  isEffectActive (effectId: number, currentTime: number) {
    const effect = this.effects.find(effect => effectId === effect.id)

    if (effect === undefined) {
      return false
    }

    if (currentTime < effect.startsAt) {
      return false
    }

    if (currentTime >= effect.endsAt) {
      return false
    }

    return true
  }

/**
 *
 */
  addFocus (entity: Entity) {
    return this.focus.add(entity)
  }

  /**
   *
   */
  removeFocus (entity: Entity) {
    return this.focus.removeByItem(entity)
  }

  /**
   *
   */
  isFocusedOn (entity: Entity) {
    return this.focus.getIndexByItem(entity) > -1
  }

  /**
   *
   */
  filterFocus ( criteria: string[]) {
    return this.focus.find(criteria)
  }

  /**
   * 
   */
  getStats (currentTime: number): Stats {
    const result: Stats = {}

    Object.keys(this.stats).forEach(key => result[key] = this.stats[key].clone())

    for (const effect of this.effects) {
      const impact = effect.getImpact(currentTime)

      for (const key of Object.keys(impact)) {
        if (result[key] === undefined) {
          result[key] = new Value({
            amount: 0
          })
        }

        result[key].amount += impact[key]
      }
    }

    return result
  }
}
