import { H3, Modal } from 'honorable'

import GridEditor from './GridEditor'

import { CssAttributeType, CssValuesType } from '@types'

type GridModalPropsType = {
  open: boolean
  onClose: () => void
  cssValues: CssValuesType
  breakpointCssValues: CssValuesType
  onChange: (attributes: CssAttributeType[]) => void
}

function GridModal({ open, onClose, cssValues, breakpointCssValues, onChange }: GridModalPropsType) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      minWidth={512}
      backgroundColor="background-light"
    >
      <H3 mb={2}>Edit grid</H3>
      <GridEditor
        cssValues={cssValues}
        breakpointCssValues={breakpointCssValues}
        onChange={onChange}
      />
    </Modal>
  )
}

export default GridModal