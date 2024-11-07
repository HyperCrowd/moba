import { DsMap } from './diamond-square.js'
import { matrixToPNG } from './png.js'
import algos from './algos.js'

const { averaging, thickBrush, grass, waterways, cityLimits } = algos

const MAP_SIZE = 10
const MAP_HEIGHT = 255
const ROUGHNESS = 500
const MAP_COUNT = 2

/**
 * 
 */
function multiplyMatrices (matrixA, matrixB, transform) {
  // Check if the dimensions match
  if (matrixA.length === 0 || matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
    throw new Error('Matrices must have the same dimensions.')
  }

  // Initialize the resulting matrix
  const result = matrixA.map(row => new Array(row.length))

  // Multiply element-wise
  for (let i = 0; i < matrixA.length; i++) {
    for (let j = 0; j < matrixA[i].length; j++) {
      result[i][j] = transform(matrixA[i][j], matrixB[i][j], matrixA, matrixB, j, i)
    }
  }

  return result
}

/**
 * 
 */
function generateMap (size, roughness, mapCount, height) {
  const result = []

  for (let i = 0; i < mapCount; i++) {
    const map = new DsMap(size, {
      height,
      roughness,
    });
  
    map.calculate()

    result.push(map.data)
  }

  return result
}

/**
 * 
 */
async function buildMapFromComponents (fileName, components, transform) {
  let heightmap = undefined

  for (const matrix of components) {
    if (heightmap === undefined) {
      heightmap = matrix
    } else {
      heightmap = multiplyMatrices(
        heightmap, 
        matrix,
        transform
      )
    }
  }

  await matrixToPNG(heightmap, `output/${fileName}.png`)

  return {
    components,
    heightmap
  }
}

/**
 * 
 */
async function buildMap (fileName, transform = averaging, size = MAP_SIZE, roughness = ROUGHNESS, mapCount = MAP_COUNT, height = MAP_HEIGHT) {
  const components = generateMap(size, roughness, mapCount, height)

  return buildMapFromComponents(fileName, components, transform)
}

async function main () {
  // Primary Heightmap
  const { components } = await buildMap('heightmap', averaging)
  await buildMapFromComponents('grass', components, grass)
  await buildMapFromComponents('waterways', components, waterways)
  await buildMapFromComponents('thickBrush', components, thickBrush)
  await buildMapFromComponents('cityLimits', components, cityLimits)
}

main()