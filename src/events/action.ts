import type { NetCodeDefinition } from '../network/message'
import type { Struct } from '../types'
import type { System } from '../types'
import { EventType } from './events'
import { logDebug, logError, logSilly } from '../utils/log'

type ActionResult = {
  result: Struct
  errors: Struct
}

type ActionResponse = (response: ActionResult) => ActionResult

type ActionFunction = (delta: number, system: System, args: Struct) => ActionResult

type Action = {
  command: string,
  onAction: ActionFunction,
  netCode?: NetCodeDefinition
}

const actions: { [key: string]: Action} = {}
let system: System

/**
 * 
 */
export const startActions = (sys: System) => {
  system = sys

  /**
   * 
   */
  system.eventQueue.on(EventType.ACTION_COMPLETED, payload => {
    logDebug(EventType.ACTION_COMPLETED, payload)
  })

  /**
   * 
   */
  system.eventQueue.on(EventType.ACTION_FAILED, payload => {
    logError(EventType.ACTION_COMPLETED, payload)
  })

  /**
   * 
   */
  system.eventQueue.on(EventType.ACTION_REQUESTED, async (payload) => {
    const data = payload.data ?? {}
    const actionName = data.name as string

    const action = actions[actionName]

    if (action === undefined) {
      return
    }
    
    logSilly(EventType.ACTION_COMPLETED, payload)

    const delta = data.delta as number
    const options = data.data as Struct

    const { result, errors } = await action.onAction(delta, system, options);

    const response = {
      name: actionName,
      result,
      errors
    }

    if (errors === undefined) {
      const onComplete = data.onComplete as ActionResponse
      system.eventQueue.emit(EventType.ACTION_COMPLETED, response)
      onComplete(response)
    } else {
      const onError = data.onError as ActionResponse
      system.eventQueue.emit(EventType.ACTION_FAILED, response)
      onError(response)
    }
  })
}

/**
 * 
 * @param action 
 * @param args 
 * @param delta 
 */
export const act = async (name: string, data: Struct, delta: number) => {
  const promise = new Promise<ActionResult>((resolve, reject) => {
    system.eventQueue.emit(EventType.ACTION_REQUESTED, {
      name: name.toLowerCase(),
      delta,
      data,
      onComplete: resolve,
      onError: reject
    })
  })

  return promise
}

/**
 * 
 */
export const createAction = (command: string, onAction: ActionFunction, netCode?: NetCodeDefinition) => {
  const lowerCase = command.toLowerCase()
  if (actions[lowerCase] !== undefined) {
    return actions[lowerCase]
  }

  const action = {
    command: lowerCase,
    onAction,
    netCode
  }

  if (netCode) {
    // TODO register the action to activated by network I/O
  }

  actions[lowerCase] = action

  return action
}
