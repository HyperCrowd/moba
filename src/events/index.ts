/**
 * Implements an EventQueue class that facilitates event handling and dispatching, allowing listeners to subscribe
 * to events, emit them with associated data, and manage scheduled and repeating events.
 * 
 * Event Types: The code uses a custom enumeration EventType to define different event types (e.g., PLAYER_DIED, HEALTH_REGEN).
 * Event Listener Type: EventQueueListener is a type representing functions that take an EventPayload as an argument.
 * Event Management:
 *   Listeners: Maintains a dictionary of listeners for each event type.
 *   Counters: Keeps track of how many times each event has been emitted.
 *   Scheduled Events: Manages both one-off and repeating events that can be scheduled for future execution.

 * Methods:
 * on(eventType: EventType, listener: EventQueueListener)
 *    Subscribe to an event.
 * off(eventType: EventType, listener: EventQueueListener)
 *   Unsubscribe from an event.
 * emit<T>(eventType: EventType, data?: Struct<T>)
 *   Emit an event to all registered listeners with optional data.
 * schedule(eventType: EventType, data: Struct, delay: number)
 *   Schedule an event to be emitted after a specified delay.
 * cancel(id: number)
 *   Cancel a scheduled event using its ID.
 * repeating(eventType: EventType, data: Struct, interval: number, duration: number)
 *   Emit an event repeatedly at specified intervals for a set duration.
 * tick()
 *   Resets the event counter, useful for integration with game loops.
 **/

// Module Types

export type EventPayload = {
  type: EventType
  counter: Counter
  data?: Struct
}

type EventQueueListener = (payload: EventPayload) => void

type Listeners = { 
  [key in EventType]?: EventQueueListener[]
}
type ScheduledEvent = {
  id: number
  type: EventType
  timeoutId?: ReturnType<typeof setTimeout>
  intervalId?: ReturnType<typeof setInterval>
}

type Counter = { [key in EventType]?: number }

type Config = Struct // TODO Config probably needs to be fleshed out

export type UpdateRegistration = {
  update: (delta: number) => void
  isComplete?: () => boolean
  onComplete?: () => void
}

// Module Definition

import { Struct } from '../types'
import { EventType } from './events'
import { logDebug } from '../utils/log'


let nextEventId = 0
/**
 * This handles and routes all events from all seasons
 */
export default class EventQueue {
  private listeners: Listeners = {}
  private scheduledEvents: ScheduledEvent[] = []
  private counter: { [key in EventType]?: number } = {}
  private updates: UpdateRegistration[] = []
  private config: Config = {}

  constructor (config: Config = this.config) {
    this.config = {
      ...this.config,
      ...config
    }
  }

  /**
   * Method to subscribe to an event
   **/
  public on(eventType: EventType, listener: EventQueueListener): EventQueueListener {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = []
    }
    this.listeners[eventType]?.push(listener)

    return listener
  }

  /**
   * Method to subscribe to an event
   **/
  public off (eventType: EventType, listener: EventQueueListener): void {
    if (!this.listeners[eventType]) {
      return
    }

    this.listeners[eventType] = this.listeners[eventType]?.filter(l => l !== listener)
  }

  /**
   * Method to subscribe to an event
   **/
 public emit (eventType: EventType, data?: Struct): void {
    const payload: EventPayload = {
      type: eventType,
      counter: this.counter,
      data
    }

    logDebug(`Emitting ${eventType} `, payload)

    const eventListeners = this.listeners[eventType]

    if (eventListeners) {
      this.counter[eventType] = (this.counter[eventType] || 0) + 1

      for (const listener of eventListeners) {
        listener(payload)
      }
    }
  }

  /**
   * Method to subscribe to an event
   **/
  public schedule (eventType: EventType, data: Struct, delay: number): number {
    const id = nextEventId++
    const timeoutId = setTimeout(() => {
      this.emit(eventType, data)
      this.cancel(id) // Cleanup after execution
    }, delay)

    this.scheduledEvents.push({ id, type: eventType, timeoutId })
    return id
  }


  /**
   * Method to subscribe to an event
   **/
  public cancel (id: number): void {
    const eventIndex = this.scheduledEvents.findIndex(e => e.id === id)

    if (eventIndex > -1) {
      const event = this.scheduledEvents[eventIndex]

      if (event.timeoutId) {
        clearTimeout(event.timeoutId)
      }

      if (event.intervalId) {
        clearInterval(event.intervalId)
      }

      this.scheduledEvents.splice(eventIndex, 1)
    }
  }

  /**
   * Method to emit a repeating event
   **/
  public repeating (eventType: EventType, data: Struct, interval: number, duration: number): number {
    const id = nextEventId++
    const endTime = Date.now() + duration
    const intervalId = setInterval(() => {
      if (Date.now() > endTime) {
        clearInterval(intervalId)
        this.cancel(id)
        return
      }

      this.emit(eventType, data)
    }, interval)

    this.scheduledEvents.push({ id, type: eventType, intervalId })
    return id
  }

  /**
   * 
   */
  public once(eventType: EventType, listener: EventQueueListener): void {
    const onceListener: EventQueueListener = (payload) => {
      listener(payload)
      this.off(eventType, onceListener) // Remove the listener after it has been called
    }

    this.on(eventType, onceListener)
  }

  /**
   * 
   */
  removeUpdate (update: UpdateRegistration) {
    const index = this.updates.findIndex(e => e === update)
    if (index > -1) {
      if (this.updates[index].onComplete) {
        this.updates[index].onComplete()
      }
      this.updates.splice(index, 1)
    }
  }

  /**
   * Method to emit a repeating event
   **/
  addUpdate(update: UpdateRegistration['update'], isComplete?: UpdateRegistration['isComplete'], onComplete?: UpdateRegistration['onComplete']): () => void {
    const action = {
      update,
      isComplete,
      onComplete
    }

    this.updates.push(action)

    return () => this.removeUpdate(action)
  }

  /**
   *
   **/
  update (delta: number)  {
    this.updates.forEach((action, index) => {
      action.update(delta)

      if (action.isComplete && action.isComplete()) {
        if (action.onComplete) {
          action.onComplete()
        }
        this.updates.splice(index, 1)
      }
    })
  }

  // Cleanup method to clear scheduled events and listeners
  public cleanup(): void {
    this.scheduledEvents.forEach(event => {
      if (event.timeoutId) {
        clearTimeout(event.timeoutId)
      }
      if (event.intervalId) {
        clearInterval(event.intervalId)
      }
    });
    this.scheduledEvents = [];
    this.listeners = {};
  }
}


/*
// Example usage
const eventQueue = new EventQueue()

// Define a listener
const onPlayerDied = (payload: EventPayload) => {
  console.log(`Player died with data:`, payload.data)
}

// Subscribe to the PLAYER_DIED event
eventQueue.on(EventType.PLAYER_DIED, onPlayerDied)

// Emit a PLAYER_DIED event
eventQueue.emit(EventType.PLAYER_DIED, { playerId: 1 })

// Schedule a delayed event
const healEventId = eventQueue.schedule(EventType.PLAYER_DIED, { playerId: 1 }, 2000)

// Cancel the scheduled event if needed
eventQueue.cancel(healEventId)

// Emit a repeating event (e.g., health regeneration)
const regenEventId = eventQueue.repeating(EventType.HEALTH_REGEN, { playerId: 1, amount: 5 }, 1000, 5000)

// You can also cancel the repeating event if necessary
eventQueue.cancel(regenEventId)
*/