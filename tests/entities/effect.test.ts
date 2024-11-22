import { expect, test } from 'vitest'
import type { ModifierAdjustments } from '../../src/entities/types'
import { Effect } from '../../src/entities/effect'

test('Entities.Effect: Basic Test', () => {
  const effect = new Effect({
    id: 1,
    modifierId: -1,
    startsAt: 0,
    tags: ['Test'],
    impact: {
      fireDamage: 5
    }
  })

  expect(effect.id).toBe(1)
  expect(effect.modifierId).toBe(-1)
  expect(effect.startsAt).toBe(0)
  expect(effect.endsAt).toBe(20)
  expect(effect.impact).toStrictEqual({
    fireDamage: 5,
    health: 1
  })

  // JSON
  const json = JSON.stringify(effect)
  const hydrated = new Effect(JSON.parse(json))
  expect(hydrated).toStrictEqual(effect)

  const adjustments: ModifierAdjustments = {
    add: {
      duration: 80,
      maxStacks: 3,
      fireDamage: -2,
      criteria: ['TestQuery']
    },
    remove: {
      tags: ['Test'],
      falloffType: 0
    },
    replace: {
      targets: ['Player']
    }
  }

  hydrated.adjust(adjustments)
  expect(hydrated.id).toBe(1)
  expect(hydrated.modifierId).toBe(-1)
  expect(hydrated.startsAt).toBe(0)
  expect(hydrated.endsAt).toBe(100)
  expect(hydrated.impact).toStrictEqual({
    fireDamage: 3,
    health: 1
  })
  

  // Is Active
  expect(hydrated.isActive(9)).toBe(true)
  expect(hydrated.isActive(100)).toBe(false)

  // Modifier
  const modifier = effect.getModifier()
  expect(modifier.id).toBe(effect.modifierId)

  // Impact over time
  expect(hydrated.getImpact(0).health).toBe(1)
  expect(hydrated.getImpact(50).health).toBe(0.5)
  expect(hydrated.getImpact(99).health).toBe(0.010000000000000009)
  expect(hydrated.getImpact(100).health).toBe(0)
  expect(hydrated.getImpact(-100).health).toBe(2)
})
