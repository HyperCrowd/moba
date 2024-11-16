import { expect, test } from 'vitest'
import { getTypeById, types } from '../../src/entities/hierarchy'

test('Entities.Hierarchy: Basic Test', () => {
  const type = getTypeById(-1)
  expect(type).toBe(types.Root)
})
