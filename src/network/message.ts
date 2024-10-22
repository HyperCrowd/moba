type Commands = {
  [key: string]: Array<[string, number] | [string, string, number]>
}

type MessageArguments = {
  [key: string]: number
}

type DataViewMethods = Pick<DataView,
  'setInt8'
  | 'setUint8'
  | 'setInt16'
  | 'setUint16'
  | 'setInt32'
  | 'setUint32'
  | 'setFloat32'
  | 'setFloat64'
>

const ID_SIZE = 2
const INT = 'Int'
const UINT = 'Uint'
const FLOAT = 'Float'

const setInt8: keyof DataViewMethods = 'setInt8'
const setUint8: keyof DataViewMethods = 'setUint8'
const setInt16: keyof DataViewMethods = 'setInt16'
const setUint16: keyof DataViewMethods = 'setUint16'
const setInt32: keyof DataViewMethods = 'setInt32'
const setUint32: keyof DataViewMethods = 'setUint32'
const setFloat32: keyof DataViewMethods = 'setFloat32'
const setFloat64: keyof DataViewMethods = 'setFloat64'

const commands: Commands = {
  'register': [
    [ 'id', 0x001 ],
    [ 'peerId', FLOAT, 64]
  ],
  'registered': [
    [ 'id', 0x002 ],
    [ 'secret', FLOAT, 64]
  ],
  'move': [
    [ 'id', 0x003 ],
    [ 'playerId', UINT, 8 ],
    [ 'x', INT, 16 ],
    [ 'y', INT, 16 ],
  ],
  'shoot': [
    [ 'id', 0x004 ],
    [ 'playerId', UINT, 8 ],
    [ 'x', INT, 16 ],
    [ 'y', INT, 16 ],
  ],
}

/**
 * 
 */
export function prepareMessage (name: keyof Commands, options: MessageArguments = {}) {
  const command = commands[name]
  const offsets: number[] = []
  const values: number[] = []
  const types: Array<keyof DataViewMethods> = []
  let totalSize = 0
  
  for (const part of command) {
    if (part[0] === 'id') {
      // Dealing with command ID
      offsets.push(ID_SIZE)
      values.push(part[1] as number)
      types.push(setUint16)
      totalSize += ID_SIZE
    } else {
      // Dealing with a command argument
      const size = part[part.length - 1] as number
      offsets.push(size / 8)
      values.push(options[part[0]])

      switch (part[1]) {
        case INT:
          if (size === 8) {
            types.push(setInt8)
          } else if (size === 16) {
            types.push(setInt16)
          } else if (size === 32) {
            types.push(setInt32)
          }
          break
        case UINT:
          if (size === 8) {
            types.push(setUint8)
          } else if (size === 16) {
            types.push(setUint16)
          } else if (size === 32) {
            types.push(setUint32)
          }
          break
        case FLOAT:
          if (size === 32) {
            types.push(setFloat32)
          } else if (size === 64) {
            types.push(setFloat64)
          }
          break
      }
      totalSize += size
    }
  }
  
  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)

  for (let i = 0; i < offsets.length; i++) {
    view[types[i]](offsets[i], values[i])
  }

  return buffer
}
