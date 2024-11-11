import type { EntityJson } from './index'
import { Entity } from './index'
import { query } from './hierarchy/query'
import { UniqueArray } from '../common/uniqueArray'

export class EntityManager extends UniqueArray<Entity> {
  /**
   *
   */
  static fromJSON (json: string) {
    const entityManagerJson = JSON.parse(json)
    return new EntityManager(entityManagerJson)
  }

  /**
   *
   */
  constructor (list: (EntityJson | Entity)[] = []) {
    super(list.map((entityJson: EntityJson) => {
      return entityJson instanceof Entity
        ? entityJson
        : new Entity(entityJson)
    }))

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
  find (targets: string | string[], criteria: string) {
    return query(this.list, [{
      targets: targets instanceof Array
        ? targets
        : [targets],
      criteria
    }])
  }
}
