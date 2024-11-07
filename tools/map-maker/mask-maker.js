import { exec } from 'child_process'
import util from 'util'
import path from 'path'
import fs from 'fs'
import * as turf from '@turf/turf'

// Promisify exec to use with async/await
const execAsync = util.promisify(exec)

const PNG_THRESHOLD = 50
const CURVE_THRESHOLD = 1
const PIXEL_QUANTIZE = 25
const JSON_TOLERATNCE = 0.75
const OUTPUT_PBM = 'output.pbm'
const OUTPUT_JSON = 'output.json'
const FINAL_MASK = `../public/map_mask.json`

/**
 * Function to read a GeoJSON file
 */ 
function readGeoJSON(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(JSON.parse(data))
      }
    })
  })
}

/**
 * Function to optimize GeoJSON using Ramer-Douglas-Peucker algorithm
 **/ 
function simplifyGeoJSON(geoJSON, tolerance) {
  return geoJSON.features.map(feature => {
    // Ensure the feature has geometry and it's a Polygon or MultiPolygon
    if (feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
      const result = turf.simplify(feature, {
        tolerance: tolerance,
        highQuality: false,
        mutate: false
      })

      return result.geometry.coordinates
    }
  })
}

/**
 * Main function to load, optimize, and save GeoJSON
 */
async function processGeoJSON(inputFile, outputPath = FINAL_MASK) {
    try {
//       const a = `convert heightmap.png -level 10%,100% darken.png
// convert darken.png -colorspace Gray -threshold 20% low-mask.png
// convert darken.png -colorspace Gray -negate -threshold 20% high-mask.png
// convert low-mask.png high-mask.png -compose Multiply -composite mask.png`
      await execAsync(`convert "${inputFile}" -threshold ${PNG_THRESHOLD}% -background white -alpha remove -colorspace gray -flip "${OUTPUT_PBM}"`)
      await execAsync(`potrace "${OUTPUT_PBM}" -O ${CURVE_THRESHOLD} -u ${PIXEL_QUANTIZE} -b geojson -o "${OUTPUT_JSON}"`)
      const geoJSON = await readGeoJSON(OUTPUT_JSON)
      const optimizedGeoJSON = simplifyGeoJSON(geoJSON, JSON_TOLERATNCE)
      await execAsync(`rm ${OUTPUT_PBM}`)
      await execAsync(`rm ${OUTPUT_JSON}`)
      fs.writeFileSync(outputPath, JSON.stringify(optimizedGeoJSON, null, 2))
      console.log(`Optimized mask saved to "${outputPath}"`)
  } catch (error) {
      console.error('Error creating mask:', error)
  }
}

const inputFilePath = path.resolve(process.argv[2])

if (!inputFilePath) {
    console.error('Please provide an input file.')
    process.exit(1)
}

processGeoJSON(inputFilePath)
