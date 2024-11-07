import fs from 'fs'
import { PNG } from 'pngjs'
import { palettes } from './palettes.js';

/**
 * Load a PNG image asynchronously using pngjs
 * @param {string} filename - Path to the PNG file.
 * @returns {Promise<PNG>} - Promise that resolves to the loaded PNG image.
 */
function loadPNG(filename) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filename)
      .pipe(new PNG({ filterType: 4 })) // Use filterType 4 for grayscale
      .on('parsed', function() {
        resolve(this);
      })
      .on('error', reject);
  });
}

/**
 * Save a PNG image asynchronously
 * @param {PNG} image - The PNG image to save.
 * @param {string} filename - Path to save the PNG file.
 * @returns {Promise<void>} - A promise that resolves when the image is saved.
 */
function savePNG(image, filename) {
  return new Promise((resolve, reject) => {
    image.pack().pipe(fs.createWriteStream(filename))
      .on('finish', resolve)
      .on('error', reject);
  });
}

/**
 * Convert hex color to RGB array
 * @param {string} hex - Hex color string (e.g., '#ff00ff').
 * @returns {number[]} Array of RGB values [r, g, b]
 */
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return [r, g, b];
}

/**
 * Interpolate between two colors based on a factor (0-1)
 * @param {string} color1 - The first color in hex format (e.g., '#ff0000').
 * @param {string} color2 - The second color in hex format (e.g., '#00ff00').
 * @param {number} factor - The interpolation factor between 0 and 1.
 * @returns {string} - The interpolated color in hex format.
 */
function interpolateColor(color1, color2, factor) {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return [r, g, b];
}

/**
 * Precompute the gradient colors for every grayscale value from 0 to 255.
 * @param {object} palette - The palette object containing colors and their thresholds.
 * @returns {string[]} - An array where each index corresponds to a grayscale value and holds the color for that value.
 */
function precomputePaletteColors (palette) {
  // Sort the palette by threshold
  const colors = [];
  
  const sortedPalette = Object.entries(palette)
  //.sort((a, b) => a[1] - b[1]);

  // Generate the color for each grayscale value between 0 and 255
  for (let gray = 0; gray <= 255; gray++) {
    // Find the two nearest thresholds in the palette
    const grayPercentage = gray / 255 * 100

    for (let i = 0; i < sortedPalette.length; i++) {
      const [min, max] = sortedPalette[i][1];

      if (grayPercentage >= min && grayPercentage <= max) {
        // Calculate the interpolation factor (0-1) between color1 and color2
        const factor = (grayPercentage - min) / (max - min);

        // Interpolate between color1 and color2 and store the result
        const color1 = sortedPalette[i][0]
        const color2 = (sortedPalette[i + 1] || sortedPalette[i])[0]
        colors[gray] = interpolateColor(color1, color2, factor)
        break
      }
    }
  }

  return colors
}

/**
 * Apply the gradient from the palette to the grayscale PNG
 * @param {string} inputFile - Path to the input grayscale PNG.
 * @param {string} paletteName - The name of the palette to use (e.g., 'grasslands').
 * @param {string} outputFile - Path to save the output PNG.
 */
export async function colorize(pngFile, paletteName, alphaThresholdBelow = 0, alphaThresholdAbove = 255) {
  const palette = palettes[paletteName];
  const inputFile = pngFile instanceof Array
    ? pngFile[0]
    : pngFile
  const outputFile = pngFile instanceof Array
    ? pngFile[1]
    : pngFile


  if (!palette) {
    throw new Error(`Palette "${paletteName}" not found.`);
  }

  // Load the grayscale PNG file
  const image = await loadPNG(`output/${inputFile}.png`);

  const colors = precomputePaletteColors(palette)

  // Process the image pixels
  for (let i = 0; i < image.data.length; i += 4) {
    const gray = image.data[i]; // R, G, and B are all the same in grayscale

    // Interpolate between palette colors based on grayscale value
    const [r, g, b] = colors[gray]
    const isAlpha = (r < alphaThresholdBelow && g < alphaThresholdBelow && b < alphaThresholdBelow)
      || (r > alphaThresholdAbove && g > alphaThresholdAbove && b > alphaThresholdAbove)
    const opacity = isAlpha
      ? 0
      : 255

    image.data[i] = r;   // Red channel
    image.data[i + 1] = g; // Green channel
    image.data[i + 2] = b; // Blue channel
    image.data[i + 3] = opacity; // Alpha channel (fully opaque)
  }

  // Save the modified image
  await savePNG(image, `output/${outputFile}.png`)
}
