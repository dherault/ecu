import { useCallback, useContext, useEffect, useState } from 'react'
import { UseQueryArgs, useQuery as externalUseQuery } from 'urql'

import SnackbarContext from '../contexts/SnackBarContext'

function useQuery<T>(args: UseQueryArgs) {
  const { snackBarItems, appendSnackBarItem } = useContext(SnackbarContext)
  const [id, setId] = useState(Math.random())
  const [retval0, retval1] = externalUseQuery<T>(args)

  useEffect(() => {
    const { error } = retval0

    if (!error) return
    if (snackBarItems.some(x => x.id === id)) return

    appendSnackBarItem({
      id,
      content: error.message,
      severity: 'error',
    })
  }, [retval0, id, snackBarItems, appendSnackBarItem])

  const handleRefetch = useCallback((args: any) => {
    setId(Date.now())

    return retval1(args)
  }, [retval1])

  return [retval0, handleRefetch]
}

export default useQuery
