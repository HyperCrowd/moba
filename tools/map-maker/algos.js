export default {
  averaging: (a, b) => (a + b) / 2,
  denseCity: (a, b) => Math.cos(a) / (Math.cos(a) + Math.sin(b)),
  complexCave: (a, b) => Math.sin(a) / (Math.cos(a) + Math.sin(b)),
  cloudCoverage: (a, b) => Math.atan(a) / (Math.cos(a) + Math.sin(b)),
  fingerprint: (a, b) => Math.sin(a) / (Math.atan(a) + Math.cos(b)),
  sediment: (a, b) => a & b
    ? Math.log(a) * Math.cos(b)
    : Math.cos(a) / (Math.cos(a) + Math.sin(b)),
  grass: (a, b) => Math.pow(a, 4) * Math.pow(b, 4),
  cliffChunks: (a, b) => a & b,
  scotland: (a, b) => a ^ b,
  trails: (a, b) => a >> b,
  waterways: (a, b) => a << b,
  politicalChunks: (a, b) => a % b,
  forest: (a, b) => a * b,
  river: (a, b) => ((a ** b) / (b ** a)) * 255,
  maryland: (a, b) => (Math.log(a) / Math.log(b)) * 255,
  mesas: (a, b) => a !== b
    ? a | b
    : a & b,
  ridges: (a, b) => Math.sin(a) % Math.cos(b),
  complexity: (a, b) => (Math.sin(a) / Math.cos(b)) * 255,
  populationDiffusion: (a, b) => Math.random() > 0.75
    ? a * Math.PI
    : b * Math.E,
  groupedComplexity: (a, b) => Math.random() > 0.75
    ? a * b
    : a ^ b,
  waterAccumulation: (a, b) => a & b
    ? a * b
    : Math.pow(a, b),
  lightBrush: (a, b) => Math.cos(a) * Math.sin(b) > .90
    ? a << b
    : 255,
  thickBrush: (a, b) => Math.cos(a) > Math.random() && Math.sin(b) > Math.random()
    ? a << b
    : 255,
  denseBrush:(a, b) => Math.cos(a) * Math.random() > Math.sin(b) * Math.random()
    ? a << b
    : 255,
  unknown: (a, b) => Math.cos(a) * Math.PI & Math.log(b)
    ? a << b
    : 255,
  strands: (a, b) => Math.cos(a) * Math.PI >> Math.log(b)
    ? 0
    : Math.cos(a) * 255,
  chaos: (a, b) => parseInt(a) % 2 === 0
    ? Math.cos(a) * Math.sin(b) * 255
    : 0,
  edges: (a, b) => parseInt(a) % 6 === 0
    ? Math.cos(a) * Math.sin(b) * 255
    : 0,
  creeks: (a, b) => parseInt(a) % 25 === 0
    ? Math.cos(a) * Math.sin(b) * 64
    : 255,
  steppes: (a, b) => parseInt(a) & 25
    ? 255
    : Math.pow(a, b) % 255,
  segmented: (a, b, mA, mB, x, y) => {
    const nextAX = mA[x + 1] ?? mA[x]
    const lastBX = mB[y - 1] ?? mB[y]
    
    const dX = (nextAX[y] -lastBX[y]) / 2 || 0
    const dY = (mA[x][y + 1] - mB[x][y - 1]) / 2 || 0
    return dX % dY
    },
  ringOfFire: (a, b, mA, mB, x, y) => {
    const nextAX = mA[x + 1] ?? mA[x]
    const lastBX = mB[y - 1] ?? mB[y]
    
    const dX = (nextAX[y] - lastBX[y]) / 2 || 0
    const dY = (mA[x][y + 1] - mB[x][y - 1]) / 2 || 0
    return Math.pow(dX, 2) + Math.pow(dY, 2)
  },
  chasm: (a, b) => Math.abs(a - b),
  sedimentVariance: (a, b) => Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)) * Math.sin(a + b),
  border: (a, b) => Math.exp(-((a - b) ** 2) / (2 * 0.5 ** 2)) * 255,
  cityLimits: (a, b) => (Math.log(1 + a) + Math.log(1 + b)) * 255,
  sawWave: (a, b) => (Math.pow(a, 1.5) + Math.pow(b, 1.5)) / 2
}