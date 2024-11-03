import { DataConnection, Peer } from 'peerjs'
import { prepareMessage } from './message'
import { getSha256, getGUID } from '../utils/crypto'
import { getConcatenatedDates } from '../utils/dates'

/**
 * 
 */
export async function becomeCoordinator (coordinatorId: string): Promise<Peer> { 
  console.info(`Becoming Coordinator... (${coordinatorId})`)
  return new Promise((resolve) => {
    // Define yourself as the Coordinator
    const peer = new Peer(coordinatorId)

    /**
     *
     */
    peer.on('error', console.error)

    /**
     *
     */
    peer.on('connection', (connection) => {
      // A Peer has connected
      console.info('A Peer is connected!')

      /**
       *
       */
      connection.on('error', console.error)

      /**
       *
       */
      connection.on('data', (data: unknown) => {
        // A Peer is sending data
        console.info('A Peer is sending data!')
        if (data instanceof ArrayBuffer) {
          // A Peer has send the correct buffer format
          const view = new DataView(data)
          console.log('Coordinator gets:', view)
        } else {
          // Invalid message from peer
          throw new TypeError('Expected an ArrayBuffer');
        }
      })

      /**
       *
       */
      connection.on('open', () => {
        // Send the Peer the secret so they can communicate
        const message = prepareMessage('registered', {
          secret: parseInt(coordinatorId, 16)
        })

        // Send the message to the Peer
        connection.send(message)
        console.log('Coordinator sends:', message)
      })
    })

    peer.on('open', () => {
      // The peer is connected to the server as a Coordinator
      console.info('You are now Coordinator!')
      resolve(peer)
    })
  })
}

/**
 * 
 */
async function connectToCoordinator (id: string, coordinatorId: string): Promise<DataConnection> {
  console.info(`Connecting to Coordinator (${coordinatorId})...`)
  return new Promise((resolve, reject) => {
    // Define yourself as a Peer
    const peer = new Peer(id)
    let registered = false

    /**
     *
     */
    peer.on('open', () => {
      // You've connected to the Coordinator
      console.info('Registering with the Coordinator...')

      // Begin connection to the Coordinator
      const connection = peer.connect(coordinatorId, {
        serialization: 'binary',
        label: 'test' // TODO Explore how PeerJS uses labels
      })

      /**
       *
       */
      connection.on('error', console.error)

      /**
       * 
       */
      connection.on('open', () => {
        // Begin registration
        const message = prepareMessage('register', {
          coordinatorId: parseInt(coordinatorId, 16)
        })
  
        connection.send(message)
  
        setTimeout(() => {
          if (registered === false) {
            reject('COORDINATOR_TIMEOUT')
          }
        }, 30000)  
      })

      /**
       * 
       */
      connection.on('data', (data: unknown) => {
        // A Coordinator is sending data
        console.info('A Coordiantor is sending data!')
        if (data instanceof ArrayBuffer) {
          // A Coordiantor has send the correct buffer format
          const view = new DataView(data)
          console.log('Peer gets:', view)
          registered = true
          resolve(connection)
        } else {
          // Invalid message from Coordiantor
          throw new TypeError('Expected an ArrayBuffer');
        }
      })
    })

    /**
     *
     */
    peer.on('error', e => {
      if (e.toString().indexOf(coordinatorId) > -1) {
        peer.disconnect()
        peer.destroy()
        console.info('Coordinator does not exist!')
        reject('NO_COORDINATOR')
      } else {
        reject(e)
      }
    })
  })
}

/**
 * 
 */
export async function connect () {
  const coordinatorId = await getSha256(getConcatenatedDates())
  const id = await getSha256(getGUID())
  
  try {
    const coordinator = await connectToCoordinator(id, coordinatorId)
    console.log({ coordinatorId, coordinator })

    return coordinator
  } catch (e) {
    if (e === 'NO_COORDINATOR') {
      // Become the coordinator
      const results = await becomeCoordinator(coordinatorId)
      console.log(results)
    }
  }
}
