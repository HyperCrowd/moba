import type { PublicMembers } from '../types'

import { isChildOfType } from './hierarchy/query'
import { getModifierById } from './modifiers'
import { EntityManager } from './entityManager'
import { Effect } from './effect'
import { Modifier, ModifierJSON } from './modifier'

export type EntityJSON = PublicMembers<Entity>

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
  addEffect (modifierId: number, currentTime: number, adjustments: ModifierJSON): Effect | boolean {
    const modifier = getModifierById(modifierId)

    if (modifier === false) {
      // The modifier does not exist
      return false
    }

    const appliedEffects = this.effects.filter(effect => effect.modifierId === modifierId).length

    if (appliedEffects >= (modifier.maxStacks + (adjustments.maxStacks || 0))) {
      // The modifier has been applied enough times
      return false
    }

    const duration = modifier.duration + (adjustments.duration ?? 0)

    if (duration <= 0) {
      // The duration is less than or equal to 0
      return false
    }

    const effect = new Effect({
      modifierId,
      startsAt: currentTime,
      endsAt: currentTime + modifier.duration,
      adjustments
    })

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
  filterFocus (targets: string[], criteria: string) {
    this.focus.find(targets, criteria)
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
}
