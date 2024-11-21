import type { NumericKeyPair } from '../types'

export type ModifierImpact = NumericKeyPair | (() => NumericKeyPair)

export type ModifierAdjustment = {
  duration?: number,
  targets?: string[]
  criteria?: string[]
  falloffType?: number
  tags?: string[]
  maxStacks?: number
  endsAt?: number
  modifierId?: number
  [key: string]: number
}

export type ModifierAdjustments = {
  add?: ModifierAdjustment,
  remove?: ModifierAdjustment,
  replace?: ModifierAdjustment
}