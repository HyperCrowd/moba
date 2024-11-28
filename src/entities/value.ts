import type { Struct, PublicMembers } from '../types'

export type ValueJSON = PublicMembers<Value>

export class Value {
  _amount: number
  _minimum: number
  _maximum: number

  constructor(config: ValueJSON) {
    this._amount = config.amount ?? 0
    this._minimum = config.minimum ?? 0
    this._maximum = config.maximum ?? 100
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
   * 
   */
  clone () {
    return new Value({
      amount: this._amount,
      maximum: this._maximum,
      minimum: this._minimum
    })
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
   * Gets the percentage of the current value based on the minimum and maximum of the value
   */
  getPercentage (value: number = this._amount) {
    return ((value - this._minimum) / (this._maximum - this._minimum)) * 100;
  }
}
