import { Entity } from '../index'
import { Modifier } from '../modifier'
import { HierarchyNode } from './node'
import { hierarchy, getTypeById } from './index'
import { Effect } from '../effect'
import { getModifierById } from '../modifiers'

type CriteriaCheck = (candidates: Entity | Modifier) => boolean

const percentRegex = /\.[A-Za-z_]+\s*===\s*([0-9]+\.?[0-9]*)%/g
const andRegex = / AND /g
const orRegex = / OR /g
const notEqualRegex = /!=/g
const equalRegex = /=/g
const lesserThanOrEqualRegex = /<=/g
const lesserThanRegex = /</g
const greaterThanOrEqualRegex = />=/g
const greaterThanRegex = />/g
const tagsRegex = /tags *= *(["'][^"']+["'])/g
const propertyRegex = /([A-Za-z_]+)/g
const hierarchyCache: Record<string, HierarchyNode[]> = {}
const criteriaCache: Record<string, CriteriaCheck> = {}

/**
 * 
 */
export const getEntityType = (query: string): HierarchyNode[] => {
  if (hierarchyCache[query] === undefined) {
    // Build a new search
    hierarchyCache[query] = hierarchy.search(query.toLowerCase())
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
  
  if (hierarchyCache[typeId] === undefined) {
    // Build a new child list
    hierarchyCache[typeId] = hierarchy.getAllChildren([], getTypeById(typeId))
  }

  return hierarchyCache[typeId].find(c => c.id === childId) !== undefined
}

/**
 *
 */
export const getCriteriaFilters = (conditions: string | string[]): CriteriaCheck[] => {
  const result: CriteriaCheck[] = []
  const normalizedConditions = conditions instanceof Array
    ? conditions
    : [conditions]
  
  for (const condition of normalizedConditions) {
    if (criteriaCache[condition] === undefined) {
      // Cache criteria
      const criteria = condition === '*'
        ? 'true'
        : condition || 'true'

      const code = criteria === 'true'
        ? 'return true'
        : 'return ' + criteria
          .replace(tagsRegex, 'entity.tags.indexOf($1) > -1')
          .replace(equalRegex, '===')
          .replace(notEqualRegex, '!==')
          .replace(andRegex, ' && ' )
          .replace(orRegex, ' || ' )
          .replace(propertyRegex, 'entity.$1.amount')
          .replace(percentRegex, '.isPercentDifference($1)')
          .replace(lesserThanOrEqualRegex, '<=')
          .replace(greaterThanOrEqualRegex, '>=')
          .replace(lesserThanRegex, '<')
          .replace(greaterThanRegex, '>')

      const newFunc = new Function('entity', code) as CriteriaCheck

      criteriaCache[condition] = newFunc
    }

    result.push(criteriaCache[condition])
  }

  return result
}

/**
 *
 */
export const query = (candidates: Entity[] | Modifier[], modifiers: Array<Effect | Modifier | number>) => {
  const hierarchy: HierarchyNode[] = []
  const criterias: CriteriaCheck[] = []
  const results: (Entity | Modifier)[] = []

  for (const modifier of modifiers) {
    const source = typeof modifier === 'number'
      ? getModifierById(modifier)
      : modifier

    // Get all filters for the modifier
    getCriteriaFilters(source.criteria).forEach(criteria => criterias.push(criteria))

    for (const target of source.targets) {
      // Get hierarchy targets from the modifier
      getEntityType(target).forEach(hierarchyNode => hierarchy.push(hierarchyNode))
    }
  }

  for (const candidate of candidates) {
    if (results.indexOf(candidate) > -1) {
      continue
    }

    const found = hierarchy.length === 0 && hierarchy.find(hierarchyNode => hierarchyNode.id === candidate.type)

    if (found !== undefined) {
      // Candidate has a type of the targeted hierarchies
      for (const criteria of criterias) {
        if(criteria(candidate) === true) {
          // The entity matches the criteria
          results.push(candidate)
          break
        }
      }
    }
  }

  return results
}
