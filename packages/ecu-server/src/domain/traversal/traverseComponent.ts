import path from 'path'

import {
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
  JSXAttribute,
} from '@babel/types'
import traverse from '@babel/traverse'

import { FileNodeType, FunctionNodeType, ImpactedType, ImportDeclarationsRegistry, IndexRegistryType } from '../../types'
import { ecuPropName } from '../../configuration'

import { getNodesByFirstNeighbourg, getNodesByRole, getNodesBySecondNeighbourg } from '../../graph'

import areArraysEqual from '../../utils/areArraysEqual'
import areArraysEqualAtStart from '../../utils/areArraysEqualAtStart'
import possiblyAddExtension from '../../utils/possiblyAddExtension'

import createHierarchyId from '../utils/createHierarchyId'
import extractIdAndIndex from '../utils/extractIdAndIndex'
import extractIdsAndIndexes from '../utils/extractIdsAndIndexes'

type TraverseComponentEventsType = {
  onTraverseFile?: (fileNodes: FileNodeType[], indexRegistriesHash: string, componentRootIndexes: number[]) => () => void
  onBeforeHierarchyPush?: (paths: any[], fileNodes: FileNodeType[], indexRegistriesHash: string, componentRootIndexes: number[], componentIndex: number, hierarchyId: string) => void
  onHierarchyPush?: (paths: any[], fileNodes: FileNodeType[], indexRegistriesHash: string, componentRootIndexes: number[], componentIndex: number, hierarchyId: string) => void
  onSuccess?: (paths: any[], fileNodes: FileNodeType[], indexRegistriesHash: string, componentRootIndexes: number[], componentIndex: number) => void
}

