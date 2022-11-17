import { jsxText } from '@babel/types'

import { HistoryMutationReturnType } from '../../types.js'

import { getNodeByAddress } from '../../graph/index.js'

import composeHistoryMutation from '../../history/composeHistoryMutation.js'

import traverseComponent from '../../domain/components/traverseComponent.js'
import processImpactedFileNodes from '../../domain/processImpactedFileNodes.js'

type UpdateTextValueMutationArgs = {
  sourceComponentAddress: string
  targetHierarchyId: string
  value: string
}

async function updateTextValueMutation(_: any, { sourceComponentAddress, targetHierarchyId, value }: UpdateTextValueMutationArgs): Promise<HistoryMutationReturnType<boolean>> {
  console.log('___updateTextValueMutation___')

  const sourceComponentNode = getNodeByAddress(sourceComponentAddress)

  if (!sourceComponentNode) {
    throw new Error(`Component with id ${sourceComponentAddress} not found`)
  }

  function onSuccess(paths: any[]) {
    const finalPath = paths[paths.length - 1]

    finalPath.node.children = [jsxText(value)]
  }

  try {
    const { impacted } = traverseComponent(sourceComponentAddress, targetHierarchyId, onSuccess)

    await processImpactedFileNodes(impacted)

    return {
      returnValue: true,
      description: `Edit text on component ${sourceComponentNode.payload.name}`,
    }
  }
  catch (error) {
    console.log(error)

    throw new Error('Traversal error')
  }
}

export default composeHistoryMutation(updateTextValueMutation)