import type { PublicMembers } from '../../types'
import type { EffectJSON } from '../effect'
// import { getModifierById, GroupModifierTarget } from '../modifiers'
import { Entity } from '../index'

type GroupJSON = PublicMembers<Group>

export enum GroupType {
  Faction,
  Gang,
  Corporation
}

// Define class for Groups
export class Group extends Entity {
  constructor(options: GroupJSON) {
    super(options)
  }

  /**
   * Add an effect
   */
  addEffect (modifierId: number, personnelId: number, adjustments: EffectJSON) {
    return super.addEffect(modifierId, personnelId, adjustments)
  }

  /**
   *
   */
  getValues(/* currentTime: number */) {
    const result = {}

    // const effects = []

    // for (const effect of this.effects) {
    //   const modifier = getModifierById(effect.modifierId)

    //   if (modifier.type === GroupModifierTarget.StartTime
    //   || modifier.type === GroupModifierTarget.EndTime
    //   || modifier.type === GroupModifierTarget.Amount
    //   || modifier.type === GroupModifierTarget.FalloffShape
    //   || modifier.type === GroupModifierTarget.MaxStacks) {
    //     // We modify the modifier

    //     switch (modifier.target) {
    //       case GroupModifierTarget.StartTime:
    //         modifier.startTime += effect.getAmount(currentTime)
    //         break
    //       case GroupModifierTarget.EndTime:
    //         modifier.endTime += effect.getAmount(currentTime)
    //         break
    //       case GroupModifierTarget.Amount:
    //         modifier.amount += effect.getAmount(currentTime)
    //         break
    //       case GroupModifierTarget.FalloffShape:
    //         modifier.falloffType = effect.getAmount(currentTime)
    //         break
    //       case GroupModifierTarget.MaxStacks:
    //         modifier.maxStacks += effect.getAmount(currentTime)
    //         break
    //     }
    //   } else {
    //     // We modify the group
    //     effects.push(effect)
    //   }
    // }

    // for (const effect of effects) {
    //   // Apply effects to the group
    //   switch (modifier.target) {
    //     case GroupModifierTarget.BountyContribution:
    //       result.bountyContribution += effect.getAmount(currentTime)
    //       break
    //   }
    // }

    return result
  }
}
