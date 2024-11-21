import { expect, test } from 'vitest'
import type { EffectConfig } from '../../src/entities/effect'
import { Effect } from '../../src/entities/effect'
import { FalloffType } from '../../src/entities/constants'

test('Entities.Effect: Basic Test', () => {
  const adjustments: EffectConfig = {
    duration: 3,
    targets: ['N/A'],
    falloffType: FalloffType.Fast,
    maxStacks: 1,
    tags: [],
    //fireDamage: 5
  }

  const effect = new Effect({
    id: 1,
    modifierId: -1,
    startsAt: 0,
    adjustments
  })

  expect(effect.id).toBe(1)
  expect(effect.modifierId).toBe(-1)
  expect(effect.startsAt).toBe(0)
  expect(effect.endsAt).toBe(23)
  expect(effect.adjustments).toStrictEqual({
    fireDamage: 5
  })

  // JSON
  const json = JSON.stringify(effect)
  const hydrated = new Effect(JSON.parse(json))
  hydrated.adjust({ add: adjustments })
  expect(hydrated).toStrictEqual(effect)

  // Is Active
  expect(effect.isActive(9)).toBe(true)
  expect(effect.isActive(10)).toBe(false)

  // Modifier
  const modifier = effect.getModifier()
  expect(modifier.id).toBe(effect.modifierId)

  // Impact over time
  expect(effect.getImpact(0).health).toBe(1)
  expect(effect.getImpact(5).health).toBe(0.5)
  expect(effect.getImpact(9).health).toBe(0.09999999999999998)
  expect(effect.getImpact(10).health).toBe(0)
  expect(effect.getImpact(20).health).toBe(-1)
})
