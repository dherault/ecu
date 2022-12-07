import { MouseEvent, memo, useCallback, useEffect, useRef } from 'react'
import { Div } from 'honorable'

import { HierarchyItemType } from '@types'

type EditionOverlayElementPropsType = {
  hierarchyItem: HierarchyItemType
  element: HTMLElement | null
  depth: number
  top: number
  left: number
  width: number
  height: number
  helperText: string
  isSelected: boolean
  isEdited: boolean
  isAnotherEdited: boolean
  isComponentRoot: boolean
  isDisabled: boolean
  isDragging: boolean
  isDrop: boolean
  isDropVertical: boolean
  onSelect: (event: MouseEvent) => void
  onMouseDown: (event: MouseEvent) => void
  onMouseMove: (event: MouseEvent) => void
}

function EditionOverlayElement({
  hierarchyItem,
  element,
  depth,
  top,
  left,
  width,
  height,
  helperText,
  isSelected,
  isEdited,
  isAnotherEdited,
  isComponentRoot,
  isDisabled,
  isDragging,
  isDrop,
  isDropVertical,
  onSelect,
  onMouseDown,
  onMouseMove,
}: EditionOverlayElementPropsType) {
  const rootRef = useRef<HTMLDivElement>(null)

  // Scroll sub element
  // Prevent the page from scrolling if a sub element has scrolled
  const handleWheel = useCallback((event: WheelEvent) => {
    if (!element) return

    const beforeTop = element.scrollTop
    const beforeLeft = element.scrollLeft

    element.scrollTop += event.deltaY
    element.scrollLeft += event.deltaX

    if (beforeTop === element.scrollTop && beforeLeft === element.scrollLeft) return

    event.preventDefault()
  }, [element])

  useEffect(() => {
    if (isDisabled) return

    const { current } = rootRef

    if (!current) return

    current.addEventListener('wheel', handleWheel, { passive: false }) // Passive is needed to prevent default

    return () => {
      current.removeEventListener('wheel', handleWheel)
    }
  }, [isDisabled, handleWheel])

  if (isDisabled && !isSelected) return null

  const color = isDrop ? 'drag-and-drop' : isEdited ? 'is-edited' : isSelected ? isComponentRoot ? 'is-component-root' : 'primary' : null

  return (
    <>
      <Div
        ref={rootRef}
        position="absolute"
        xflex={isDropVertical ? 'y2' : 'x4'}
        top={top - 1}
        left={left - 1}
        width={width + 2}
        height={height + 2}
        zIndex={depth}
        border={color ? `1px solid ${color}` : null}
        _hover={{
          border: isDragging && !isSelected ? null : `1px solid ${isDrop ? 'drag-and-drop' : isEdited ? 'is-edited' : isComponentRoot ? 'is-component-root' : 'primary'}`,
          '& + div': {
            display: isDragging && !isSelected ? 'none' : 'flex',
            '&:hover': {
              display: isSelected ? 'flex' : 'none',
            },
          },
        }}
        pointerEvents={isEdited || isAnotherEdited ? 'none' : 'auto'}
        onClick={onSelect}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
      />
      <Div
        xflex="x4"
        display={isSelected ? 'flex' : 'none'}
        position="absolute"
        top={top - 16 - 1 < 0 ? 0 : top - 16 - 1}
        left={left - 1}
        height={16}
        backgroundColor={color}
        color={isSelected || isEdited ? 'white' : isComponentRoot ? 'is-component-root' : 'primary'}
        fontSize="0.75rem"
        cursor="pointer"
        userSelect="none"
        zIndex={depth}
        gap={0.25}
        px={0.25 * 2 / 3}
      >
        {hierarchyItem.displayName || hierarchyItem.label}
        <Div
          xflex="x4"
          color="darken(white, 20)"
        >
          {helperText}
        </Div>
      </Div>
    </>
  )
}

export default memo(EditionOverlayElement)