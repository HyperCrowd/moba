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