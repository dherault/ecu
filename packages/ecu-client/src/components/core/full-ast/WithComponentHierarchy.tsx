import { ReactNode, useCallback, useContext, useEffect, useRef } from 'react'

import { createHierarchy } from '~processors/typescript'

import useCurrentComponentPath from '~hooks/useCurrentComponentPath'
import useThrottleAsynchronous from '~hooks/useThrottleAsynchronous'
import usePreviousWithDefault from '~hooks/usePreviousWithDefault'

type WithComponentHierarchyPropsType = {
  children: ReactNode
}

function WithComponentHierarchy({ children }: WithComponentHierarchyPropsType) {
  const rootRef = useRef<HTMLDivElement>(null)
  const path = useCurrentComponentPath()
  const previousPath = usePreviousWithDefault(path, path)

  const computeHierarchy = useCallback((componentElement: HTMLElement | null) => {
    if (!componentElement) return

    const componentElements: HTMLElement[] = []

    for (const child of componentElement.childNodes) {
      componentElements.push(child as HTMLElement)
    }

    const hierarchy = createHierarchy(path, componentElements)

    console.log('hierarchy', hierarchy)
  }, [path])

  const throttledComputeHierarchies = useThrottleAsynchronous(computeHierarchy, 500, true)

  useEffect(() => {
    if (!rootRef.current) return

    const observer = new MutationObserver(() => throttledComputeHierarchies(rootRef.current))

    observer.observe(rootRef.current, {
      attributes: true,
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
    }
  // Will be triggered twice on mount but throttledComputeHierarchies will be called only once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRef.current, throttledComputeHierarchies])

  useEffect(() => {
    if (!rootRef.current || path === previousPath) return

    computeHierarchy(rootRef.current)
  }, [path, previousPath, computeHierarchy])

  return (
    <div ref={rootRef}>
      {children}
    </div>
  )
}

export default WithComponentHierarchy
