import { HierarchyNode } from './node'

type Types = {
  [key: string]: HierarchyNode
}

export const types: Types = {
  Root: new HierarchyNode(-1, 'Root'),
  Entity: new HierarchyNode(0, 'Entity'),
  Player: new HierarchyNode(81, 'Player'),
  Self: new HierarchyNode(82, 'Self'),
  Other: new HierarchyNode(83, 'Other'),
  Modifier: new HierarchyNode(81, 'Modifier')
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
  const match: keyof Types | undefined = typeKeys.find(key => types[key].id === id)

  if (match === undefined) {
    throw new RangeError(`${id} is not a valid Entity Type ID`)
  }

  return types[match]
}