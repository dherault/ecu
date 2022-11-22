import { JSXElement, jsxExpressionContainer, jsxText, stringLiteral } from '@babel/types'
import { NodePath } from '@babel/traverse'

import { HistoryMutationReturnType } from '../../types.js'

import { getNodeByAddress } from '../../graph/index.js'

import composeHistoryMutation from '../../history/composeHistoryMutation.js'

import traverseComponent from '../../domain/components/traverseComponent.js'
import processImpactedFileNodes from '../../domain/processImpactedFileNodes.js'

type UpdateTextValueMutationArgsType = {
  sourceComponentAddress: string
  targetHierarchyId: string
  value: string
}

async function updateTextValueMutation(_: any, { sourceComponentAddress, targetHierarchyId, value }: UpdateTextValueMutationArgsType): Promise<HistoryMutationReturnType<boolean>> {
  console.log('__updateTextValueMutation__')

  const sourceComponentNode = getNodeByAddress(sourceComponentAddress)

  if (!sourceComponentNode) {
    throw new Error(`Component with id ${sourceComponentAddress} not found`)
  }

  function onSuccess(paths: NodePath<JSXElement>[]) {
    const finalPath = paths[paths.length - 1]

    const child = value.includes('\n') ? jsxExpressionContainer(stringLiteral(value)) : jsxText(value)

    finalPath.node.children = [child]
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
