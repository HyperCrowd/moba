import type { PartialPublicMembers } from '../types'
import type { ModifierImpact }  from './types'
import type { Entity } from './index'
import { FalloffType }  from './types'
import { getTypeById } from './hierarchy/index'
import { isChildOfType, getEntityType, query } from './hierarchy/query'

// Define enum for falloff types

export type ModifierJson = PartialPublicMembers<Modifier>

// Define interface for Modifiers
export class Modifier {
  id: number
  name: string
  description: string
  duration: number
  type: number
  amount: number
  targets: string[]
  criteria: string
  falloffType: FalloffType
  impact: ModifierImpact
  tags: string[]
  maxStacks: number

  /**
   *
   */
  static fromJSON (json: string) {
    const modifierJson = JSON.parse(json)
    const type = getTypeById(modifierJson.type)

    if (type === null) {
      throw new RangeError(`${modifierJson.type} is not a valid hierachy node ID`)
    }

    modifierJson.type = type


    return new Modifier(modifierJson)
  }

  constructor (options: ModifierJson) {
    this.id = options.id ?? 0 // TODO figure out default value
    this.name = options.name ?? '' // TODO figure out default value
    this.description = options.description ?? '' // TODO figure out default value
    this.type = options.type  ?? 0 // TODO figure out default value
    this.duration = options.duration ?? 0 // TODO figure out default value
    this.impact = options.impact ?? {}
    this.amount = options.amount ?? 0
    this.targets = options.targets ?? []
    this.criteria = options.criteria ?? '*'
    this.falloffType = options.falloffType ?? 0 // TODO figure out default value
    this.tags = options.tags ?? []
    this.maxStacks = options.maxStacks ?? 0 // TODO figure out default value

    Object.freeze(this)
  }

  /**
   *
   */
  toJSON () {
    return JSON.stringify({
      id: this.id,
      name: this.name,
      description: this.description,
      duration: this.duration,
      type: this.type,
      impact: this.impact,
      targets: this.targets,
      criteria: this.criteria,
      falloffType: this.falloffType,
      tags: this.tags,
      maxStacks: this.maxStacks
    })
  }

  /**
   *
   */
  hasTag (tags: string[]) {
    const wrappedTags = tags instanceof Array
      ? tags
      : [tags]

    return wrappedTags.some(element => this.tags.includes(element))
  }

  /**
   *
   */
  getFalloffFactor (currentDegree: number, startTime: number, endTime: number) {
    const completion = (currentDegree - startTime) / endTime
    let factor = 1

    switch (this.falloffType) {
      case FalloffType.None:
        // 0
        factor = 1
        break
      case FalloffType.Linear:
        // 1
        factor = 1 - completion
        break
      case FalloffType.Slowest:
        // 2
        factor = 1 - Math.pow(completion, 2)
        break
      case FalloffType.Slow:
        // 3
        factor = 1 - Math.sqrt(completion)
        break
      case FalloffType.Fast:
        // 4
        factor = completion === 0
          ? 1
          : -Math.log(completion) / Math.E
        break
      default:
        throw new RangeError(`FalloffType (${this.falloffType}) is invalid`)
    }

    return factor
  }

  /**
   *
   */
  canTarget (entity: Entity | Modifier) {
    const targets = []
    
    for (const target of this.targets) {
      getEntityType(target).forEach(type => targets.push(type))
    }

    return targets.indexOf(entity.type) > -1
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
  getTargets (candidates: Entity[] | Modifier[]) {
    return query(candidates, [this])
  }

  /**
   * TODO flesh this out
   */
  getEffect (time: number): number | false {
    return 0 * time
  }
}
