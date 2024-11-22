import type { NumericKeyPair } from '../types'

export type ModifierImpact = NumericKeyPair | (() => NumericKeyPair)

export type ModifierAdjustment = {
  duration?: number
  falloffType?: number
  maxStacks?: number
  targets?: string[]
  criteria?: string[]
  tags?: string[]
  [key: string]: number | string[] | undefined
}

export type ModifierAdjustments = {
  add?: ModifierAdjustment
  remove?: ModifierAdjustment
  replace?: ModifierAdjustment
}
