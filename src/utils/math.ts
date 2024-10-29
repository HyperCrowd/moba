/**
 * 
 * @param value 
 * @param max 
 * @returns 
 */
export function getIntFromReal(value: number, max: number): number {
  if (value < 0 || value > 1) {
      throw new RangeError('Value must be between 0 and 1.')
  }

  return Math.round(value * max)
}

/**
 * 
 * @param value 
 * @param max 
 * @returns 
 */
export function getIntFromRealRange(value: number, min: number, max: number): number {
  if (value < 0 || value > 1) {
      throw new RangeError('Value must be between 0 and 1.')
  }

  return min + value * (max - min)
}
