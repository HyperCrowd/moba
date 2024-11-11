import type { PublicMembers } from '../../types'
import type { EffectJSON } from '../effect'
import { Value } from '../value'
import { defaultAdjustment } from '../effect'
import { getModifierById, GroupModifierTarget } from '../modifiers'
import { Entity } from '../index'

type GroupJson = PublicMembers<Group>

export enum GroupType {
  Faction,
  Gang,
  Corporation
}

// Define class for Groups
export class Group extends Entity {
  // How much ease the group has in executing its will due to prestige
  ease: Value

  // How much of the UBI Waterfall can be taken by the group
  ubiTake: Value

  // How much the Group takes
  net: Value

  // How much the Group pays for operating costs
  opExLoss: Value

  // How much the Group pays for opposition activity
  oppoBudget: Value

  // How much the Group spends of its net
  expenses: Value

  // How much the Group retains from the net
  profit: Value

  // How much the Group spends on bounties
  bountyContribution: Value

  constructor(options: GroupJson) {
    super(options)

    this.ubiTake = this.prepareValue('take', options)
    this.ease = this.prepareValue('ease', options)
    this.oppoBudget = this.prepareValue('oppoBudget', options)
    this.opExLoss = this.prepareValue('opExLoss', options)
    this.bountyContribution = this.prepareValue('bountyContribution', options)
    this.net = this.prepareValue('net', options)
    this.expenses = this.prepareValue('expenses', options)
    this.profit = this.prepareValue('profit', options)
  }

  /**
   *
   */
  hasPerson (personnelId: number): boolean {
    const person = super.isAlive(personnelId)

    if (person === false) {
      // This person does not exist for some reason
      return false
    }

    switch (this.type) {
      case GroupType.Faction:
        if (person.factionId !== this.id) {
          // This person is not currently serving this faction
          return false
        }
        break
      case GroupType.Gang:
        if (person.gangId !== this.id) {
          // This person is not currently serving this gang
          return false
        }
        break
      case GroupType.Corporation:
        if (person.corporationId !== this.id) {
          // This person is not currently serving this corporation
          return false
        }
        break
    }

    return person
  }

  /**
   * Add an effect
   */
  addEffect (modifierId: number, personnelId: number, adjustments: EffectJSON = defaultAdjustment): void {
    const person = this.hasPerson(personnelId)

    if (person === false) {
      // This person does not exist for some reason
      return false
    }

    return super.addEffect(modifierId, personnelId, adjustments)
  }

  /**
   *
   */
  getValues(currentDegree = getClock().currentDegree) {
    const result = {
      ubiTake: this.ubiTake,
      ease: this.ease,
      oppoBudget: this.oppoBudget,
      opExLoss: this.opExLoss,
      bountyContribution: this.bountyContribution,
      net: this.net,
      expenses: this.expenses,
      profit: this.profit
    }

    const effects = []

    for (const effect of this.effects) {
      const modifier = getModifierById(effect.modifierId)

      if (modifier.type === GroupModifierTarget.StartTime
      || modifier.type === GroupModifierTarget.EndTime
      || modifier.type === GroupModifierTarget.Amount
      || modifier.type === GroupModifierTarget.FalloffShape
      || modifier.type === GroupModifierTarget.MaxStacks) {
        // We modify the modifier

        switch (modifier.target) {
          case GroupModifierTarget.StartTime:
            modifier.startTime += effect.getAmount(currentDegree)
            break
          case GroupModifierTarget.EndTime:
            modifier.endTime += effect.getAmount(currentDegree)
            break
          case GroupModifierTarget.Amount:
            modifier.amount += effect.getAmount(currentDegree)
            break
          case GroupModifierTarget.FalloffShape:
            modifier.falloffType = effect.getAmount(currentDegree)
            break
          case GroupModifierTarget.MaxStacks:
            modifier.maxStacks += effect.getAmount(currentDegree)
            break
        }
      } else {
        // We modify the group
        effects.push(effect)
      }
    }

    for (const effect of effects) {
      // Apply effects to the group
      switch (modifier.target) {
        case GroupModifierTarget.Ease:
          result.ease += effect.getAmount(currentDegree)
          break
        case GroupModifierTarget.UbiTake:
          result.ubiTake += effect.getAmount(currentDegree)
          break
        case GroupModifierTarget.Net:
          result.net += effect.getAmount(currentDegree)
          break
        case GroupModifierTarget.OpExLoss:
          result.opExLoss += effect.getAmount(currentDegree)
          break
        case GroupModifierTarget.OppoBudget:
          result.oppoBudget += effect.getAmount(currentDegree)
          break
        case GroupModifierTarget.Expenses:
          result.expenses += effect.getAmount(currentDegree)
          break
        case GroupModifierTarget.Profit:
          result.profit += effect.getAmount(currentDegree)
          break
        case GroupModifierTarget.BountyContribution:
          result.bountyContribution += effect.getAmount(currentDegree)
          break
      }
    }

    return result
  }
}