function traverseComponent(componentAddress: string, hierarchyIds: string[], events: TraverseComponentEventsType = {}): ImpactedType[] {
  console.log('traverseComponent', componentAddress, hierarchyIds)

  const fileNode = getNodesBySecondNeighbourg<FileNodeType>(componentAddress, 'DeclaresFunction')[0]

  if (!fileNode) {
    console.log(`No file node found for component ${componentAddress}`)

    return []
  }

  const {
    onTraverseFile = () => () => {},
    onBeforeHierarchyPush = () => {},
    onHierarchyPush = () => {},
    onSuccess = () => {},
  } = events

  const impacted: ImpactedType[] = [] // retval
  const componentNodes = getNodesByRole<FunctionNodeType>('Function').filter(n => n.payload.isComponent)
  const allFileNodes = getNodesByRole<FileNodeType>('File')
  const [, indexes] = extractIdsAndIndexes(hierarchyIds)
  const lastingHierarchyIds: string[] = []
  const lastingIndexRegistry: IndexRegistryType = {}
  const importDeclarationsRegistry: ImportDeclarationsRegistry = {}

  // console.log('ids', ids)
  // console.log('indexes', indexes)

  function isSuccessiveNodeFound(nextHierarchyId: string) {
    const nextHierarchyIds = [...lastingHierarchyIds, nextHierarchyId]
    const [nextLimitedHierarchyId] = extractIdAndIndex(nextHierarchyId)

    return areArraysEqualAtStart(nextHierarchyIds, hierarchyIds) && lastingIndexRegistry[nextLimitedHierarchyId] === indexes[nextHierarchyIds.length - 1]
  }

  function isFinalNodeFound() {
    const lastingHierarchyIdsIndexes = lastingHierarchyIds.map(hierarchyId => extractIdAndIndex(hierarchyId)[1])

    return areArraysEqual(lastingHierarchyIds, hierarchyIds) && areArraysEqual(lastingHierarchyIdsIndexes, indexes)
  }

  function traverseFileNodesToFindImportDeclarations(fileNode: FileNodeType) {
    traverse(fileNode.payload.ast, {
      // Build the importDeclarationsRegistry for the file
      ImportDeclaration(x: any) {
        if (!importDeclarationsRegistry[fileNode.address]) {
          importDeclarationsRegistry[fileNode.address] = []
        }

        importDeclarationsRegistry[fileNode.address].push({
          value: x.node.source.value,
          specifiers: x.node.specifiers.map((x: ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier) => x.local.name),
        })
      },
    })

    const importedFileNodes = getNodesByFirstNeighbourg<FileNodeType>(fileNode.address, 'ImportsFile')

    importedFileNodes.forEach(fileNode => {
      if (importDeclarationsRegistry[fileNode.address]) return

      traverseFileNodesToFindImportDeclarations(fileNode)
    })
  }

  function traverseFileNode(fileNodes: FileNodeType[], previousPaths: any[] = [], indexRegistriesHash = '', componentRootIndexes: number[] = [0], stop = () => {}) {
    const fileNode = fileNodes[fileNodes.length - 1]

    console.log('-> traverseFileNode', fileNode.payload.name, componentRootIndexes)

    const onContinue = onTraverseFile(fileNodes, indexRegistriesHash, componentRootIndexes)

    const { ast } = fileNode.payload
    const indexRegistries: IndexRegistryType[] = [{}]
    let shouldContinue = true
    let shouldPushIndex = true

    if (!impacted.some(x => x.fileNode.address === fileNode.address)) {
      impacted.push({ fileNode, ast, importDeclarationsRegistry })
    }

    function createTraverser(currentFileNodes: FileNodeType[]) {
      const currentFileNode = currentFileNodes[currentFileNodes.length - 1]
      const importDeclarations = importDeclarationsRegistry[currentFileNode.address] || []

      return {
        JSXElement(x: any) {
          console.log('--> JSXElement', x.node.openingElement.name.name)

          const currentXs = [...previousPaths, x]
          const idIndex = x.node.openingElement.attributes.findIndex((x: JSXAttribute) => x.name.name === ecuPropName)

          // hierarchyId found means we're at an ecu-client Component
          if (idIndex !== -1) {
            const limitedHierarchyId = x.node.openingElement.attributes[idIndex].value.value

            if (limitedHierarchyId) {
              const [componentAddress] = extractIdAndIndex(limitedHierarchyId)
              const componentIndex = indexRegistries[indexRegistries.length - 1][componentAddress] = indexRegistries[indexRegistries.length - 1][componentAddress] + 1 || 0

              lastingIndexRegistry[limitedHierarchyId] = lastingIndexRegistry[limitedHierarchyId] + 1 || 0
              shouldPushIndex = true

              console.log('--->', x.node.openingElement.name.name, limitedHierarchyId, lastingIndexRegistry[limitedHierarchyId])

              const hierarchyId = createHierarchyId(limitedHierarchyId, lastingIndexRegistry[limitedHierarchyId])

              onBeforeHierarchyPush(currentXs, currentFileNodes, indexRegistriesHash, componentRootIndexes, componentIndex, hierarchyId)

              if (isSuccessiveNodeFound(hierarchyId)) {
                lastingHierarchyIds.push(hierarchyId)

                console.log('PUSHED')

                onHierarchyPush(currentXs, currentFileNodes, indexRegistriesHash, componentRootIndexes, componentIndex, hierarchyId)

                if (isFinalNodeFound()) {
                  console.log('SUCCESS')

                  shouldContinue = false

                  onSuccess(currentXs, currentFileNodes, indexRegistriesHash, componentRootIndexes, componentIndex)
                  x.stop()
                  stop()
                }
              }
            }
          }
          // No hierarchyId found means we're at an imported Component node
          else if (importDeclarations.length) {
            const componentName = x.node.openingElement.name.name
            const relativeImportDeclaration = importDeclarations.find(x => x.value.startsWith('.') && x.specifiers.includes(componentName))

            if (relativeImportDeclaration) {
              const absolutePath = possiblyAddExtension(path.join(path.dirname(currentFileNode.payload.path), relativeImportDeclaration.value))
              const componentNode = componentNodes.find(n => n.payload.name === componentName && n.payload.path === absolutePath)

              if (componentNode) {
                const nextFileNode = allFileNodes.find(n => n.payload.path === componentNode.payload.path)

                if (nextFileNode) {
                  console.log('--->', nextFileNode.payload.name)

                  const nextComponentRootIndex = indexRegistries[indexRegistries.length - 1][nextFileNode.address] = indexRegistries[indexRegistries.length - 1][nextFileNode.address] + 1 || 0

                  shouldPushIndex = false

                  traverseFileNode(
                    [...currentFileNodes, nextFileNode],
                    currentXs,
                    JSON.stringify(indexRegistries),
                    [...componentRootIndexes, nextComponentRootIndex],
                    () => {
                      shouldContinue = false

                      x.stop()
                      stop()
                    },
                  )

                  if (!(x.shouldStop || x.removed)) {
                    console.log('SKIPPING')

                    x.skip()
                  }
                }
              }
            }
          }

          console.log('x.removed', x.removed)

          if (!(x.shouldStop || x.removed) && !x.node.selfClosing && shouldPushIndex) {
            indexRegistries.push({})
          }
        },
        JSXClosingElement() {
          // Prevent fragments from interering with indexing
          if (indexRegistries.length > 1) {
            indexRegistries.pop()
          }
        },
        JSXExpressionContainer(x: any) {
          if (!(x.node.expression.type === 'Identifier' && x.node.expression.name === 'children')) return

          const previousX = previousPaths[previousPaths.length - 1]
          const previousFileNodes = currentFileNodes.slice()

          previousFileNodes.pop()

          if (!(previousX && previousFileNodes.length)) return

          // If children is found, traverse children with new traverser
          previousX.traverse(createTraverser(previousFileNodes))
        },
      }
    }

    traverse(ast, createTraverser(fileNodes))

    if (shouldContinue) {
      onContinue()
    }
  }

  traverseFileNodesToFindImportDeclarations(fileNode)
  traverseFileNode([fileNode])

  return impacted
}

export default traverseComponent
