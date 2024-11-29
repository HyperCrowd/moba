import type { Func } from '../../types'
import type { Modifier } from '../modifier'
import type { Effect } from '../effect'
import type { Entity } from '../index'
import { HierarchyNode } from './node'
import { getModifierById } from '../modifiers'
import { hierarchy, getTypeById } from './index'

type CandidateCheck = (candidates: Entity, helpers: { [key: string]: Func }) => boolean

const compareRegex = /([A-Za-z_]+) *(=|!=|<=|<|>|>=) *([0-9.]+)/g
const percentRegex = /([A-Za-z_]+) *(=|!=|<=|<|>|>=) *([0-9]+\.?[0-9])%/g
const andRegex = / AND /g
const orRegex = / OR /g
const notEqualRegex = /!=/g
const equalRegex = /(?<![<>])=[^>]/g
const tagsRegex = /tags *= *(["'][^"']+["'])/g
const typeRegex = /type +is +([^\s]+)/g
const typeOfRegex = /type +of +([^\s]+)/g
const hierarchyCache: Record<string, HierarchyNode[]> = {}
const criteriaCache: Record<string, CandidateCheck> = {}

/**
 * 
 */
export const getEntityType = (query: string | number): HierarchyNode[] => {
  if (hierarchyCache[query] === undefined) {
    // Build a new search
    hierarchyCache[query] = hierarchy.search(query.toString())
  }

  return hierarchyCache[query]
}

/**
 * 
 */
export const isChildOfType = (child: HierarchyNode | number, type: HierarchyNode | number) => {
  const childId = child instanceof HierarchyNode
    ? child.id
    : child

  const typeId = type instanceof HierarchyNode
    ? type.id
    : type
  
  const key = typeId + '.child'

  if (hierarchyCache[key] === undefined) {
    // Build a new child list
    hierarchyCache[key] = hierarchy.getAllChildren([], getTypeById(typeId))
  }

  return hierarchyCache[key].find(c => c.id === childId) !== undefined
}

/**
 *
 */
export const getCriteriaFilters = (conditions: string | string[]): CandidateCheck[] => {
  const result: CandidateCheck[] = []
  const normalizedConditions = conditions instanceof Array
    ? conditions
    : [conditions]

  for (const condition of normalizedConditions) {
    if (criteriaCache[condition] === undefined) {
      // Cache criteria
      const criteria = condition === '*'
        ? 'true'
        : condition || 'true'

      // TODO determine how best to bring in the applied effects to these stats
      const code = criteria === 'true'
        ? 'return true'
        : 'return ' + criteria
          .replace(tagsRegex, '[$1].some(element => entity.tags.includes(element))')
          .replace(typeOfRegex, `helpers.getEntityType($1).some(type => entity.type =  type.id)`) // TODO why is the rightmost character of $2 being destroyed?
          .replace(percentRegex, 'entity.stats.$1?.getPercentage() $2  $3') // TODO why is the rightmost character of $2 being destroyed?
          .replace(compareRegex, 'entity.stats.$1?.amount $2  $3') // TODO why is the rightmost character of $2 being destroyed?
          .replace(typeRegex, `entity.type =  $1`) // TODO why is the rightmost character of $2 being destroyed?
          .replace(equalRegex, '===')
          .replace(notEqualRegex, '!==')
          .replace(andRegex, ' && ' )
          .replace(orRegex, ' || ' )

      const newFunc = new Function('entity', 'helpers', code) as CandidateCheck

      criteriaCache[condition] = newFunc
    }

    result.push(criteriaCache[condition])
  }

  return result
}

/**
 * We start by passing in Candidates. Candidates are determined outside of the query system since there 
 * are many ways to target candidates (select all players, select all NPCs, get entities in a range, 
 * get entities in a pattern, get entities by math, etc.)  There is no easy way to represent candidate
 * selection via a query language.
 * 
 * Modifiers are list of Modifiers to apply to Targets.
 */
export const query = (candidates: Entity[], modifiers: Array<string | Effect | Modifier | number>) => {
  // Criterias are the collection of Criteria functions from all of the Modifiers.  Criteria is how 
  // we determine if a Candidate is a Target.  A Modifier can have multiple Criteria, which by default, 
  // will be treated as an implied OR operation between all criterias
  const criterias: CandidateCheck[] = []

  // Results are the final selection of entities that are targets.  This used to allow for the targeting 
  // of Modifiers, but it makes more sense to have impact specifically target Effects that are already 
  // on Entities
  const results: Entity[] = []

  // Iterate through all of the modifiers
  for (const modifier of modifiers) {
    // Convert the modifier to a unified format for ease of handling
    const criteria: string | string[] = typeof modifier === 'number'
      ? getModifierById(modifier).criteria
      : typeof modifier === 'string'
        ? modifier
        : modifier.criteria

    // Go through each Modifier's Criteria and extract its Criteria.
    getCriteriaFilters(criteria).forEach(criteria => criterias.push(criteria))

    // Go through each Target within the Modifier's target
    // for (const target of alteration.targets) {
    //   // This might lead to confusion.  It may be best to make Criteria responsible for Type targeting
    //   getEntityType(target).forEach(hierarchyNode => hierarchy.push(hierarchyNode))
    // }
  }

  // Once we have our targeting information, we go through the candidates, and see if the 
  // targeting information applies to each one.
  for (const candidate of candidates) {
    if (results.indexOf(candidate) > -1) {
      // Candidate is already a target, skip them
      continue
    }

    // Iterate through each Criteria
    for (const criteria of criterias) {
      // Apply the Criteria to the Candidate to see if they become a Target
      if(criteria(candidate, helpers) === true) {
        // The Candidate is officially a Target
        results.push(candidate)
        break
      }
    }
  }

  return results
}

const helpers = {
  getEntityType,
  isChildOfType
}
