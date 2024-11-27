import { expect, test } from 'vitest'
import { FalloffType } from '../../src/entities/constants'
import { Modifier } from './../../src/entities/modifier'

test.only('Entities.Modifier: Basic Test', () => {
  const modifier = new Modifier({
    id: -1,
    name: 'Example',
    description: 'Makes the target slightly ill',
    duration: 20,
    targets: ['Sentient'],
    criteria: ['*'],
    type: 1,
    falloffType: FalloffType.Linear,
    tags: ['test'],
    maxStacks: 1,
    impact: {
      health: 1
    }
  })

  expect(modifier.id).toBe(-1)
  expect(modifier.name).toBe('Example')
  expect(modifier.description).toBe('Makes the target slightly ill')
  expect(modifier.duration).toBe(20)
  expect(modifier.targets[0]).toBe('Sentient')
  expect(modifier.criteria[0]).toBe('*')
  expect(modifier.falloffType).toBe(FalloffType.Linear)
  expect(modifier.tags.length).toBe(1)
  expect(modifier.maxStacks).toBe(1)
  expect(modifier.impact).toStrictEqual({
    health: 1
  })

  const json = JSON.stringify(modifier)
  expect(json).toBe(`{"id":-1,"name":"Example","description":"Makes the target slightly ill","duration":20,"type":1,"impact":{"health":1},"targets":["Sentient"],"criteria":["*"],"falloffType":1,"tags":["test"],"maxStacks":1}`)
  
  const hydrated = new Modifier(JSON.parse(json))
  expect(hydrated).toStrictEqual(modifier)

  expect(modifier.hasTag('test')).toBe(true)
  expect(modifier.hasTag('fail')).toBe(false)
  expect(modifier.hasTag(['test'])).toBe(true)
  expect(modifier.hasTag(['fail'])).toBe(false)
  expect(modifier.hasTag(['test','fail'])).toBe(true)

  expect(modifier.getFalloffFactor(0, 0, 10)).toBe(1)
  expect(modifier.getFalloffFactor(1, 0, 10)).toBe(0.9)
  expect(modifier.getFalloffFactor(5, 0, 10)).toBe(0.5)
  expect(modifier.getFalloffFactor(10, 0, 10)).toBe(0)
  
  expect(modifier.isChildOfType(-1)).toBe(true)
  expect(modifier.isChildOfType(1)).toBe(false)

  // TODO fix query
  // modifier.canTarget()

  // TODO figure out query
  // modifier.getTargets()
})
