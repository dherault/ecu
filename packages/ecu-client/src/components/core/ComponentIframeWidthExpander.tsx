import { MouseEvent, ReactNode, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Div } from 'honorable'

import { zIndexes } from '../../constants'

import BreakpointContext from '../../contexts/BreakpointContext'

import useClearHierarchyIdsAndComponentDeltaOnClick from '../../hooks/useClearHierarchyIdsAndComponentDeltaOnClick'

type ComponentIframeWidthExanderPropsType = {
  children: ReactNode
}

function ComponentIframeWidthExpander({ children }: ComponentIframeWidthExanderPropsType) {
  const rootRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useClearHierarchyIdsAndComponentDeltaOnClick(leftRef)
  useClearHierarchyIdsAndComponentDeltaOnClick(rightRef)
  useClearHierarchyIdsAndComponentDeltaOnClick(contentRef)

  const { width } = useContext(BreakpointContext)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const maxWidth = useMemo(() => rootRef.current?.getBoundingClientRect().width ?? Infinity, [rootRef.current])

  return (
    <Div
      ref={rootRef}
      xflex="x4s"
      flexGrow
      flexShrink={1}
    >
      <Div
        ref={leftRef}
        flexGrow
      />
      <ComponentIframeWidthExanderHandle
        isLeft
        maxWidth={maxWidth}
      />
      <Div
        ref={contentRef}
        xflex="y2s"
        width={width}
        overflowY="auto"
        flexShrink={0}
      >
        {children}
      </Div>
      <ComponentIframeWidthExanderHandle
        maxWidth={maxWidth}
      />
      <Div
        ref={rightRef}
        flexGrow
      />
    </Div>
  )
}

type ComponentIframeWidthExanderHandlePropsType = {
  isLeft?: boolean
  maxWidth: number
}

function ComponentIframeWidthExanderHandle({ isLeft, maxWidth }: ComponentIframeWidthExanderHandlePropsType) {
  const [isDraggingCurrent, setIsDraggingCurrent] = useState(false)

  const { breakpoint, setWidth, isDragging, setIsDragging } = useContext(BreakpointContext)

  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
    setIsDraggingCurrent(true)
  }, [setIsDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsDraggingCurrent(false)
  }, [setIsDragging])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!(isDragging && isDraggingCurrent && breakpoint)) return

    setWidth(width => Math.max(breakpoint.min, Math.min(maxWidth, breakpoint.max, width + (isLeft ? -2 : 2) * event.movementX)))
  }, [
    isDragging,
    isDraggingCurrent,
    breakpoint,
    setWidth,
    maxWidth,
    isLeft,
  ])

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseUp])

  return (
    <>
      <Div
        position="relative"
        width={5}
        backgroundColor={isDragging ? 'primary' : undefined}
        userSelect="none"
        cursor="col-resize"
        _hover={{ backgroundColor: 'primary' }}
        onMouseDown={handleMouseDown}
      />
      {isDragging && isDraggingCurrent && (
        <Div
          position="fixed"
          left={0}
          right={0}
          top={0}
          bottom={0}
          onMouseMove={handleMouseMove}
          zIndex={zIndexes.componentIframeWidthExpanderHandle}
          cursor="col-resize"
        />
      )}
    </>
  )
}

export default memo(ComponentIframeWidthExpander)