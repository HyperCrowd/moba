import type { NetCodeDefinition } from '../network/message'
import type { Struct } from '../types'
import type { System } from '../types'
import { EventType } from './events'

type ActionResult = {
  result: Struct
  errors: Struct
}

type ActionFunction = (delta: number, args: Struct, system: System, scene: Phaser.Scene) => ActionResult

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
export const startActions = (scene: Phaser.Scene, sys: System) => {
  system = sys

  /**
   * 
   */
  system.eventQueue.on(EventType.ACTION_COMPLETED, () => {
    // TODO
  })

  /**
   * 
   */
  system.eventQueue.on(EventType.ACTION_FAILED, () => {
    // TODO
  })

  /**
   * 
   */
  system.eventQueue.on(EventType.ACTION_REQUESTED, async (payload) => {
    const data = payload.data ?? {}
    const actionName = data.name as string
    const delta = data.delta as number
    const values = data.values as Struct
    const onComplete = data.onComplete as (response: ActionResult) => ActionResult
    const onError = data.onError as (response: ActionResult) => ActionResult

    const action = actions[actionName]

    if (action === undefined) {
      return
    }

    const { result, errors } = await action.onAction(delta, values, system, scene);

    const response = {
      name: actionName,
      result,
      errors
    }

    if (errors === undefined) {
      system.eventQueue.emit(EventType.ACTION_COMPLETED, response)
      onComplete(response)
    } else {
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
export const act = async (name: string, values: Struct, delta: number) => {
  return new Promise<ActionResult>((resolve, reject) => {
    system.eventQueue.emit(EventType.ACTION_REQUESTED, {
      name,
      delta,
      data: {
        values
      },
      onComplete: resolve,
      onError: reject
    })
  })
}

/**
 * 
 */
export const createAction = (command: string, onAction: ActionFunction, netCode?: NetCodeDefinition) => {
  if (actions[command] !== undefined) {
    return actions[command]
  }

  const action = {
    command,
    onAction,
    netCode
  }

  if (netCode) {
    // TODO register the action to activated by network I/O
  }

  actions[command] = action

  return action
}
