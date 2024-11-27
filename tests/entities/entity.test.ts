import { expect, test } from 'vitest'
import { Entity } from './../../src/entities/index'
import { Effect } from '../../src/entities/effect'

test('Entities.Entity: Basic Test', () => {
  const entity = new Entity({
    id: 1,
    name: 'Test',
    type: 1,
    tags: ['guy'],
    effects: []
  })

  const json = JSON.stringify(entity)
  expect(json).toBe('{"id":1,"type":1,"name":"Test","tags":["guy"],"effects":[],"focus":[]}')

  const hydrated = new Entity(JSON.parse(json))
  expect(hydrated).toStrictEqual(entity)
  expect(entity.effects.length).toBe(0)

  // Effect
  const effect = entity.addEffect(-1, 0, 1) as Effect
  expect(effect).toEqual({
    id: 1,
    modifierId: -1,
    startsAt: 0,
    endsAt: 20,
    impact: { health: 1 },
    duration: 20,
    targets: [ 'Sentient' ],
    criteria: [ '*' ],
    falloffType: 1,
    tags: [],
    maxStacks: 1
  })
  expect(entity.effects.length).toBe(1)
  expect(entity.effects[0]).toBe(effect)

  expect(entity.isEffectActive(1, 0)).toBe(true)
  expect(entity.isEffectActive(1, 19)).toBe(true)
  expect(entity.isEffectActive(1, effect.endsAt)).toBe(false)
  expect(entity.isEffectActive(1, effect.duration)).toBe(false)
  expect(entity.isEffectActive(2, 0)).toBe(false)
  expect(entity.isEffectActive(2, 20)).toBe(false)

  expect(entity.isChildOfType(-1)).toBe(true)
  expect(entity.isChildOfType(1)).toBe(false)

  const bob = new Entity({
    id: 2,
    name: 'Bob',
    type: 1,
    tags: ['notAlice']
  })

  expect(entity.isFocusedOn(bob)).toBe(false)

  entity.addFocus(bob)
  expect(entity.isFocusedOn(bob)).toBe(true)
  entity.removeFocus(bob)
  expect(entity.isFocusedOn(bob)).toBe(false)

  // TODO query tests
  // entity.filterFocus()
})
