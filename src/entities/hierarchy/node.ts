import type { Struct } from '../../types'

export class HierarchyNode {
  name: string
  lowerName: string
  id: number
  idStr: string
  children: HierarchyNode[] = []

  /**
   *
   */
  static fromJSON (json: string) {
    const data: Struct = JSON.parse(json)

    const entity = new HierarchyNode
      (data.id as number,
      data.name as string
    )

    const children = data.children as Struct[]

    children.forEach(child => {
      const node = new HierarchyNode(
        child.id as number,
        child.name as string
      )

      entity.children.push(node)
    })

    return entity
  }

  /**
   *
   */
  constructor (id: number, name: string) {
    this.id = id
    this.idStr = id.toString()
    this.name = name
    this.lowerName = name.toLowerCase()
  }

  /**
   *
   */
  addChild (entities: HierarchyNode | HierarchyNode[]) {
    if (entities instanceof Array === false) {
      entities = [ entities ]
    }

    for (const entity of entities) {
      this.children.push(entity)
    }

    return this
  }

  /**
   *
   */
  display (level = 0) {
    console.log(`${' '.repeat(level * 2)}${this.name}`)
    this.children.forEach(child => child.display(level + 1))
  }

  /**
   *
   */
  toJSON (): Struct {
    return {
      id: this.id,
      name: this.name,
      children: this.children.map(child => child.toJSON())
    }
  }

  /**
   *
   */
  search (targets: string, parentParts?: string[], partsIndex?: number) {
    const results: HierarchyNode[] = []

    const parts = parentParts || targets.split('.')
    const i = partsIndex || 0
    const len = parts.length - 1
    const part = parts[i]

    if (part === this.idStr || part === this.lowerName) {
      // The hierarchy entity matches the targeting type
      if (i === len) {
        // At the end of the target chain, add the entity
        results.push(this)

        this.children.forEach(child => {
          // Add all children of the matching entity
          results.push(child)
          child.getAllChildren(results)
        })
      } else {
        // Traversing the rest of the children
        this.children.forEach(child => {
          child.search('', parts, i + 1).forEach(child => results.push(child))
        })
      }
    } else {
      // The hierarchy entity does not match, search it's children
      this.children.forEach(child => {
        child.search('', parts, i).forEach(child => results.push(child))
      })
    }

    return results
  }

  /**
   *
   */
  getAllChildren (result: HierarchyNode[] = [], target?: HierarchyNode) {
    for (const child of (target || this).children) {
      result.push(child)

      this.getAllChildren(result, child)
    }

    return result
  }
}
