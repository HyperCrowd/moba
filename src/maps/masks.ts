// Module Typing

import type {
  Coordinates,
  Line,
  Boundaries
} from './types.d'

// Module Definition

import { MAP_WIDTH, MAP_HEIGHT } from '../constants'
import { fetchJSON } from '../utils/files'
import { startBoundaryGrid } from './boundaryGrid'

let boundaryGrid: ReturnType<typeof startBoundaryGrid>

/**
 * 
 * @param url 
 * @returns 
 */
export const loadMask = async (url: string) => {
  const mask = await fetchJSON(url) as Boundaries
  const result: Line[] = []
  

  for (const area of mask) {
    for (const line of area) {
      let lastCoords: Coordinates | undefined
      for (const coordinates of line) {
        if (coordinates[0] > MAP_WIDTH || coordinates[1] > MAP_HEIGHT) {
          continue
        }

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

          result.push([
            lastCoords,
            coordinates
          ])

          lastCoords = coordinates
        }
      }
    }
  }

  boundaryGrid = startBoundaryGrid(result)
  return result
}

/**
 * 
 */
function orientation(px: number, py: number, qx: number, qy: number, rx: number, ry: number) {
  return (qx - px) * (ry - py) - (qy - py) * (rx - px);
}

/**
 * Function to check if two line segments intersect
 */
function doLinesIntersect(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
  const o1 = orientation(x1, y1, x2, y2, x3, y3)
  const o2 = orientation(x1, y1, x2, y2, x4, y4)
  const o3 = orientation(x3, y3, x4, y4, x1, y1)
  const o4 = orientation(x3, y3, x4, y4, x2, y2)

  // General case
  if (o1 * o2 < 0 && o3 * o4 < 0) return true

  // Special case for collinear points
  if (o1 === 0 && onSegment(x1, y1, x2, y2, x3, y3)) return true
  if (o2 === 0 && onSegment(x1, y1, x2, y2, x4, y4)) return true
  if (o3 === 0 && onSegment(x3, y3, x4, y4, x1, y1)) return true
  if (o4 === 0 && onSegment(x3, y3, x4, y4, x2, y2)) return true

  return false
}

/**
 * Function to check if point (qx, qy) is on segment (px, py) to (rx, ry)
 */
function onSegment(px: number, py: number, rx: number, ry: number, qx: number, qy: number) {
  return qx >= Math.min(px, rx) && qx <= Math.max(px, rx) && qy >= Math.min(py, ry) && qy <= Math.max(py, ry)
}

/**
 * Function to check if a line intersects a box
 */
function doesLineIntersectBox(x1: number, y1: number, x2: number, y2: number, bx: number, by: number, width: number, height: number) {
  // Rectangle corners
  const x3 = bx
  const y3 = by;
  const x4 = bx + width
  const y4 = by;
  const x5 = bx + width
  const y5 = by + height;
  const x6 = bx
  const y6 = by + height;

  // Check if the line intersects any of the four edges of the rectangle
  return doLinesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) || // Top edge
         doLinesIntersect(x1, y1, x2, y2, x4, y4, x5, y5) || // Right edge
         doLinesIntersect(x1, y1, x2, y2, x5, y5, x6, y6) || // Bottom edge
         doLinesIntersect(x1, y1, x2, y2, x6, y6, x3, y3);   // Left edge
}

/**
 * Function to determine which side of the player box intersects with the line
 */
export function hasMaskCollisions (x: number, y: number, width: number, height: number): boolean {
  const offsetX = x - width / 4
  const offsetY = y - height / 4
  const halfWidth = width / 2
  const halfHeight = height / 2
  const lines = boundaryGrid.getNearbyLines(x, y)

  // Check each line against all sides of the bounding box
  for (const line of lines) {
    const hit = doesLineIntersectBox(
      line[0][0],
      line[0][1],
      line[1][0],
      line[1][1],
      offsetX,
      offsetY,
      halfWidth,
      halfHeight
    )

    if (hit === true) {
      return true
    }
  }

  return false
}