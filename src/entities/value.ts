import type { Struct, PublicMembers } from '../types'

export type ValueJSON = PublicMembers<Value>

export class Value {
  _amount: number
  _minimum: number
  _maximum: number

  constructor(config: ValueJSON) {
    this._amount = config.amount ?? 0
    this._minimum = config.minimum ?? -100
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
  getPercentage (value: number = this._amount) {
    return ((value - this._minimum) / (this._maximum - this._minimum)) * 100;
  }

  /**
   * 
   */
  isPercentDifferent(percent: number, value: number = this._amount): boolean {
    const range = this._maximum - this._minimum;
    const decimal = percent / 100;

    if (percent > 0) {
        // Check if the amount is less than or equal to the value corresponding to the percentage of the range
        return value <= this._minimum + range * decimal;
    } else {
        // Check if the amount is greater than or equal to the value corresponding to the negative percentage of the range
        return value >= this._maximum - range * Math.abs(decimal);
    }
}
}
