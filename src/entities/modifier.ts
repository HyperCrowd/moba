import type { Struct, PublicMembers } from '../types'
import type { ModifierImpact } from './types'
import type { Entity } from './index'
import { FalloffType } from './constants'
import { isChildOfType, query } from './hierarchy/query'

export type ModifierJSON = Partial<PublicMembers<Modifier>>

export class Modifier {
  id: number
  name: string
  description: string
  duration: number
  type: number
  criteria: string[]
  falloffType: FalloffType
  rangeMin: number
  rangeMax: number
  impact: ModifierImpact
  tags: string[]
  maxStacks: number

  /**
   *
   */
  static fromJSON (config: ModifierJSON) {
    return new Modifier(config)
  }

  /**
   * 
   */
  constructor (options: ModifierJSON) {
    this.id = options.id ?? -1
    this.name = options.name ?? 'Please add a name'
    this.description = options.description ?? 'Please add a description' // TODO figure out default value
    this.type = options.type ?? 1 // HierarchyNode
    this.duration = options.duration ?? -1 // Infinite
    this.impact = options.impact ?? {}
    this.criteria = options.criteria ?? ['*']
    this.falloffType = options.falloffType ?? 0 // None
    this.tags = options.tags ?? []
    this.maxStacks = options.maxStacks ?? 1
    this.rangeMin = options.rangeMin ?? 0
    this.rangeMax = options.rangeMax ?? 10
  

    Object.freeze(this)
  }

  /**
   *
   */
  toJSON (): Struct {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      duration: this.duration,
      type: this.type,
      impact: this.impact,
      criteria: this.criteria,
      falloffType: this.falloffType,
      tags: this.tags,
      maxStacks: this.maxStacks,
      rangeMax: this.rangeMax,
      rangeMin: this.rangeMin
    }
  }

  /**
   *
   */
  hasTag (tags: string | string[]) {
    const wrappedTags = tags instanceof Array
      ? tags
      : [tags]

    return wrappedTags.some(tag => this.tags.includes(tag))
  }

  /**
   *
   */
  getFalloffFactor (currentTime: number, startTime: number, endTime: number) {
    const completion = (currentTime - startTime) / endTime
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
  isChildOfType (type: number) {
    return isChildOfType(this.type, type)
  }

  /**
   *
   */
  getTargets (candidates: Entity[]) {
    return query(candidates, [this])
  }

  /**
   *
   */
  canTarget (entity: Entity): boolean {
    return this.getTargets([entity]).length > 0
  }
}
