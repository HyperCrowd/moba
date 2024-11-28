import { expect, test } from 'vitest'
import { Value } from '../../src/entities/value'

test('Entities.Value: Basic Test', () => {
  const value = new Value({
    amount: 50,
    minimum: 0,
    maximum: 100
  })

  expect(value.amount).toBe(50)
  expect(value.minimum).toBe(0)
  expect(value.maximum).toBe(100)

  value.amount = 51
  expect(value.amount).toBe(51)

  value.amount = 101
  expect(value.amount).toBe(100)

  value.amount = -1
  expect(value.amount).toBe(0)

  value.minimum = -5
  value.amount = -3
  expect(value.amount).toBe(-3)

  value.maximum = 10
  value.amount = 100
  expect(value.amount).toBe(10)
  expect(value.getPercentage()).toBe(100)

  value.minimum = 0
  value.maximum = 200
  value.amount = 50
  expect(value.getPercentage()).toBe(25)

  const json = JSON.stringify(value)
  expect(json).toBe('{"minimum":0,"maximum":200,"amount":50}')
  const hydrated = new Value(JSON.parse(json))
  expect(hydrated).toStrictEqual(value)
})
