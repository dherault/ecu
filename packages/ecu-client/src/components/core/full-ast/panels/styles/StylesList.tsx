import { ReactNode } from 'react'
import { Div } from 'honorable'
import { HiPlus } from 'react-icons/hi'

import { CssAttributeType, NormalizedCssAttributesType } from '~types'

import StylesAttributeTitle from '~core/full-ast/panels/styles/StylesAttributeTitle'

type StylesListPropsType = {
  title: string
  items: ReactNode[]
  attributeName: string
  attributes: NormalizedCssAttributesType
  breakpointAttributes: NormalizedCssAttributesType
  currentBreakpointAttributes: NormalizedCssAttributesType
  onChange: (attributes: CssAttributeType[]) => void
  onAddItem: () => void
}

function StylesList({
  title,
  items,
  attributeName,
  attributes,
  breakpointAttributes,
  currentBreakpointAttributes,
  onAddItem,
  onChange,
}: StylesListPropsType) {

  return (
    <Div
      xflex="y2s"
      fontSize="0.75rem"
      borderTop="1px solid border"
      px={0.5}
    >
      <Div
        xflex="x5b"
        height={30} // To match a ghost button's height
      >
        <StylesAttributeTitle
          attributeNames={[attributeName]}
          attributes={attributes}
          breakpointAttributes={breakpointAttributes}
          currentBreakpointAttributes={currentBreakpointAttributes}
          onChange={onChange}
          width="auto"
        >
          {title}
        </StylesAttributeTitle>
        <Div
          xflex="x5"
          cursor="pointer"
          onClick={onAddItem}
          mr={-0.25}
          p={0.25}
        >
          <HiPlus />
        </Div>
      </Div>
      {!!items.length && (
        <Div
          xflex="y2s"
          backgroundColor="background"
          borderRadius="medium"
          gap={0.25}
        >
          {items}
        </Div>
      )}
    </Div>
  )
}

export default StylesList
