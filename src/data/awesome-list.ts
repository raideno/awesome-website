// @ts-ignore: allow custom accentColor value
import list_ from 'virtual:awesome-list'

import type { AwesomeList } from '@/data/awesome-list-schema'

export function getList(): AwesomeList {
  return list_ as AwesomeList
}

export function getAllTags(list: AwesomeList): Array<string> {
  const allTags = list.elements.flatMap((element) => element.tags)
  return [...new Set(allTags)].sort()
}
