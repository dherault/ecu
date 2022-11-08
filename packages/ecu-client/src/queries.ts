type FunctionNodeType = {
  address: string
  payload: {
    name: string
    path: string
    relativePath: string
  }
}

type FileNodeType = {
  address: string
}

export const HierarchyQuery = `
  query ($sourceComponentAddress: String!) {
    hierarchy (sourceComponentAddress: $sourceComponentAddress)
  }
`

export type HierarchyQueryDataType = {
  hierarchy: string
}

export const ComponentsQuery = `
  query {
    components {
      address
      payload {
        name
        path
        relativePath
      }
    }
  }
`

export type ComponentsQueryDataType = {
  components: FunctionNodeType[]
}

export const ComponentQuery = `
query ($sourceComponentAddress: String!){
  component (sourceComponentAddress: $sourceComponentAddress) {
    address
    payload {
      name
      path
      relativePath
    }
  }
}
`

export type ComponentQueryDataType = {
  component: FunctionNodeType
}

export const GlobalTypesQuery = `
  query {
    globalTypes {
      globalTypesFileContent
    }
  }
`

export type GlobalTypesQueryDataType = {
  globalTypes: {
    globalTypesFileContent: string
  }
}

export const CreateComponentMutation = `
  mutation ($name: String!) {
    createComponent (name: $name) {
      address
    }
  }
`

export type CreateComponentMutationDataType = {
  createComponent: FileNodeType
}

export const AddComponentMutation = `
  mutation ($sourceComponentAddress: String!, $targetComponentAddress: String!, $hierarchyIds: [String!]!, $hierarchyPosition: HierarchyPosition!, $componentDelta: Int!) {
    addComponent (sourceComponentAddress: $sourceComponentAddress, targetComponentAddress: $targetComponentAddress, hierarchyIds: $hierarchyIds, hierarchyPosition: $hierarchyPosition, componentDelta: $componentDelta) {
      address
    }
  }
`

export type AddComponentMutationDataType = {
  addComponent: FileNodeType
}

export const DeleteComponentMutation = `
  mutation ($sourceComponentAddress: String!, $hierarchyIds: [String!]!, $componentDelta: Int!) {
    deleteComponent (sourceComponentAddress: $sourceComponentAddress, hierarchyIds: $hierarchyIds, componentDelta: $componentDelta) {
      address
    }
  }
`

export type DeleteComponentMutationDataType = {
  deleteComponent: FileNodeType
}

export const MoveComponentMutation = `
  mutation ($sourceComponentAddress: String!, $sourceHierarchyIds: [String!]!, $targetHierarchyIds: [String!]!, $hierarchyPosition: HierarchyPosition!) {
    moveComponent (sourceComponentAddress: $sourceComponentAddress, sourceHierarchyIds: $sourceHierarchyIds, targetHierarchyIds: $targetHierarchyIds, hierarchyPosition: $hierarchyPosition) {
      address
    }
  }
`

export type MoveComponentMutationDataType = {
  moveComponent: FileNodeType
}

export const WriteGlobalTypesMutation = `
  mutation ($globalTypesFileContent: String!) {
    writeGlobalTypes (globalTypesFileContent: $globalTypesFileContent)
  }
`

export type WriteGlobalTypesMutationDataType = {
  writeGlobalTypes: boolean
}
