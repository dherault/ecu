import { FunctionDeclaration } from '@babel/types'
import traverse, { NodePath } from '@babel/traverse'

import { ComponentType, FileType } from '../../types'

import { UpdateHierarchyAstResolverType, updateHierarchyAst } from './updateHierarchyTree'
import { getFileAst, regenerateFile } from './helpers'

function removeComponentFromHierarchy(
  file: FileType,
  sourceComponent: ComponentType,
  index: string,
) {
  const fileAst = getFileAst(file)

  let sourceComponentFunctionAstPath: NodePath<FunctionDeclaration>

  traverse(
    fileAst,
    {
      // ImportDeclaration(path) {

      // },
      FunctionDeclaration(path) {
        if (path.node.id.name === sourceComponent.name) {
          sourceComponentFunctionAstPath = path

          path.stop()
        }
      },
    }
  )

  if (!sourceComponentFunctionAstPath) {
    throw new Error(`${sourceComponent.name} not found in ${file.name}`)
  }

  let returnStatementAstPath

  traverse(
    sourceComponentFunctionAstPath.node,
    {
      ReturnStatement(path) {
        returnStatementAstPath = path

        // TODO pick the correct return statement
        path.stop()
      },
    },
    sourceComponentFunctionAstPath.scope,
    sourceComponentFunctionAstPath
  )

  if (!returnStatementAstPath) {
    throw new Error(`${sourceComponent.name} in ${file.name} has no return statement`)
  }

  const resolver: UpdateHierarchyAstResolverType = path => {
    path.remove()
  }

  updateHierarchyAst(returnStatementAstPath, resolver, index)

  regenerateFile(fileAst.program, file)
}

export default removeComponentFromHierarchy
