import { HierarchyPosition } from './types'

export const hierarchyPositions: HierarchyPosition[] = [
  'before',
  'after',
  'children',
  'parent',
]

export const refetchKeys = {
  all: 'all',
  hierarchy: 'hierarchy',
  component: 'component',
  components: 'components',
  isComponentAcceptingChildren: 'isComponentAcceptingChildren',
  fileImports: 'fileImports',
  fileTypes: 'fileTypes',
  canRedo: 'canRedo',
}
