/**
 * 
 * @param scene 
 * @param startX 
 * @param startY 
 * @param endX 
 * @param endY 
 */
export function drawLine (scene: Phaser.Scene, startX: number, startY: number, endX: number, endY: number) {
  // Create the image (the 1x1 black pixel)
  const line = scene.add.image(startX, startY, 'dot') // 'dot' is a 1x1 black pixel

  // Calculate the horizontal (dx) and vertical (dy) distances
  const dx = endX - startX
  const dy = endY - startY

  // Calculate the length (distance) of the line
  const length = Math.sqrt(dx * dx + dy * dy) // Pythagorean theorem: sqrt(dx^2 + dy^2)

  // Calculate the angle of the line
  const angle = Math.atan2(dy, dx) // atan2 handles both positive and negative slopes

  // Stretch the pixel to the correct length
  line.setDisplaySize(length, 1)  // 1px height, scale width to length

  // Rotate the line segment to match the angle of the line
  line.setRotation(angle)
}

/**
 * 
 * @param scene 
 * @param x 
 * @param y 
 * @param width 
 * @param height 
 * @param color 
 */
export function drawSquare (square: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, color: number = 0x00ff00) {
  square.clear()
  square.lineStyle(1, color, 1)
  square.strokeRect(x, y, width, height)
  square.setZ(1000)
}