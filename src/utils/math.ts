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

/**
 * 
 * @param elapsedTime 
 * @param duration 
 * @returns 
 */
export function getYoyoPercentage (elapsedTime: number, duration: number): number {
  // Normalize elapsed time based on duration
  const normalizedTime = elapsedTime % (2 * duration);

  // Determine percentage based on yoyo logic
  if (normalizedTime < duration) {
    // Ascending phase
    return normalizedTime / duration;
  } else {
    // Descending phase
    return 1 - ((normalizedTime - duration) / duration);
  }
}