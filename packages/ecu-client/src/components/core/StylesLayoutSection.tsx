import { useCallback } from 'react'
import { Accordion, Button, Div } from 'honorable'
import { CgDisplayFlex, CgDisplayFullwidth, CgDisplayGrid } from 'react-icons/cg'
import { FaRegEyeSlash } from 'react-icons/fa'

import usePersistedState from '../../hooks/usePersistedState'
import { CssValueType } from '../../types'
import { cssAttributesMap } from '../../constants'

type StylesLayoutSectionPropsType = {
  cssValues: Record<string, CssValueType>
  onChange: (attributeName: string, value: CssValueType) => void
}

const displays = [
  {
    name: 'flex',
    Icon: CgDisplayFlex,
  },
  {
    name: 'block',
    Icon: CgDisplayFullwidth,
  },
  {
    name: 'grid',
    Icon: CgDisplayGrid,
  },
  {
    name: 'none',
    Icon: FaRegEyeSlash,
  },
]

function StylesLayoutSection({ cssValues, onChange }: StylesLayoutSectionPropsType) {
  const [expanded, setExpanded] = usePersistedState('styles-layout-section-expanded', true)

  const renderDisplayEditor = useCallback(() => (
    <Div xflex="x4">
      <Div
        minWidth={46}
        fontSize="0.75rem"
        color={cssValues.display && cssValues.display !== cssAttributesMap.display.defaultValue ? 'primary' : 'text-light'}
      >
        Display:
      </Div>
      {displays.map(({ name, Icon }) => (
        <Button
          ghost
          toggled={cssValues.display ? cssValues.display === name : cssAttributesMap.display.defaultValue === name}
          onClick={() => onChange('display', name)}
          key={name}
        >
          <Icon />
        </Button>
      ))}
    </Div>
  ), [cssValues, onChange])

  return (
    <Accordion
      ghost
      smallPadding
      smallTitle
      backgroundTitle
      title="Layout"
      expanded={expanded}
      onExpand={setExpanded}
    >
      {renderDisplayEditor()}
    </Accordion>
  )
}

export default StylesLayoutSection