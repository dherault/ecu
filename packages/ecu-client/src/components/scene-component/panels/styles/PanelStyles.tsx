import { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { A, Div } from 'honorable'

import { CssAttributeType } from '~types'

import { SaveFileMutation, SaveFileMutationDataType } from '~queries'

import createSelector from '~processors/css/createSelector'
import getClasses from '~processors/css/getClasses'
import updateHierarchyElementAttribute from '~processors/typescript/updateHierarchyElementAttribute'
import updateSelector from '~processors/css/updateSelector'
import deleteSelector from '~processors/css/deleteSelector'

import HierarchyContext from '~contexts/HierarchyContext'
import BreakpointContext from '~contexts/BreakpointContext'
import WarningsContext from '~contexts/WarningsContext'
import StylesContext, { StylesContextType } from '~contexts/StylesContext'

import useAsync from '~hooks/useAsync'
import useMutation from '~hooks/useMutation'
import usePrevious from '~hooks/usePrevious'
import usePersistedState from '~hooks/usePersistedState'
import useThrottleAsynchronous from '~hooks/useThrottleAsynchronous'

import findHierarchy from '~utils/findHierarchy'
import findSimilarHierarchies from '~utils/findSimilarHierarchies'
import filterClassesByClassNamesAndMedias from '~utils/filterClassesByClassNamesAndMedias'
import areAttributesValid from '~utils/areAttributesValid'
import mergeCssAttributes from '~utils/mergeCssAttributes'
import normalizeCssAttributes from '~utils/normalizeCssAttributes'
import getCascadingCssAttributes from '~utils/getCascadingCssAttributes'
import deleteAndConvertCssAttributes from '~utils/deleteAndConvertCssAttributes'
import convertStylesToCssString from '~utils/convertStylesToCssString'

import CssSelector from '~components/scene-component/panels/styles/CssSelector'
import StylesSubSectionPosition from '~components/scene-component/panels/styles/StylesSubSectionPosition'
import StylesSubSectionSize from '~components/scene-component/panels/styles/StylesSubSectionSize'
import StylesSubSectionLayout from '~components/scene-component/panels/styles/StylesSubSectionLayout'
import StylesSubSectionSpacing from '~components/scene-component/panels/styles/StylesSubSectionSpacing'
import StylesSubSectionTypography from '~components/scene-component/panels/styles/StylesSubSectionTypography'

// The styles panel
// Displayed in the right retractable panel
function PanelStyles() {
  const { breakpoint, breakpoints } = useContext(BreakpointContext)
  const { hierarchy, currentHierarchyId } = useContext(HierarchyContext)
  const { warnings, setWarnings } = useContext(WarningsContext)

  const [, saveFile] = useMutation<SaveFileMutationDataType>(SaveFileMutation)

  // Could be a useMemo of currentHierarchy.element.className
  // But for speed we use useState
  const [className, setClassName] = useState('')
  const [selectedClassName, setSelelectedClassName] = usePersistedState('selected-class-name', '')
  const [updatedAttributes, setUpdatedAttributes] = useState<CssAttributeType[]>([])

  // const [isStyleUpdated, setIsStyleUpdated] = useState(false)
  const [classesRefresh, setClassesRefresh] = useState(0)
  const [shouldDisplayCssClassOrderingWarning, setShouldDisplayCssClassOrderingWarning] = useState(false)

  // The medias that can impact the current breakpoint
  const concernedMedias = useMemo(() => {
    const indexOfMasterBreakpoint = breakpoints.findIndex(b => !b.media)
    const indexOfCurrentBreakpoint = breakpoints.findIndex(b => b.id === breakpoint.id)
    // Determines weither the current breakpoint is going upscreen or downscreen from the master breakpoint
    const isGoingUpscreen = indexOfMasterBreakpoint > indexOfCurrentBreakpoint
    const concernedMedias: string[] = []

    let i = indexOfMasterBreakpoint

    while (true) {
      concernedMedias.push(breakpoints[i].media)

      if (i === indexOfCurrentBreakpoint) break

      i += isGoingUpscreen ? -1 : 1

      if (!breakpoints[i]) break
    }

    return concernedMedias
  }, [breakpoints, breakpoint])

  const currentHierarchy = useMemo(() => findHierarchy(hierarchy, currentHierarchyId), [hierarchy, currentHierarchyId])
  const similiarHierarchies = useMemo(() => findSimilarHierarchies(hierarchy, currentHierarchyId), [hierarchy, currentHierarchyId])
  const isNoElementSelected = useMemo(() => currentHierarchy?.type !== 'element', [currentHierarchy])
  const classNames = useMemo(() => className.split(' ').map(c => c.trim()).filter(Boolean), [className])
  // Arrays of CssClasses
  // All classes
  const allClassesOrNull = useAsync(getClasses, [classesRefresh]) // eslint-disable-line react-hooks/exhaustive-deps
  const allClasses = useMemo(() => allClassesOrNull ?? [], [allClassesOrNull])
  // Master breakpoint classes for the full className
  const masterBreakpointClasses = useMemo(() => filterClassesByClassNamesAndMedias(allClasses, classNames, ['']), [allClasses, classNames])
  // Master breakpoint classes for the selected className
  const selectedMasterBreakpointClasses = useMemo(() => filterClassesByClassNamesAndMedias(masterBreakpointClasses, [selectedClassName], ['']), [masterBreakpointClasses, selectedClassName])
  // Current breakpoints classes for the full className
  const breakpointClasses = useMemo(() => filterClassesByClassNamesAndMedias(allClasses, classNames, concernedMedias), [allClasses, classNames, concernedMedias])
  // Current breakpoints classes for the selected className
  const selectedBreakpointClasses = useMemo(() => filterClassesByClassNamesAndMedias(allClasses, [selectedClassName], concernedMedias), [allClasses, selectedClassName, concernedMedias])
  // Current breakpoint classes for the full className
  const currentBreakpointClasses = useMemo(() => filterClassesByClassNamesAndMedias(allClasses, classNames, [breakpoint.media]), [allClasses, classNames, breakpoint.media])
  // Current breakpoint classes for the selected className
  const selectedCurrentBreakpointClasses = useMemo(() => filterClassesByClassNamesAndMedias(allClasses, [selectedClassName], [breakpoint.media]), [allClasses, selectedClassName, breakpoint.media])

  // The attributes for the complete styling
  // Displayed when no class is selected
  const fullAttributes = useMemo(() => normalizeCssAttributes(getCascadingCssAttributes(masterBreakpointClasses)), [masterBreakpointClasses])
  const fullBreakpointAttributes = useMemo(() => normalizeCssAttributes(getCascadingCssAttributes(breakpointClasses)), [breakpointClasses])
  const fullCurrentBreakpointAttributes = useMemo(() => normalizeCssAttributes(getCascadingCssAttributes(currentBreakpointClasses)), [currentBreakpointClasses]) // Might be unused

  // The attributes for the selected class
  // Displayed when a class is selected
  // TODO investigate why the tertiary operator on media and create comment about it
  const selectedAttributes = useMemo(() => normalizeCssAttributes(deleteAndConvertCssAttributes(mergeCssAttributes(getCascadingCssAttributes(selectedMasterBreakpointClasses), breakpoint.media ? [] : updatedAttributes))), [selectedMasterBreakpointClasses, breakpoint, updatedAttributes])
  const selectedBreakpointAttributes = useMemo(() => normalizeCssAttributes(deleteAndConvertCssAttributes(mergeCssAttributes(getCascadingCssAttributes(selectedBreakpointClasses), updatedAttributes))), [selectedBreakpointClasses, updatedAttributes])
  const selectedCurrentBreakpointAttributes = useMemo(() => normalizeCssAttributes(deleteAndConvertCssAttributes(mergeCssAttributes(getCascadingCssAttributes(selectedCurrentBreakpointClasses), updatedAttributes))), [selectedCurrentBreakpointClasses, updatedAttributes])

  // The attributes to be updated
  const attributesHash = useMemo(() => Object.values(selectedBreakpointAttributes).map(({ cssName, value, isImportant }) => `${cssName}${value}${isImportant}`).join(''), [selectedBreakpointAttributes])
  const previousAttributesHash = usePrevious(attributesHash)

  const handleRefreshClasses = useCallback(() => {
    setClassesRefresh(x => x + 1)
  }, [])

  const handleCssUpdate = useCallback(async () => {
    if (!selectedClassName) return
    if (!classNames.length || previousAttributesHash === attributesHash) return
    // if (!isStyleUpdated) return

    const attributes = Object.values(selectedBreakpointAttributes)

    if (!areAttributesValid(attributes)) return

    const { filePath, code } = await updateSelector(`.${selectedClassName}`, attributes, breakpoint)

    handleRefreshClasses()

    await saveFile({
      filePath,
      code,
      commitMessage: `Update .${selectedClassName} in index.css`,
    })
  }, [
    classNames,
    selectedBreakpointAttributes,
    attributesHash,
    previousAttributesHash,
    selectedClassName,
    breakpoint,
    // isStyleUpdated,
    handleRefreshClasses,
    saveFile,
  ])

  const throttledHandleCssUpdate = useThrottleAsynchronous(handleCssUpdate, 1000)

  const handleCreateClassName = useCallback(async (className: string) => {
    const { code, filePath } = await createSelector(`.${className}`, breakpoints)

    // TODO error handling
    if (!code) return

    handleRefreshClasses()

    await saveFile({
      filePath,
      code,
      commitMessage: `Add selector .${className} to index.css`,
    })
  }, [breakpoints, saveFile, handleRefreshClasses])

  const handleUpdateClassName = useCallback(async (className: string) => {
    if (!currentHierarchy?.element) return

    setClassName(className)

    similiarHierarchies.forEach(similarHierarchy => {
      similarHierarchy.element!.className = className
    })

    const code = await updateHierarchyElementAttribute(currentHierarchy, 'className', className)

    // TODO error handling
    if (!code) return

    await saveFile({
      filePath: currentHierarchy.onFilePath,
      code,
      commitMessage: `Add className ${className} to ${currentHierarchy.name}`,
    })
  }, [currentHierarchy, similiarHierarchies, saveFile])

  const handleDeleteClassName = useCallback(async (className: string) => {
    const { code, filePath } = await deleteSelector(`.${className}`)

    // TODO error handling
    if (!code) return

    handleRefreshClasses()

    await saveFile({
      filePath,
      code,
      commitMessage: `Delete selector .${className} in index.css`,
    })
  }, [handleRefreshClasses, saveFile])

  const handleUpdateElementStyle = useCallback((attributes: CssAttributeType[]) => {
    const style: Record<string, string> = {}

    attributes.forEach(attribute => {
      style[attribute.jsName] = attribute.value + (attribute.isImportant ? '!important' : '')
    })

    const css = convertStylesToCssString(style)

    similiarHierarchies.forEach(similarHierarchy => {
      // Prevent infinite hierarchy recreation
      if (similarHierarchy.element?.getAttribute('style') === css) return

      similarHierarchy.element?.setAttribute('style', css)
    })
  }, [similiarHierarchies])

  const handleSetClassNames = useCallback((classes: string[]) => {
    handleUpdateClassName(classes.join(' '))
    // setIsStyleUpdated(false)
    handleUpdateElementStyle([])
  }, [handleUpdateClassName, handleUpdateElementStyle])

  const handleAttributesChange = useCallback((attributes: CssAttributeType[]) => {
    if (!selectedClassName) return

    const mergedAttributes = mergeCssAttributes(updatedAttributes, attributes)
    // setIsStyleUpdated(true)
    setUpdatedAttributes(mergedAttributes)
    handleUpdateElementStyle(mergedAttributes)
  }, [selectedClassName, updatedAttributes, handleUpdateElementStyle])

  const handleWarnAboutCssClassOrdering = useCallback(() => {
    if (!warnings.cssClassOrdering) return

    setShouldDisplayCssClassOrderingWarning(true)
  }, [warnings.cssClassOrdering])

  const renderNoElement = useCallback(() => (
    <Div
      xflex="y1"
      fontSize="0.85rem"
      px={0.5}
    >
      <Div color="text-light">
        No element selected
      </Div>
    </Div>
  ), [])

  const renderNoClassNames = useCallback(() => (
    <Div
      color="text-light"
      fontSize="0.85rem"
      mt={0.5}
      px={0.5}
    >
      Start by adding a class to your component
    </Div>
  ), [])

  const renderSubSections = useCallback(() => (
    <Div
      xflex="y2s"
      mt={0.5}
    >
      {shouldDisplayCssClassOrderingWarning && (
        <Div
          fontSize="0.75rem"
          mb={0.5}
          px={0.75}
        >
          <Div
            color="danger"
            mb={0.5}
          >
            Your selectors have been reordered to respect the order of CSS inheritence.
            To override a behavior on a later selector you can use the "!important" modifier.
            You can also delete the selector and recreate it to give it the inheritence priority.
          </Div>
          <A
            color="danger"
            onClick={() => setShouldDisplayCssClassOrderingWarning(false)}
          >
            Hide warning
          </A>
          <A
            color="danger"
            onClick={() => {
              setShouldDisplayCssClassOrderingWarning(false)
              setWarnings(x => ({ ...x, cssClassOrdering: false }))
            }}
            ml={0.5}
          >
            Do not show again
          </A>
        </Div>
      )}
      {!selectedClassName && (
        <Div
          textAlign="center"
          fontSize="0.75rem"
          color="text-light"
          mb={0.5}
          px={0.75}
        >
          Select a class to edit it.
          <br />
          This is your styling including all classes.
        </Div>
      )}
      <StylesSubSectionLayout />
      <StylesSubSectionSpacing />
      <StylesSubSectionSize />
      <StylesSubSectionPosition />
      <StylesSubSectionTypography />
    </Div>
  ), [
    shouldDisplayCssClassOrderingWarning,
    selectedClassName,
    setWarnings,
  ])

  const renderSection = useCallback(() => (
    <>
      <Div
        xflex="x4"
        px={0.5}
      >
        <CssSelector
          allClasses={allClasses}
          classNames={classNames}
          selectedClassName={selectedClassName}
          onCreateClassName={handleCreateClassName}
          onDeleteClassName={handleDeleteClassName}
          onClassNamesChange={handleSetClassNames}
          onSelectedClassNameChange={setSelelectedClassName}
          onWarnAboutCssClassOrdering={handleWarnAboutCssClassOrdering}
        />
      </Div>
      {!classNames.length ? renderNoClassNames() : renderSubSections()}
    </>
  ), [
    allClasses,
    classNames,
    selectedClassName,
    setSelelectedClassName,
    handleCreateClassName,
    handleDeleteClassName,
    handleSetClassNames,
    handleWarnAboutCssClassOrdering,
    renderNoClassNames,
    renderSubSections,
  ])

  useEffect(() => {
    setClassName(currentHierarchy?.element ? currentHierarchy.element.className : '')
  }, [currentHierarchy])

  // Reset style state on new breakpoint or new selected className
  useEffect(() => {
    // setIsStyleUpdated(false)
    setUpdatedAttributes([])
    handleUpdateElementStyle([])
  // Omiting handleUpdateElementStyle on purpose as it would trigger the effect on every hierarchy change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakpoint, selectedClassName])

  useEffect(() => {
    throttledHandleCssUpdate()
  // Adding throttledHandleCssUpdate as a dep seems to cause infinite useEffect trigger
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributesHash])

  // Styles context
  const styleContextValue = useMemo<StylesContextType>(() => ({
    attributes: selectedClassName ? selectedAttributes : fullAttributes,
    breakpointAttributes: selectedClassName ? selectedBreakpointAttributes : fullBreakpointAttributes,
    currentBreakpointAttributes: selectedClassName ? selectedCurrentBreakpointAttributes : fullCurrentBreakpointAttributes,
    fullBreakpointAttributes,
    isDisabled: !selectedClassName,
    onChange: handleAttributesChange,
  }), [
    selectedClassName,
    selectedAttributes,
    fullAttributes,
    selectedBreakpointAttributes,
    fullBreakpointAttributes,
    selectedCurrentBreakpointAttributes,
    fullCurrentBreakpointAttributes,
    handleAttributesChange,
  ])

  // console.log('similiarHierarchies', similiarHierarchies)
  console.log('updatedAttributes', updatedAttributes)
  // console.log('concernedMedias', concernedMedias)
  console.log('styleContextValue', styleContextValue)

  return (
    <StylesContext.Provider value={styleContextValue}>
      <Div
        xflex="y2s"
        width={256 - 1}
      >
        <Div
          fontWeight="bold"
          p={0.5}
        >
          Styles
        </Div>
        {isNoElementSelected ? renderNoElement() : renderSection()}
      </Div>
    </StylesContext.Provider>
  )
}

export default memo(PanelStyles)
