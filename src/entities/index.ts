import type { PublicMembers } from '../types'
import type { EffectJSON } from './effect'
import { Value } from './value'
import { isChildOfType } from './hierarchy/query'
import { getTypeById } from './hierarchy/index'
import { HierarchyNode } from './hierarchy/node'
import { getModifierById } from './modifiers'
import { EntityManager } from './entityManager'
import { Effect } from './effect'

export type EntityJSON = PublicMembers<Entity>

export class Entity {
  // Group ID
  id: number

  // Group type
  type: HierarchyNode

  // Name of the group
  name: string

  // Tags for the entity
  tags: string[]

  //
  effects: Effect[]

  // What entities the Entity is focused on
  focus: EntityManager

  /**
   *
   */
  constructor(config: EntityJSON) {
    const type = typeof config.type === 'number'
      ? getTypeById(config.type)
      : config.type

    if (type === null) {
      throw new RangeError(`${config.type} is not a valid hierachy node ID`)
    }

    this.id = config.id
    this.type = type
    this.name = config.name
    this.tags = config.tags || []
    this.effects = config.effects || []
    this.focus = new EntityManager(config.focus || [])
  }

  /**
   *
   */
  toJSON () {
    return {
      id: this.id,
      type: this.type.id,
      name: this.name,
      tags: this.tags,
      effects: this.effects,
      focus: this.focus
    }
  }

  /**
   *
   */
  protected prepareValue (name: string, options: EntityJSON): Value {
    return new Value(options[name] || Value.getDefault())
  }

  /**
   *
   */
  isAlive (demographyId: number = this.id) {
    return this.getDemography(demographyId) !== false
  }

  /**
   *
   */
  getDemography (demographyId: number = this.id) {
    const populationWindow = getPopulationWindow()
    return populationWindow.getPerson(demographyId)
  }

  /**
   * Add an effect
   */
  addEffect (modifierId: number, demographyId: number = this.id, adjustments: EffectJSON = defaultAdjustment): void {
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

    const duration = modifier.duration + adjustments.duration

    if (duration <= 0) {
      // The duration is less than or equal to 0
      return false
    }

    const clock = getClock()

    const effect = new Effect({
      modifierId,
      demographyId,
      startsAt: clock.currentDegree,
      endsAt: clock.currentDegree + modifier.duration,
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
  addFocus (entity: Entity | number) {
    return this.focus.add(entity)
  }

  /**
   *
   */
  removeFocus (entityOrId: Entity | number) {
    return this.focus.remove(entityOrId)
  }

  /**
   *
   */
  isFocusedOn (entityOrId: Entity | number) {
    return this.focus.getIndex(entityOrId) > -1
  }

  /**
   *
   */
  filterFocus (targets: string[], criteria: string) {
    this.find(targets, criteria)
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
  isEffectActive (effectId: number, currentDegree: number) {
    const effect = this.effects.find(effect => effectId === effect.id)

    if (effect === null) {
      return false
    }

    if (currentDegree < effect.startsAt) {
      return false
    }

    if (currentDegree >= effect.endsAt) {
      return false
    }

    return true
  }
}
