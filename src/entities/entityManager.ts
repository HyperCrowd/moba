import type { EntityJSON } from './index'
import { Entity } from './index'
import { query } from './hierarchy/query'
import { UniqueArray } from '../utils/uniqueArray'

export class EntityManager extends UniqueArray<Entity> {
  /**
   *
   */
  constructor (list: (EntityJSON | Entity)[] = []) {
    super(list.map((entityJson: EntityJSON) => {
      return entityJson instanceof Entity
        ? entityJson
        : new Entity(entityJson)
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
  find (targets: string | string[], criteria: string) {
    return query(this.list, [{
      targets: targets instanceof Array
        ? targets
        : [targets],
      criteria
    }])
  }
}
