import { Div } from 'honorable'

// An overlay to block editing whenno classNAme is selected
function StylesSubSectionDisabledOverlay() {
  return (
    <Div
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="background-styles-overlay"
      cursor="not-allowed"
    />
  )
}

export default StylesSubSectionDisabledOverlay