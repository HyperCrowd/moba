import fs from 'fs'
import { PNG } from 'pngjs'

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
