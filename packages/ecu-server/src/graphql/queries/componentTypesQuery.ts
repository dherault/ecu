import { typesEndComment, typesStartComment } from '../../configuration'
import { FileNodeType, FunctionNodeType } from '../../types'

import { getNodeByAddress, getNodesBySecondNeighbourg } from '../../graph'
import traverseTypes from '../../domain/traversal/traverseTypes'
import extractBetweenComments from '../../domain/comments/extractBetweenComments'

type ComponentTypesQueryArgs = {
  sourceComponentAddress: string
}

function componentTypesQuery(_: any, { sourceComponentAddress }: ComponentTypesQueryArgs) {
  console.log('__componentTypesQuery__')

  const componentNode = getNodeByAddress<FunctionNodeType>(sourceComponentAddress)

  if (!componentNode) {
    throw new Error(`Component with address ${sourceComponentAddress} not found`)
  }

  const fileNode = getNodesBySecondNeighbourg<FileNodeType>(componentNode.address, 'DeclaresFunction')[0]

  if (!fileNode) {
    throw new Error(`File node for component with address ${sourceComponentAddress} not found`)
  }

  const { types } = traverseTypes(fileNode)

  console.log('types', types)

  return {
    rawTypes: extractBetweenComments(fileNode, typesStartComment, typesEndComment),
    types,
  }
}

export default componentTypesQuery
