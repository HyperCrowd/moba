// Module Types

import type { Line } from './types'

// Module Definition

import { MAP_WIDTH, MAP_HEIGHT } from '../constants'

const GRID_TILES_PER_AXIS = 20
const GRID_SIZE_X = MAP_WIDTH / GRID_TILES_PER_AXIS
const GRID_SIZE_Y = MAP_HEIGHT / GRID_TILES_PER_AXIS

class BoundaryGrid {
  private grid: {
    [key: string]: Line[]
  }

  private cellKeys: {
    [key: number]: {
      [key: number]: string
    }
  }

  /**
   *
   */
  constructor(lines: Line[]) {
    this.grid = {}
    this.cellKeys = {}

    // Prepopulate cellKeys so we aren't always generating new strings
    for (let x = 0; x <= MAP_WIDTH; x += GRID_SIZE_X) {
      for (let y = 0; y <= MAP_HEIGHT; y += GRID_SIZE_Y) {
        const cellX = Math.floor(x / GRID_SIZE_X)
        const cellY = Math.floor(y / GRID_SIZE_Y)

        if (this.cellKeys[cellX] === undefined) {
          this.cellKeys[cellX] = {}
        }

        this.cellKeys[cellX][cellY] = `${cellX},${cellY}`
      }
    }

    for (const line of lines) {
      this.addLine(line)
    }
  }

  /**
   *  Hash function for grid cells
   */
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / GRID_SIZE_X)
    const cellY = Math.floor(y / GRID_SIZE_Y)

    return this.cellKeys[cellX][cellY]
  }

  /**
   * Add line to the grid, including cells the line passes through
   */
  private addLine(line: Line): void {
    const cells = this.getCoveredCells(line)

    // Add the line to all the cells it passes through
    for (const cell of cells) {
      if (this.grid[cell] === undefined) {
        this.grid[cell] = []
      }

      this.grid[cell].push(line)
    }
  }

  private getCoveredCells(line: Line): string[] {
    const [x1, y1] = line[0]
    const [x2, y2] = line[1]
  
    // Calculate the total rise (vertical change) and run (horizontal change)
    const rise = y2 - y1
    const run = x2 - x1
  
    // Number of steps we'll need (this is the larger of the absolute rise or run)
    const steps = Math.max(Math.abs(rise), Math.abs(run))
  
    // Array to store the cells that the line passes through
    const cells: Set<string> = new Set()

    // For loop to step through the line
    for (let i = 0; i <= steps; i++) {
      // Calculate the current offset in the x and y directions
      const offsetX = (run * i) / steps
      const offsetY = (rise * i) / steps
  
      // Add the current grid cell to the set
      cells.add(this.getCellKey(x1 + offsetX, y1 + offsetY))
      // cells.add(`${gridX},${gridY}`);
    }
  
    // Return the list of grid cells as an array of strings (e.g., "x,y")

    return Array.from(cells)
  } 

  // Get nearby lines based on actor's position
  public getNearbyLines(ax: number, ay: number): Line[] {
    const nearbyLines: Line[] = [];
    const actorCell = this.getCellKey(ax, ay);

    // Check the cell where the actor is and neighboring cells
    const leftCell = ax - GRID_SIZE_X
    const rightCell = ax + GRID_SIZE_X
    const upCell = ay - GRID_SIZE_Y
    const downCell = ay + GRID_SIZE_Y

    const cellsToCheck = [
      actorCell
    ]

    // TODO remove
    // const count = {
    //   left: '',
    //   right: '',
    //   up: '',
    //   down: '',
    //   center:  `${actorCell}: ${(this.grid[actorCell] || []).length}`
    // }
    // let key: string

    if (leftCell >= 0) {
      // key = this.getCellKey(leftCell, ay) // TODO remove
      cellsToCheck.push(this.getCellKey(leftCell, ay))
      // count.left = `${key}: ${(this.grid[key] || []).length}` // TODO remove
    }

    if (rightCell <= MAP_WIDTH) {
      // key = this.getCellKey(rightCell, ay) // TODO remove
      cellsToCheck.push(this.getCellKey(rightCell, ay))
      // count.right = `${key}: ${(this.grid[key] || []).length}` // TODO remove
    }

    if (upCell >= 0) {
      // key = this.getCellKey(ax, upCell) // TODO remove
      cellsToCheck.push(this.getCellKey(ax, upCell))
      // count.up = `${key}: ${(this.grid[key] || []).length}` // TODO remove
    }

    if (downCell < MAP_HEIGHT) {
      // key = this.getCellKey(ax, downCell) // TODO remove
      cellsToCheck.push(this.getCellKey(ax, downCell))
      // count.down = `${key}: ${(this.grid[key] || []).length}` // TODO remove
    }

    for (const cell of cellsToCheck) {
      if (this.grid[cell] !== undefined && this.grid[cell].length > 0) {
        nearbyLines.push(...this.grid[cell]);
      }
    }

    // TODO Remove
    // if (nearbyLines.length > 0) {
    //   console.log(count)
    // }

    return nearbyLines;
  }
}

//  // TODO remove
// export const debugGrid = (scene: Phaser.Scene) => {
//   for (let x = 0; x <= MAP_WIDTH; x += GRID_SIZE_X) {
//     for (let y = 0; y <= MAP_HEIGHT; y += GRID_SIZE_Y) {
//       const graphics = scene.add.graphics()
//       const cellX = Math.floor(x / GRID_SIZE_X)
//       const cellY = Math.floor(y / GRID_SIZE_Y)
//       scene.add.text(x + 10, y + 10, `${cellX},${cellY}`, {
//         color: '#8f008f'
//       })

//       // Set the line style (color and thickness)
//       graphics.lineStyle(4, 0x00ff00, 1); // Green color with 4px thickness, fully opaque

//       // Draw a square (x, y, width, height) with only borders
//       graphics.strokeRect(x, y, GRID_SIZE_X, GRID_SIZE_Y); // Position (100, 100), size 100x100

//       graphics.setZ(1000)
//     }
//   }
// }

/**
 * 
 */
export const startBoundaryGrid = (lines: Line[]) => {
  return new BoundaryGrid(lines)
}