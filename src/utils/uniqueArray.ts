/**
 * 
 */
export function mergeUniqueArrays<T>(arr1: T[], arr2: T[]): T[] {
  const uniqueElements = new Set<T>();

  // Add all elements from both arrays to the Set
  arr1.forEach(item => uniqueElements.add(item));
  arr2.forEach(item => uniqueElements.add(item));

  // Convert the Set back to an array
  return Array.from(uniqueElements);
}

/**
 * 
 */
export class UniqueArray<T> {
  protected list: T[]

  constructor (list: T[] = []) {
    this.list = list
  }

  /**
   *
   */
  toJSON () {
    return this.list
  }

  /**
   *
   */
  add (element: T) {
    if (this.list.indexOf(element) === -1) {
      this.list.push(element)
      return true
    }
    return false
  }

  /**
   *
   */
  removeByItem (item: T | number | string | boolean) {
    const index = this.getIndexByItem(item)

    if (index !== -1) {
      this.list.splice(index, 1)
      return true
    }

    return false
  }

  /**
   *
   */
  removeById (id: number) {
    const index = this.getIndexByItem(id)

    if (index !== -1) {
      this.list.splice(index, 1)
      return true
    }

    return false
  }

  /**
   *
   */
  getIndexByItem (itemValue: T | number | string | boolean) {
    return this.list.findIndex(item => item === itemValue)
  }

  /**
   *
   */
  clear () {
    this.list = []
  }
}