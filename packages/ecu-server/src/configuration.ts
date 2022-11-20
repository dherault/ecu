import path from 'node:path'

import { ImportType } from './types.js'

const cwd = process.cwd()

export const appPath = path.join(cwd, 'app')

export const ecuPackageName = 'ecu'

export const ecuPropName = 'data-ecu'

export const ecuRelativePath = '.ecu'

export const ecuScreenshotsRelativePath = 'screenshots'

export const ecuGraphFileName = 'ecu-graph.json'

export const ecuHistoryFileName = 'ecu-history.json'

export const globalTypesFileRelativePath = 'src/types.ts'

export const globalTypesFileBegginingComment = `/* ---
  Please do not delete this file
  as it is needed by the ecu core engine
--- */`

export const importsStartComment = `/* --
  * IMPORTS START
-- */`

export const importsEndComment = `/* --
  * IMPORTS END
-- */`

export const typesStartComment = `/* --
  * TYPES START
-- */`

export const typesEndComment = `/* --
  * TYPES END
-- */`

export const emojiStartComment = `/* --
  * EMOJI START
-- */`

export const emojiEndComment = `/* --
  * EMOJI END
-- */`

export const descriptionStartComment = `/* --
  * DESCRIPTION START
-- */`

export const descriptionEndComment = `/* --
  * DESCRIPTION END
-- */`

export const externalModulesImports: ImportType[] = [
  {
    name: 'PropsWithChildren',
    source: 'react',
    type: 'ImportSpecifier',
  },
  {
    name: 'ReactNode',
    source: 'react',
    type: 'ImportSpecifier',
  },
]

export const ecuAcceptingChildrenComponentNames = [
  'Div',
]

export const ecuCommitPrefix = '[ecu] '
