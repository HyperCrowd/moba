import { NumericKeyPair } from '../types'

export const maxSigned32BitInteger = 2**31 - 1
export const minSigned32BitInteger = -(2**31)

/**
 *
 */
export function findClosestIndex(arr: NumericKeyPair[], key: number, target: number) {
  if (arr.length === 0) {
      return -1; // Return -1 if the array is empty
  }

  let closestIndex = 0
  let closestDiff = Math.abs(arr[0][key] - target)

  for (let i = 1; i < arr.length; i++) {

      const currentDiff = Math.abs(arr[i][key] - target)

      if (currentDiff < closestDiff) {
          closestDiff = currentDiff
          closestIndex = i
      }
  }

  return closestIndex
}

/**
*
*/
export function percentageDifference(a: number, b: number) {
// Calculate the difference
const difference = b - a;

// Calculate the percentage difference relative to 'a'
const percentageDiff = (difference / Math.abs(a)) * 100;

return percentageDiff;
}

/**
*
*/
export function generateNormalCurve(length: number) {
const normalCurve = []
const step = 6 / (length - 1)  // Range from -3 to 3
let sum = 0

// Generate and calculate PDF values
for (let i = 0; i < length; i++) {
  const z = -3 + i * step
  const pdfValue = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z)
  normalCurve.push(pdfValue)
  sum += pdfValue
}

// Normalize the values
for (let i = 0; i < normalCurve.length; i++) {
  normalCurve[i] /= sum
}

return normalCurve
}

/**
*
*/
export function normalProbabilityDensity(x: number) {
return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x)
}

/**
*
*/
export function getProbabilityDensity(index: number, length: number) {
// Map the index to a z-score in the range of -3 to 3
const step = 6 / (length - 1)  // Range from -3 to 3
const z = -3 + index * step

// Calculate the PDF value for the z-score
return normalProbabilityDensity(z)
}

/**
* 
*/
export function nudgeArray(values: number[], ideal: number[], factor: number) {
  // Iterate through the values array and adjust each value
  for (let i = 0; i < values.length; i++) {
      // Calculate the difference between the current value and the ideal value
      const difference = ideal[i] - values[i]

      // Adjust the current value by the specified percentage of the difference
      values[i] = values[i] + (difference * factor)
  }

  // Return the adjusted values array
  return values
}

export const EULER = Math.exp(1)

export const RADIAN_PER_DEGREE = Math.PI / 180

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