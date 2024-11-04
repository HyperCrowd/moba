// Module Typing

type Coordinate = [number, number]
type Segment = Coordinate[]
type Area = Segment[]
type MapStructure = Area[]

// Module Definition

import { fetchJSON } from '../utils/files'

export const loadMask = async (url: string) => {
  const json = await fetchJSON(url) as MapStructure
  return json
}
