// Module Types

import type { NetCodeDefinition } from '../network/message'
import type { Struct, Primitive, System } from '../types'

type ActionResult = {
  result: Struct | Primitive | Primitive[]
  errors?: Error[]
}

type ActionResponse = (response: ActionResult) => ActionResult

type ActionFunction<T = unknown> = (options: T, system: System) => ActionResult | void

type Action<T = unknown> = {
  command: string,
  onAction: ActionFunction<T>,
  netCode?: NetCodeDefinition[]
}

type Actions =  {
  [key: string]: Action<unknown>
}

// Module Definition

import { defineActions } from './actions'
import { EventType } from './events'
import { logDebug, logError, logSilly } from '../utils/log'

const actions: Actions = {}

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
    logDebug('ACTION_COMPLETED', payload)
  })

  /**
   * 
   */
  system.eventQueue.on(EventType.ACTION_FAILED, payload => {
    logError('ACTION_FAILED', payload)
  })

  /**
   * 
   */
  system.eventQueue.on(EventType.ACTION_REQUESTED, async (payload) => {
    const data: Struct = payload.data ?? {}
    const actionName = data.name as string

    const action = actions[actionName]

    if (action === undefined) {
      return
    }
    
    logSilly('ACTION_REQUESTED', payload)

    const options = data.data as Struct

    const outcome = await action.onAction(options, system);

    if (outcome === undefined) {
      return
    }

    const response = {
      name: actionName,
      result: outcome.result,
      errors: outcome.errors
    }

    if (outcome.errors === undefined || outcome.errors.length === 0) {
      const onComplete = data.onComplete as ActionResponse
      system.eventQueue.emit(EventType.ACTION_COMPLETED, response)
      onComplete(response)
    } else {
      const onError = data.onError as ActionResponse
      system.eventQueue.emit(EventType.ACTION_FAILED, response)
      onError(response)
    }
  })

  defineActions()
}

/**
 * 
 * @param action 
 * @param args 
 * @param delta 
 */
export const act = async (name: string, data: Struct | Primitive[], populateViaNetcode = false) => {
  const promise = new Promise<ActionResult>((resolve, reject) => {
    if (populateViaNetcode === true) {
      const action = actions[name]

      if (action === undefined) {
        return false
      }

      const newData: Struct = {}
      const netCode = action.netCode ?? []
      let i = 0

      for (const variable of netCode) {
        newData[variable[0]] = (data as Primitive[])[i]
        i += 1
      }

      data = newData
    }

    system.eventQueue.emit(EventType.ACTION_REQUESTED, {
      name: name.toLowerCase(),
      data: data as Struct,
      onComplete: resolve,
      onError: reject
    })
  })

  return promise
}

/**
 * 
 */
export const createAction = <T = unknown>(command: string, onAction: ActionFunction<T>, netCode?: NetCodeDefinition[]) => {
  const lowerCase = command.toLowerCase()
  if (actions[lowerCase] !== undefined) {
    return actions[lowerCase] as Action<T>
  }

  const action: Action<T> = {
    command: lowerCase,
    onAction,
    netCode
  }

  if (netCode) {
    // TODO register the action to activated by network I/O
  }

  actions[lowerCase] = action as Action<unknown>

  return action
}
