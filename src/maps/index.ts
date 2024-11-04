const chunkWidth = 64
const chunkHeight = 64
const chunks: Phaser.GameObjects.Bob[]  = []
let i = 0

/**
 * Create blitter chunks based on the map texture.
 */
export function createMap (scene: Phaser.Scene, textureName: string = 'map') {
  const blitter = scene.add.blitter(0, 0, textureName)
  const texture = scene.textures.get(textureName)
  const image = texture.getSourceImage()
  const imageWidth = image.width
  const imageHeight = image.height

  for (let y = 0; y < imageHeight; y += chunkHeight) {
    for (let x = 0; x < imageWidth; x += chunkWidth) {
      // Create the frame using the texture key and dimensions
      const frame = new Phaser.Textures.Frame(
        texture, // The texture object
        `map-${x}-${y}`, // Name for the frame
        i, // Use the index variable to track the frame index
        x, // cutX - X position in the original image
        y, // cutY - Y position in the original image
        chunkWidth, // Width of the frame
        chunkHeight // Height of the frame
      );

      // Create the chunk with the specified texture and frame
      const chunk = blitter.create(x, y, frame)
      chunk.setVisible(false)
      chunks.push(chunk)

      i += 1
    }
  }

  scene.cameras.main.setBounds(0, 0, imageWidth, imageHeight)
}

/**
 * Update visibility of map chunks based on camera position.
 * @param scene 
 */
export function update(scene: Phaser.Scene) {
  const camera = scene.cameras.main
  const cameraView = camera.worldView

  // Calculate the chunk grid coordinates for chunks that are one chunkWidth and chunkHeight outside the camera bounds
  const adjustedStartX = Math.floor((cameraView.x - chunkWidth) / chunkWidth)
  const adjustedStartY = Math.floor((cameraView.y - chunkHeight) / chunkHeight)
  const adjustedEndX = Math.ceil((cameraView.right + chunkWidth) / chunkWidth)
  const adjustedEndY = Math.ceil((cameraView.bottom + chunkHeight) / chunkHeight)

  // Loop through the chunks and update visibility
  chunks.forEach(chunk => {
    const chunkX = Math.floor(chunk.x / chunkWidth)
    const chunkY = Math.floor(chunk.y / chunkHeight)
    
    // Determine if the chunk should be visible based on the adjusted camera view
    const isVisible = chunkX >= adjustedStartX && chunkX < adjustedEndX && chunkY >= adjustedStartY && chunkY < adjustedEndY

    // Only update visibility if it has changed to optimize performance
    if (chunk.visible !== isVisible) {
      chunk.setVisible(isVisible)
    }
  })
}
