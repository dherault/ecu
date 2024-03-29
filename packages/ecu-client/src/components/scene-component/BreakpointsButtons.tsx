import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Button, Div, Input, Menu, MenuItem, Tooltip, WithOutsideClick } from 'honorable'
import viewports from 'devices-viewport-size'
import { AiOutlineDesktop, AiOutlineMobile, AiOutlineTablet } from 'react-icons/ai'
import { MdClose } from 'react-icons/md'
import { RxCaretDown } from 'react-icons/rx'

import { BreakpointType } from '~types'

import { refetchKeys, zIndexes } from '~constants'

import { BreakpointsQuery, BreakpointsQueryDataType } from '~queries'

import BreakpointContext from '~contexts/BreakpointContext'

import useQuery from '~hooks/useQuery'
import useRefetch from '~hooks/useRefetch'

const infinityValue = 999999999

const icons = [
  <AiOutlineDesktop style={{ transform: 'scale(1.25, 1)' }} />,
  <AiOutlineDesktop />,
  <AiOutlineTablet />,
  <AiOutlineMobile style={{ transform: 'rotate(90deg)' }} />,
  <AiOutlineMobile />,
]

function BreakpointsButtons() {
  const { breakpoint, setBreakpoint, breakpoints, setBreakpoints, width, setWidth, height, setHeight } = useContext(BreakpointContext)

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const [breakpointsQueryResult, refetchBreakpointsQuery] = useQuery<BreakpointsQueryDataType>({
    query: BreakpointsQuery,
  })

  const workingBreakpoints = useMemo(() => breakpointsQueryResult.data?.breakpoints ?? breakpoints, [breakpointsQueryResult.data, breakpoints])

  useRefetch({
    key: refetchKeys.breakpoints,
    refetch: refetchBreakpointsQuery,
  })

  const handleBreakpointClick = useCallback((breakpoint: BreakpointType) => {
    setBreakpoint(breakpoint)
    setWidth(breakpoint.base)
    setHeight(null)
  }, [setBreakpoint, setWidth, setHeight])

  const handleViewportClick = useCallback(({ width, height }: { width: number, height: number }) => {
    const breakpoint = workingBreakpoints.find(b => b.min <= width && b.max > width) ?? workingBreakpoints[0]

    setBreakpoint(breakpoint)
    setWidth(width)
    setHeight(height)
    setIsMenuOpen(false)
  }, [workingBreakpoints, setBreakpoint, setWidth, setHeight])

  const handleWidthChange = useCallback((event: any) => {
    const width = parseFloat(event.target.value)
    const breakpoint = workingBreakpoints.find(b => b.min <= width && b.max > width) ?? workingBreakpoints[0]

    setWidth(width)
    setBreakpoint(breakpoint)
  }, [workingBreakpoints, setBreakpoint, setWidth])

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const renderViewport = useCallback(() => (
    <Div
      xflex="x4"
      width={128}
      fontSize="0.75rem"
      ml={0.5}
      gap={0.5}
    >
      <Input
        bare
        noEndIconPadding
        type="number"
        width={38}
        value={width}
        onChange={handleWidthChange}
        endIcon="px"
      />
      <MdClose />
      <Input
        bare
        noEndIconPadding
        type="number"
        placeholder="-"
        width={38}
        value={height}
        onChange={event => {
          const x = parseFloat(event.target.value)

          setHeight(x === x ? x : null)
        }}
        endIcon={height === null ? null : 'px'}
      />
      <Div
        fontSize="1rem"
        transform={isMenuOpen ? 'rotate(180deg)' : null}
        transformOrigin="center 45%" // Adjusted by sight
        transition="transform 200ms ease"
        cursor="pointer"
        onClick={() => setIsMenuOpen(x => !x)}
        ml={-0.25}
        p={0.25}
      >
        <RxCaretDown />
      </Div>
    </Div>
  ), [width, height, isMenuOpen, handleWidthChange, setHeight])

  const renderMenu = useCallback(() => (
    <WithOutsideClick
      preventFirstFire
      onOutsideClick={handleMenuClose}
    >
      <Menu
        position="absolute"
        top="calc(100% + 4px)"
        right={0}
        fontSize="0.75rem"
        maxHeight={256}
        overflowY="auto"
        zIndex={zIndexes.breakpointsMenu}
      >
        {Object.entries(viewports).map(([name, value]) => (
          <MenuItem
            key={name}
            slim
            onClick={() => handleViewportClick(value)}
          >
            {name}
            <Div
              flexGrow
              ml={1}
            />
            {value.width}
            {' '}
            <MdClose />
            {' '}
            {value.height}
          </MenuItem>
        ))}
      </Menu>
    </WithOutsideClick>
  ), [handleMenuClose, handleViewportClick])

  useEffect(() => {
    if (!workingBreakpoints.length) return

    const existingBreakpoint = workingBreakpoints.find(b => b.id === breakpoint.id)

    if (existingBreakpoint) return

    const nextBreakpoint = workingBreakpoints.find(b => !b.media) ?? workingBreakpoints[0]

    setWidth(nextBreakpoint.base)
    setBreakpoint(nextBreakpoint)
  // Omitting breakpoint here to make it happen only on the first render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workingBreakpoints, setBreakpoint, setWidth])

  useEffect(() => {
    setBreakpoints(workingBreakpoints)
  }, [workingBreakpoints, setBreakpoints])

  if (!workingBreakpoints.length) return null

  return (
    <Div
      xflex="x4"
      position="relative"
      userSelect="none"
    >
      {workingBreakpoints.map((bp, i) => (
        <Tooltip
          key={bp.id}
          label={(
            <Div xflex="y2">
              <Div>{bp.name}</Div>
              <Div>
                {bp.max >= infinityValue ? '∞' : bp.max}
                px -
                {' '}
                {bp.min}
                px
              </Div>
            </Div>
          )}
          placement="bottom"
        >
          <Button
            ghost
            toggled={bp.id === breakpoint?.id}
            color={bp.media && bp.id === breakpoint?.id ? 'breakpoint' : 'inherit'}
            borderRight="1px solid border"
            borderBottom="1px solid border"
            _first={{
              borderLeft: '1px solid border',
            }}
            onClick={() => handleBreakpointClick(bp)}
          >
            {icons[i]}
          </Button>
        </Tooltip>
      ))}
      {!!breakpoint && renderViewport()}
      {isMenuOpen && renderMenu()}
    </Div>
  )
}

export default BreakpointsButtons
