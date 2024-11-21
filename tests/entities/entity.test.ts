import { expect, test } from 'vitest'
import { Entity } from './../../src/entities/index'

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

  const effect = entity.addEffect(-1, 0)
  console.log(effect)

  // entity.isChildOfType()
  
  // entity.addFocus()
  // entity.removeFocus()
  // entity.isFocusedOn()
  // entity.filterFocus()

  // entity.addModifier()
  // entity.isEffectActive()
})
