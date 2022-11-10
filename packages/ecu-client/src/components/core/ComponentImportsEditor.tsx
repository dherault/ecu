import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from 'urql'
import { Button, Div, Input } from 'honorable'

import { FileImportsQuery, FileImportsQueryDataType, WriteFileImportsMutation, WriteFileImportsMutationDataType } from '../../queries'

function ComponentImportsEditor() {
  const { fileAddress = '' } = useParams()
  const [rawImports, setRawImports] = useState('')

  const [fileImportsQueryResult] = useQuery<FileImportsQueryDataType>({
    query: FileImportsQuery,
    variables: {
      sourceFileAddress: fileAddress,
    },
  })
  const [, writeFileImports] = useMutation<WriteFileImportsMutationDataType>(WriteFileImportsMutation)

  const handleSave = useCallback(() => {
    writeFileImports({
      sourceFileAddress: fileAddress,
      rawImports,
    })
  }, [writeFileImports, fileAddress, rawImports])

  useEffect(() => {
    if (!fileImportsQueryResult.data?.fileImports) {
      return
    }

    setRawImports(fileImportsQueryResult.data?.fileImports.rawImports)
  }, [fileImportsQueryResult.data])

  console.log('fileImportsQueryResult.data', fileImportsQueryResult.data)

  return (
    <Div>
      <Input
        multiline
        minRows={3}
        width="100%"
        value={rawImports}
        onChange={event => setRawImports(event.target.value)}
      />
      <Button onClick={handleSave}>Save</Button>
    </Div>
  )
}

export default ComponentImportsEditor