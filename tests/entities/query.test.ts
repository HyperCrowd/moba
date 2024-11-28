import { Entity } from './../../src/entities/index'
import { getEntityType, isChildOfType, getCriteriaFilters, query } from './../../src/entities/hierarchy/query'
import { Value } from '../../src/entities/value'
import { expect, test } from 'vitest'
import { Modifier } from '../../src/entities/modifier'

test.only('Query: Basic Test', () => {
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
  expect(tagFilter[0](alice, {})).toBe(true)
  expect(tagFilter[0](bob, {})).toBe(true)
  expect(tagFilter[0](carol, {})).toBe(false)

  const healthFilter = getCriteriaFilters(['health = 6'])
  expect(healthFilter[0](alice, {})).toBe(false)
  expect(healthFilter[0](bob, {})).toBe(true)

  const healthPercentFilter = getCriteriaFilters(['health = 50%'])
  expect(healthPercentFilter[0](alice, {})).toBe(false)
  expect(healthPercentFilter[0](bob, {})).toBe(true)
  
  const typeOfFilter = getCriteriaFilters(['type of 1'])
  expect(typeOfFilter[0](alice, { getEntityType })).toBe(true)
  expect(typeOfFilter[0](bob, { getEntityType })).toBe(true)

  const typeFilter = getCriteriaFilters(['type is 1'])
  expect(typeFilter[0](alice, { getEntityType })).toBe(true)
  expect(typeFilter[0](bob, { getEntityType })).toBe(false)

  // Query
  const candidates = [alice, bob, carol]

  expect(query(candidates, [new Modifier({
    criteria: ['tags = "leftHanded"']
  })])).toStrictEqual([ alice, bob ])

  expect(query(candidates, [new Modifier({
    criteria: ['health = 6']
  })])).toStrictEqual([ bob ])

  expect(query(candidates, [new Modifier({
    criteria: ['health = 50%']
  })])).toStrictEqual([ bob ])

  expect(query(candidates, [new Modifier({
    criteria: ['type of 1']
  })])).toStrictEqual([ alice, bob, carol ])

  expect(query(candidates, [new Modifier({
    criteria: ['type is 1']
  })])).toStrictEqual([ alice, carol ])

  expect(query(candidates, [new Modifier({
    criteria: ['tags = "leftHanded" OR health = 6']
  })])).toStrictEqual([ alice, bob ])
})
