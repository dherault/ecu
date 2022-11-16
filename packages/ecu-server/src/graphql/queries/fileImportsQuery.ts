import { importsEndComment, importsStartComment } from '../../configuration.js'
import { FileNodeType } from '../../types.js'

import { getNodeByAddress } from '../../graph/index.js'
import traverseImports from '../../domain/imports/traverseImports.js'
import extractBetweenComments from '../../domain/comments/extractBetweenComments.js'

type FileImportsQueryArgs = {
  sourceFileAddress: string
}

function fileImportsQuery(_: any, { sourceFileAddress }: FileImportsQueryArgs) {
  console.log('__fileImportsQuery__')

  const fileNode = getNodeByAddress<FileNodeType>(sourceFileAddress)

  if (!fileNode) {
    throw new Error(`File with address ${sourceFileAddress} not found`)
  }

  return {
    imports: traverseImports(fileNode),
    rawImports: extractBetweenComments(fileNode, importsStartComment, importsEndComment),
  }
}

export default fileImportsQuery
