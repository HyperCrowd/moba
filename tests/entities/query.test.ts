import { Entity } from './../../src/entities/index'
import { getEntityType, isChildOfType, getCriteriaFilters } from './../../src/entities/hierarchy/query'
import { Value } from '../../src/entities/value'
import { expect, test } from 'vitest'

test('Query: Basic Test', () => {
  const alice = new Entity({
    id: 1,
    name: 'Alice',
    type: 1,
    tags: ['leftHanded']
  })

  const bob = new Entity({
    id: 1,
    name: 'Bob',
    type: 2,
    tags: ['leftHanded'],
    stats: {
      health: new Value({
        amount: 6,
        minimum: 0,
        maximum: 12
      })
    }
  })

  const carol = new Entity({
    id: 1,
    name: 'Carol',
    type: 1
  })

  // getEntityType
  const playerSelf = getEntityType('Player.Self')
  expect(playerSelf.length).toBe(1)
  expect(playerSelf[0].name).toBe('Self')

  const self = getEntityType('Self')
  expect(self.length).toBe(1)
  expect(self[0].name).toBe('Self')

  const root = getEntityType('Root')
  expect(root.length).toBe(6)
  expect(root[0].name).toBe('Root')
  expect(root[1].name).toBe('Entity')
  expect(root[2].name).toBe('Player')
  expect(root[3].name).toBe('Self')
  expect(root[4].name).toBe('Other')
  expect(root[5].name).toBe('Modifier')  

  // Is Child Of Type
  expect(isChildOfType(self[0], root[0])).toBe(true)
  expect(isChildOfType(self[0], root[1])).toBe(true)
  expect(isChildOfType(self[0], root[2])).toBe(true)
  expect(isChildOfType(self[0], root[3])).toBe(false)
  expect(isChildOfType(self[0], root[4])).toBe(false)
  expect(isChildOfType(self[0], root[5])).toBe(false)

  // Criteria Filters
  const tagFilter = getCriteriaFilters(['tags = "leftHanded"'])
  expect(tagFilter[0](alice)).toBe(true)
  expect(tagFilter[0](bob)).toBe(true)
  expect(tagFilter[0](carol)).toBe(false)

  const healthFilter = getCriteriaFilters(['health = 6'])
  expect(healthFilter[0](alice)).toBe(false)
  expect(healthFilter[0](bob)).toBe(true)

  const healthPercentFilter = getCriteriaFilters(['health = 50%'])
  expect(healthPercentFilter[0](alice)).toBe(false)
  expect(healthPercentFilter[0](bob)).toBe(true)
  

  // Query
  // TODO have to fininsh entity.getStats
  // const candidates = [alice, bob, carol]
  // query()
})
