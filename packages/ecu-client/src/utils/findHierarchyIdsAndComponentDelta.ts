import { HierarchyItemType } from '../types'

type HierarchyIdsAndComponentDeltaType = {
  hierarchyIds: string[]
  componentDelta: number
}

function findHierarchyIdsAndComponentDelta(rootHierarchyItem: HierarchyItemType | null, targetHierarchyItem: HierarchyItemType | null, hierarchyIds: string[] = [], componentDelta = 0, hasFound = false, depth = 0, hasFoundDepth = 0): HierarchyIdsAndComponentDeltaType | null {
  if (!(rootHierarchyItem && targetHierarchyItem)) return null

  let nextHasFound = hasFound
  const nextHierarchyIds = [...hierarchyIds]
  const nextComponentDelta = !nextHasFound && (rootHierarchyItem.isRoot || rootHierarchyItem.hierarchyId) ? 0 : componentDelta - 1

  if (rootHierarchyItem.hierarchyId) nextHierarchyIds.push(rootHierarchyItem.hierarchyId)

  if (nextHasFound && rootHierarchyItem.hierarchyId) {
    return {
      hierarchyIds: nextHierarchyIds,
      componentDelta: nextComponentDelta - hasFoundDepth + depth,
    }
  }

  if (rootHierarchyItem.id === targetHierarchyItem.id) {
    if (rootHierarchyItem.hierarchyId) {
      return {
        hierarchyIds: nextHierarchyIds,
        componentDelta: nextComponentDelta,
      }
    }

    nextHasFound = true
  }

  for (const child of (rootHierarchyItem.children || [])) {
    const found = findHierarchyIdsAndComponentDelta(child, targetHierarchyItem, nextHierarchyIds, nextComponentDelta, nextHasFound, depth + 1, nextHasFound ? hasFoundDepth + 1 : 0)

    if (found) return found
  }

  return null
}

export default findHierarchyIdsAndComponentDelta
