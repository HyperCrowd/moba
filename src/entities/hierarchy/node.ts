import type { Struct, PublicMembers } from '../../types'

type HierarchyNodeJSON = PublicMembers<HierarchyNode>

export class HierarchyNode {
  id: number
  name: string
  private lowerName: string
  private idStr: string
  children: HierarchyNode[] = []

  /**
   *
   */
  constructor (config: HierarchyNodeJSON) {
    if (config.id === undefined) {
      throw new RangeError(`HierarchyNode needs id defined, ${config.id} received`)
    }

    if (config.name === undefined) {
      throw new RangeError(`HierarchyNode needs name defined, ${config.name} received`)
    }

    this.id = config.id
    this.idStr = this.id.toString()
    this.name = config.name
    this.lowerName = this.name.toLowerCase()

    const children = config.children ?? []
    
    children.forEach(child => {
      const node = child instanceof HierarchyNode
        ? child
        : new HierarchyNode(child)

      this.children.push(node)
    })
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
  display (toConsole = true, level = 0) {
    let message = ''

    message += `${' '.repeat(level * 2)}${this.name}`

    this.children.forEach(child => {
      message += '\n' + child.display(false, level + 1)
    })

    if (toConsole) {
      console.info(message)
    }

    return message
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
    const part = parts[i].toLowerCase()

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
  getAllChildren (result: HierarchyNode[] = [], target: HierarchyNode = this) {
    for (const child of target.children) {
      result.push(child)

      this.getAllChildren(result, child)
    }

    return result
  }
}
