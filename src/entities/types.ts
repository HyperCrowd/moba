import type { NumericKeyPair } from "../types"

export enum FalloffType {
  None,
  Linear,
  Slowest,
  Slow,
  Fast
}

export type ModifierImpact = NumericKeyPair | (() => NumericKeyPair)