export function getColorMode (mode: string): string {
  switch (mode.toLowerCase()) {
    case 'blend': return 'ADD'
    case 'dark': return 'MUTLIPLY'
    case 'light': return 'SCREEN'
    case 'invert': return 'ERASE'
    case 'atop':
    default: return 'NORMAL'
  }
}