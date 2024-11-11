import fs from 'fs'
import { PNG } from 'pngjs'
import { DsMap } from './diamond-square.js'
import algos from './algos.js'
import { colorize } from './colorize.js'
import { exec } from 'child_process'
import util from 'util'

// Promisify exec to use with async/await
const execAsync = util.promisify(exec)

const { averaging, thickBrush, grass, waterways, cityLimits } = algos

const MAP_SIZE = 12
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
export async function matrixToPNG(data, filePath) {
	const width = data.length
	const height = data[0].length

	// Create a new PNG instance
	const png = new PNG({ width, height })

	// Populate PNG data
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			// Round to the nearest integer
			const value = Math.round(data[x][y])
			
			// Calculate the pixel index
			const idx = (width * y + x) << 2

			png.data[idx] = value     // R
			png.data[idx + 1] = value // G
			png.data[idx + 2] = value // B
			png.data[idx + 3] = 255   // Alpha
		}
	}

	// Write the PNG to a file
	return new Promise(resolve => {
		png.pack().pipe(fs.createWriteStream(filePath))
			.on('finish', resolve)
	})
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

/**
 * 
 */
async function main () {
  // Primary Heightmap
  const { components } = await buildMap('heightmap', averaging)
  await buildMapFromComponents('grass', components, grass)
  await buildMapFromComponents('ridges', components, waterways)
  await buildMapFromComponents('thickBrush', components, thickBrush)
  await buildMapFromComponents('river', components, cityLimits)

  await colorize('grass', 'grasslands', 75)
  await colorize(['heightmap', 'terrain'], 'grassTerrain')
  await colorize('thickBrush', 'vegetation', 75, 175)
  await colorize('ridges', 'ridges', 125, 150)
  await colorize('river', 'river', 20, 21)

  await execAsync(`convert \
  output/grass.png output/thickBrush.png -compose blend -define compose:args=100,20 -composite \
  output/ridges.png -compose blend -define compose:args=5,100 -composite \
  output/river.png -compose blend -define compose:args=100,100 -composite \
  output/terrain.png -geometry +0+0 -composite output/map.png`)

}

main()