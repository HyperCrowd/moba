import type { EntityJSON } from './index'
import { UniqueArray } from '../utils/uniqueArray'
import { Entity } from './index'
import { query } from './hierarchy/query'

export class EntityManager extends UniqueArray<Entity> {
  /**
   *
   */
  constructor (list: (EntityJSON | Entity)[] = []) {
    super(list.map((config) => {
      return config instanceof Entity
        ? config
        : new Entity(config)
    }))

  }

  /**
   *
   */
  getIndexById (id: number) {
    return this.list.findIndex(item => item.id === id)
  }

  /**
   *
   */
  toJSON () {
    return this.list
  }

  /**
   *
   */
  find (criteria: string[]) {
    return query(this.list, criteria)
  }
}
