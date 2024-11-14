import { expect, test } from 'vitest'
import { HierarchyNode } from './../../src/entities/hierarchy/node'

test('Entities.HierarchyNode: Basic Test', () => {
  // Simple
  const parent = new HierarchyNode({
    id: 1,
    name: 'Parent'
  })

  expect(parent.id).toBe(1)
  expect(parent.name).toBe('Parent')
  expect(parent.getAllChildren()).toStrictEqual([])

  // Children
  const child = new HierarchyNode({
    id: 2,
    name: 'Child'
  })

  parent.addChild(child)
  expect(parent.getAllChildren()).toStrictEqual([child])

  // Display
  expect(parent.display(false)).toBe(`Parent
  Child`)

  // To and fron JSON
  const json = JSON.stringify(parent)
  expect(json).toBe(`{"id":1,"name":"Parent","children":[{"id":2,"name":"Child","children":[]}]}`)

  const hydrated = new HierarchyNode(JSON.parse(json))
  expect(hydrated.id).toBe(parent.id)
  expect(hydrated.name).toBe(parent.name)
  expect(hydrated.children[0].id).toBe(child.id)
  expect(hydrated.children[0].name).toBe(child.name)

  // Search
  const results1 = parent.search('Child')
  expect(results1).toStrictEqual([child])

  const results2 = parent.search('Parent')
  expect(results2).toStrictEqual([parent, child])
})
