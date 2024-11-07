import seedrandom from 'seedrandom'

/**
 * Diamond-Square generator
 */
export class DsMap {
  /**
   * Constructor
   *
   * @param {Number} degree           Size (in pixels size = 2^degree)
   * @param {Number} [height=1]       Max height
   * @param {Number} [roughness=0.5]  Max roughness
   */
  constructor(degree, { height = 1, roughness = 0.5 } = {}) {
    const makeLine = (x) => new Array(x + 1);

    this.randomizer = seedrandom();

    this.size = 2 ** degree;
    this.height = height;
    this.roughness = roughness;
    this.data = Array.from(makeLine(this.size), () => makeLine(this.size));
  }

  /**
   * Run the calculation process
   */
  calculate() {
    this.init();

    let { size } = this;
    let n = 1;

    while (size > 1 && n < 1000) {
      this.stepSquare(size);
      size /= 2;
      n += 1;
    }
  }

  /**
   * Returns average height of the diamond corners
   *
   * @param  {Number} x                  Center X coordinate
   * @param  {Number} y                  Center Y coordinate
   * @param  {Number} size               Size of the diamond shape
   *
   * @return {Number}      Average height
   */
  getDiamondAvg(x, y, size) {
    let l = this.data[y][x - size];
    let t = y === 0 ? undefined : this.data[y - size][x];
    let r = this.data[y][x + size];
    let b = y === this.size ? undefined : this.data[y + size][x];

    if (l === undefined) {
      l = (r + t + b) / 3;
    } else if (t === undefined) {
      t = (l + r + b) / 3;
    } else if (r === undefined) {
      r = (l + t + b) / 3;
    } else if (b === undefined) {
      b = (l + r + t) / 3;
    }

    const avg = (l + r + t + b) / 4 + this.getRoughness(size);

    return Math.max(avg, 0);
  }

  /**
   * Returns random height changes
   * The maximum height decreases in proportion to the side size
   *
   * @param  {Number} size               Shape side size
   *
   * @return {Number}      Random number, within a given height
   */
  getRoughness(size) {
    const roughSize = this.roughness * (size / this.size);
    const rough = this.rand(roughSize) - (roughSize / 2);

    return rough;
  }

  /**
   * Calculates the height of the midpoint of a square in X, Y coordinates with side size = size
   *
   * @param  {Number} x                  X coordinate of the center of the square
   * @param  {Number} y                  Y coordinate of the center of the square
   * @param  {Number} size               Square side size
   *
   * @return {Number}      Square center height
   */
  getSquareAvg(x, y, size) {
    const lt = this.data[y - size][x - size];
    const rt = this.data[y - size][x + size];
    const lb = this.data[y + size][x - size];
    const rb = this.data[y + size][x + size];

    const avg = (lt + rt + lb + rb) / 4 + this.getRoughness(size);

    return Math.max(avg, 0);
  }

  /**
   * Calculates the initial height of the map corners
   */
  init() {
    this.data[0][0] = this.rand(this.height);
    this.data[0][this.size] = this.rand(this.height);
    this.data[this.size][0] = this.rand(this.height);
    this.data[this.size][this.size] = this.rand(this.height);
  }

  /**
   * Normalizes the map, bringing all heights to the unit range and scales to the `scale` range
   *
   * @param  {Number} [scale=1]               Scaling factor
   */
  normalize(scale = 1) {
    const max = Math.max(...this.data.flat());
    const min = Math.min(...this.data.flat());
    const k = max - min;
    this.data.forEach((row, y) => {
      row.forEach((cell, x) => {
        this.data[y][x] = ((cell - min) / k) * scale;
      });
    });
  }

  rand(max) {
    return this.randomizer() * max;
  }

  seed(seed, xor4096 = false) {
    this.randomizer = xor4096 ? seedrandom.xor4096(seed) : seedrandom(seed);
  }

  stepDiamond(direction, sx, sy, size) {
    let coordinateX;
    let coordinateY;
    const halfSize = size / 2;

    switch (direction) {
      case 'left':
        coordinateX = sx - halfSize;
        coordinateY = sy;
        break;

      case 'right':
        coordinateX = sx + halfSize;
        coordinateY = sy;
        break;

      case 'top':
        coordinateX = sx;
        coordinateY = sy - halfSize;
        break;

      case 'bottom':
        coordinateX = sx;
        coordinateY = sy + halfSize;
        break;

      default:
        throw new Error(`Unknown direction ${direction}`);
    }

    const avg = this.getDiamondAvg(coordinateX, coordinateY, halfSize);

    this.data[coordinateY][coordinateX] = avg;
  }

  stepSquare(size) {
    const squares = this.size / size;
    const halfSize = size / 2;
    for (let squarePosY = 0; squarePosY < squares; squarePosY += 1) {
      const coordinateY = squarePosY * size + halfSize;
      for (let squarePosX = 0; squarePosX < squares; squarePosX += 1) {
        const coordinateX = squarePosX * size + halfSize;
        const avg = this.getSquareAvg(coordinateX, coordinateY, halfSize);

        this.data[coordinateY][coordinateX] = avg;

        this.stepDiamond('left', coordinateX, coordinateY, size);
        this.stepDiamond('top', coordinateX, coordinateY, size);
        this.stepDiamond('right', coordinateX, coordinateY, size);
        this.stepDiamond('bottom', coordinateX, coordinateY, size);
      }
    }
  }
}