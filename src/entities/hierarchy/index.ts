import { HierarchyNode } from './node'

type Types = {
  [key: string]: HierarchyNode
}

type TypeKey = keyof Types | undefined

export const types: Types = {
  Root: new HierarchyNode({ id: -1, name: 'Root' }),
  Entity: new HierarchyNode({ id: 0, name: 'Entity' }),
  Player: new HierarchyNode({ id: 2, name: 'Player' }),
  Self: new HierarchyNode({ id: 3, name: 'Self' }),
  Other: new HierarchyNode({ id: 4, name: 'Other' }),
  Modifier: new HierarchyNode({ id: 5, name: 'Modifier' })
}

export const hierarchy = types.Root.addChild([
  types.Entity.addChild([
    types.Player.addChild([
      types.Self,
      types.Other
    ])
  ]),
  types.Modifier.addChild([])
])

const typeKeys = Object.keys(types)

/**
 *
 */
export const getTypeById = (id: number) => {
  const match: TypeKey = typeKeys.find(key => types[key].id === id)

  if (match === undefined) {
    throw new RangeError(`${id} is not a valid Entity Type ID`)
  }

  return types[match]
}
