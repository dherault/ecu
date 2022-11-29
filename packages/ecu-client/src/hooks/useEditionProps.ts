import '../css/edition.css'

import { Ref, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useDebounce } from 'honorable'

import HierarchyContext from '../contexts/HierarchyContext'
import EditionContext from '../contexts/EditionContext'
import DragAndDropContext from '../contexts/DragAndDropContext'
import ContextualInformationContext from '../contexts/ContextualInformationContext'
import CssClassesContext from '../contexts/CssClassesContext'

import getComponentRootHierarchyIds from '../utils/getComponentRootHierarchyIds'

// import convertUnicode from '../utils/convertUnicode'

import useForkedRef from './useForkedRef'
import useHierarchyId from './useHierarchyId'
import useEditionOverlay from './useEditionOverlay'

type DragObject = {
  hierarchyId: string
}

type DropResult = {
  hierarchyId: string
  dropElement: HTMLElement | null
}

type DragCollectedProp = {
  isDragging: boolean
}

type DropCollectedProps = {
  canDrop: boolean
  isOverCurrent: boolean
}

function getHierarchyIds(element: EventTarget | HTMLElement) {
  const hierarchyIds = []

  let currentElement = element as HTMLElement | null

  while (currentElement) {
    const id = currentElement.getAttribute('data-ecu-hierarchy')

    if (!id) break

    hierarchyIds.push(id)

    currentElement = currentElement.parentElement
  }

  return hierarchyIds.reverse()
}

// Return common edition props for lib components
function useEditionProps<T extends HTMLElement>(ecuId: string, className = '', canBeEdited = false) {
  const rootRef = useRef<T>(null)

  const hierarchyId = useHierarchyId(ecuId, rootRef)
  const { hierarchyId: editionHierarchyId, componentDelta, isEdited, setIsEdited } = useContext(EditionContext)
  const { hierarchy } = useContext(HierarchyContext)
  const { dragAndDrop, setDragAndDrop } = useContext(DragAndDropContext)
  const { setContextualInformationState } = useContext(ContextualInformationContext)
  const { className: updatedClassName, setClassName, style: updatedStyle } = useContext(CssClassesContext)

  useEditionOverlay(rootRef, hierarchyId)

  const isSelected = useMemo(() => hierarchyId === editionHierarchyId, [hierarchyId, editionHierarchyId])
  const debouncedIsSelected = useDebounce(isSelected, 3 * 16) // 3 frames at 60fps to wait for componentDelta to adjust if positive
  const componentRootHierarchyIds = useMemo(() => getComponentRootHierarchyIds(hierarchy), [hierarchy])
  const isComponentRoot = useMemo(() => componentDelta < 0 && componentRootHierarchyIds.some(x => x === hierarchyId), [componentDelta, componentRootHierarchyIds, hierarchyId])
  const isComponentRootFirstChild = useMemo(() => componentRootHierarchyIds.indexOf(hierarchyId) === 0, [componentRootHierarchyIds, hierarchyId])
  const isComponentRootLastChild = useMemo(() => componentRootHierarchyIds.indexOf(hierarchyId) === componentRootHierarchyIds.length - 1, [componentRootHierarchyIds, hierarchyId])
  const isDrop = useMemo(() => hierarchyId && dragAndDrop.targetHierarchyId === hierarchyId, [dragAndDrop.targetHierarchyId, hierarchyId])

  const [{ isDragging }, drag] = useDrag<DragObject, DropResult, DragCollectedProp>(() => ({
    type: 'Node',
    item: () => {
      setDragAndDrop({
        sourceHierarchyId: '',
        targetHierarchyId: '',
        sourceComponentDelta: 0,
        targetComponentDelta: 0,
      })
      setContextualInformationState(x => ({ ...x, dropElement: null }))

      return { hierarchyId }
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<DropResult>()

      if (item && dropResult && dropResult.hierarchyId !== hierarchyId) {
        setDragAndDrop({
          sourceHierarchyId: item.hierarchyId,
          targetHierarchyId: dropResult.hierarchyId,
          sourceComponentDelta: componentDelta,
          targetComponentDelta: 0,
        })
        setContextualInformationState(x => ({ ...x, dropElement: dropResult.dropElement }))
      }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
    canDrag: (debouncedIsSelected || isComponentRoot) && !isEdited,
  }), [
    hierarchyId,
    componentDelta,
    debouncedIsSelected,
    isComponentRoot,
    isEdited,
    setDragAndDrop,
    setContextualInformationState,
  ])

  const [{ canDrop, isOverCurrent }, drop] = useDrop<DragObject, DropResult, DropCollectedProps>(() => ({
    accept: 'Node',
    drop: (_item, monitor) => {
      if (monitor.didDrop()) return

      const dropHierarchyIds = getHierarchyIds(rootRef.current as HTMLElement)

      return {
        hierarchyId: dropHierarchyIds[dropHierarchyIds.length - 1],
        dropElement: rootRef.current,
      }
    },
    collect: monitor => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
    canDrop: () => !isEdited,
  }), [isEdited])

  const ref = useForkedRef(rootRef, useForkedRef(drag, drop)) as Ref<T>

  const generateClassName = useCallback(() => {
    // let klassName = `ecu-edition-no-outline ${convertUnicode(debouncedIsSelected ? updatedClassName || className : className)}`
    let klassName = `ecu-edition-no-outline ${debouncedIsSelected ? updatedClassName || className : className}`

    klassName = klassName.trim()

    if (canBeEdited) {
      klassName += ' ecu-can-be-edited'
    }

    if (isComponentRoot) {
      klassName += ' ecu-selected-root'

      if (isComponentRootFirstChild) {
        klassName += ' ecu-selected-root-first'
      }

      if (isComponentRootLastChild) {
        klassName += ' ecu-selected-root-last'
      }
    }

    if (debouncedIsSelected) {
      klassName += ' ecu-selected'
    }

    if (isDragging) {
      klassName += ' ecu-drag'
    }

    if (canDrop && isOverCurrent || isDrop) {
      klassName += ' ecu-drop'
    }

    if (isSelected && isEdited) {
      klassName += ' ecu-edited'
    }

    return klassName.trim()
  }, [
    canBeEdited,
    className,
    updatedClassName,
    canDrop,
    debouncedIsSelected,
    isSelected,
    isEdited,
    isComponentRoot,
    isComponentRootFirstChild,
    isComponentRootLastChild,
    isDragging,
    isOverCurrent,
    isDrop,
  ])

  useEffect(() => {
    if (!rootRef.current) return

    if (debouncedIsSelected || (isComponentRoot && isComponentRootFirstChild)) {
      setContextualInformationState(x => ({ ...x, isEdited, isComponentRoot: isComponentRootFirstChild, element: rootRef.current }))
    }
  }, [
    debouncedIsSelected,
    isComponentRoot,
    isComponentRootFirstChild,
    isEdited,
    setContextualInformationState,
  ])

  useEffect(() => {
    if (!debouncedIsSelected || isComponentRoot) return

    setClassName(className)
  }, [debouncedIsSelected, isComponentRoot, setClassName, className])

  return {
    rootRef,
    ref,
    hierarchyId,
    isSelected: debouncedIsSelected,
    isEdited: isSelected && isEdited,
    setIsEdited,
    editionProps: {
      className: generateClassName(),
      style: isSelected ? updatedStyle : {},
      'data-ecu': ecuId,
      'data-ecu-hierarchy': hierarchyId,
    },
  }
}

export default useEditionProps
