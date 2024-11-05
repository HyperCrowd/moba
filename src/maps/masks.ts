// Module Typing

export type Coordinate = [number, number]
type Segment = Coordinate[]
type Area = Segment[]
export type MapStructure = Area[]
export type Line = [Coordinate, Coordinate]

// Module Definition

import { PLAYER_WIDTH, PLAYER_HEIGHT } from '../constants'
import { fetchJSON } from '../utils/files'

const halfWidth = Math.floor(PLAYER_WIDTH / 2)
const halfHeight = Math.floor(PLAYER_HEIGHT / 2)
const coordCache: Line[] = []
const candidateCache: {
  [key: number]: Line[]
} = {}

let lastX = -1
let lastY = -1
let lastResult = -1

/**
 * 
 * @param url 
 * @returns 
 */
export const loadMask = async (url: string) => {
  const mask = await fetchJSON(url) as MapStructure
  const result: Line[] = []
  

  for (const area of mask) {
    for (const sgement of area) {
      let lastCoords: Coordinate | undefined
      for (const coordinates of sgement) {
        if (coordinates[0] === coordinates[1]) {
          continue
        }

        if (lastCoords === undefined) {
          lastCoords = coordinates
          continue
        } else {
          // TODO reference the game width instead of hard coding 1000
          if (Math.abs(coordinates[0] - lastCoords[0]) > 1000) {
            // Eliminate long vectors
            lastCoords = undefined
            continue
          }

          // TODO reference the game heightinstead of hard coding 1000
          if (Math.abs(coordinates[1] - lastCoords[1]) > 1000) {
            // Eliminate long vectors
            lastCoords = undefined
            continue
          }

          coordCache.push([
            lastCoords,
            coordinates
          ])

          // TODO: REMOVE
          result.push([
            lastCoords,
            coordinates
          ])

          lastCoords = coordinates
        }
      }
    }
  }

  // Sort the cache
  coordCache.sort((point1, point2) => {
    return point1[0][0] - point2[0][0]
  })

  return result
}

/**
 * Helper function to determine if two segments intersect
 */
function doIntersect(p1: number[], p2: number[], p3: number[], p4: number[]) {
  const det = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0])

  if (det === 0) {
    // Parallel lines
    return false;
  }

  const t1 = ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / det
  const t2 = ((p1[0] - p2[0]) * (p1[1] - p3[1]) - (p1[1] - p2[1]) * (p1[0] - p3[0])) / det

  // If the intersection is within the segments
  return (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1)
}

/**
 * 
 */
function binarySearchForIndex(target: number, leftOrRight: boolean) {
  let left = 0;
  let right = coordCache.length - 1;

  while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (coordCache[mid][0][0] === target) {
          return mid; // Target found
      }

      if (coordCache[mid][0][0] < target) {
          left = mid + 1; // Search in the right half
      } else {
          right = mid - 1; // Search in the left half
      }
  }

  return leftOrRight
    ? left
    : right
}

/**
 * 
 */
const getCoordinateCandidates = (x: number) => {
  if (candidateCache[x] !== undefined) {
    return candidateCache[x]
  }

  const min = binarySearchForIndex(x - halfWidth, false)
  const max = binarySearchForIndex(x + halfWidth, false)
  
  const result = coordCache.slice(min, max)

  candidateCache[x] = result

  return result
}

/**
 * Function to determine which side of the player box intersects with the line
 */
export function hasMaskCollisions (x: number, y: number): number {
  if (x === lastX && y === lastY) {
    return lastResult
  }

  lastX = x
  lastY = y

  const lines = getCoordinateCandidates(x)

  // x -= 64
  // y -= 64

  // Check each line against all sides of the bounding box
  for (const line of lines) {
    // Check top side
    if (doIntersect(
      [x - halfWidth, y - halfHeight],
      [x + halfWidth, y - halfWidth],
      line[0],
      line[1]
    )) {
      lastResult = 0  
      return 0 // top
    }

    // Check bottom side
    if (doIntersect(
      [x - halfWidth, y + halfHeight],
      [x + halfWidth, y + halfHeight],
      line[0],
      line[1]
    )) {
      lastResult = 2
      return 2 // bottom
    }

    // Check left side
    if (doIntersect(
      [x - halfWidth, y - halfHeight],
      [x - halfWidth, y + halfHeight],
      line[0],
      line[1]
    )) {
      lastResult = 3
      return 3 // left
    }

    // Check right side
    if (doIntersect(
      [x + halfWidth, y - halfHeight],
      [x + halfWidth, y + halfHeight],
      line[0],
      line[1]
    )) {
      lastResult = 1
      return 1 // right
    }
  }

  lastResult = -1
  return -1
}