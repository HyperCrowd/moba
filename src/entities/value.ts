import type { Struct, PublicMembers } from '../types'
import { Modifier } from './modifier'

export type ValueJSON = PublicMembers<Value>

export class Value {
  _amount: number
  _minimum: number
  _maximum: number

  constructor(config: ValueJSON) {
    this._amount = config.amount ?? 0
    this._minimum = config.minimum ?? 100
    this._maximum = config.maximum ?? -100
    this.validateAmount()
  }

  /**
   * 
   */
  toJSON(): Struct {
    return {
      minimum: this._minimum,
      maximum: this._maximum,
      amount: this._amount
    }
  }

  /**
   * Getter for amount with validation
   */
  get amount(): number {
    return this._amount
  }

  /**
   * Setter for amount with validation
   */
  set amount(value: number) {
    this._amount = value
    this.validateAmount()
  }

  /**
   * Validate amount within bounds
   */
  private validateAmount() {
    if (this._amount < this._minimum) {
      this._amount = this._minimum
    } else if (this._amount > this._maximum) {
      this._amount = this._maximum
    }
  }

  /**
   * Getter for minimum
   */
  get minimum(): number {
    return this._minimum
  }

  /**
   * Setter for minimum
   */
  set minimum(value: number) {
    this._minimum = value
    this.validateAmount()
  }

  /**
   * Getter for maximum
   */
  get maximum(): number {
    return this._maximum
  }

  /**
   * Setter for maximum
   */
  set maximum(value: number) {
    this._maximum = value
    this.validateAmount()
  }

  /**
   *
   */
  getValue (time: number, modifiers: Modifier[]): number {
    let total = 0

    for (const modifier of modifiers) {
      const modValue = modifier.getEffect(time)

      if (modValue !== false) {
        total += modValue
      }
    }

    const result = this._amount + total

    return result
  }

  /**
   * 
   */
  isPercentDifference (percent: number): boolean {
    const range = this._maximum - this._minimum
    const decimal = percent / 100

    return percent > 0
      ? this._amount <= range * (decimal)
      : this._amount >= range * (1 - -decimal)
  }
}
