import type { Entity } from './index'
import type { Modifier } from '../modifier'
import { HierarchyNode } from './node'
import { hierarchy, getTypeById } from './index'

const percentRegex = /\.[A-Za-z_]+\s*===\s*([0-9]+\.?[0-9]*)%/g
const andRegex = / AND /g
const orRegex = / OR /g
const notEqualRegex = /!=/g
const equalRegex = /=/g
const tagsRegex = /tags *= *(["'][^"']+["'])/g
const propertyRegex = /([A-Za-z_]+)/g
const hierarchyCache: Record<string, HierarchyNode[]> = {}
const criteriaCache = {}

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
export const isChildOfType = (child: HierarchyNode, type: HierarchyNode) => {
  if (hierarchyCache[type.id] === undefined) {
    // Build a new child list
    hierarchyCache[type.id] = hierarchy.getAllChildren([], type)
  }

  return hierarchyCache[type.id].find(c => c === child) !== undefined
}

/**
 * 
 */
export const isChildOfTypeById = (childId: number, typeId: number) => {
  return isChildOfType(getTypeById(childId), getTypeById(typeId))
}

/**
 *
 */
export const getCriteriaFilter = (conditions: string) => {
  if (criteriaCache[conditions] === undefined) {
    // Cache criteria
    const criteria = conditions === '*'
      ? 'true'
      : conditions || 'true'

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

    const newFunc = new Function('entity', code)
    criteriaCache[conditions] = newFunc
  }

  return criteriaCache[conditions]
}

/**
 *
 */
export const query = (candidates: Entity[] | Modifier[], modifiers: Modifier[]) => {
  const hierarchy = []
  const criterias = []
  const results = []

  for (const modifier of modifiers) {
    criterias.push(getCriteriaFilter(modifier.criteria))

    for (const target of modifier.targets) {
      // Get hierarchy targets
      getEntityType(target).forEach(entity => hierarchy.push(entity))
    }
  }

  for (const candidate of candidates) {
    const found = candidate.type instanceof Array
      ? hierarchy.some(hier => candidate.type.includes(hier))
      : hierarchy.indexOf(candidate.type) > -1

    if (found) {
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
