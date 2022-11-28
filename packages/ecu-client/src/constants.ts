import { CSsAttributesMapType, CssValueType, HierarchyPosition } from './types'
import splitSpacingValue from './utils/splitSpacingValue'

export const hierarchyPositions: HierarchyPosition[] = [
  'before',
  'after',
  'children',
  'parent',
]

export const refetchKeys = {
  all: 'all',
  component: 'component',
  components: 'components',
  hierarchy: 'hierarchy',
  cssClasses: 'cssClasses',
  componentScreenshot: 'componentScreenshot',
  isComponentAcceptingChildren: 'isComponentAcceptingChildren',
  fileImports: 'fileImports',
  fileTypes: 'fileTypes',
  undoRedoMetadata: 'undoRedoMetadata',
  packages: 'packages',
  packagesUpdates: 'packagesUpdates',
}

export const ecuAtoms = [
  {
    name: 'Div',
    isComponentAcceptingChildren: true,
  },
  {
    name: 'Text',
    isComponentAcceptingChildren: false,
  },
]

export const ecuAtomPrefix = '__ecu_atom__'

export const ecuSpecials = [
  {
    name: 'children',
    isComponentAcceptingChildren: false,
  },
]

export const ecuSpecialPrefix = '__ecu_special__'

export const cssValueUnits = [
  'auto',
  'px',
  '%',
  'rem',
  'em',
  'vw',
  'vh',
  'vmin',
  'vmax',
  'ch',
  'ex',
  'mm',
  'cm',
  'in',
  'pt',
  'pc',
] as const

const cssDisplayValues = ['block', 'inline-block', 'flex', 'grid', 'none']

function extractSpacing(value: CssValueType, index: number): CssValueType {
  if (typeof value === 'number') return value

  const spacing = value.split(' ').map(x => x.trim())

  return spacing[index] || spacing[0]
}

function convertSpacing(name: string, value: CssValueType) {
  if (typeof value !== 'string') {
    return {
      [name]: value.toString(),
    }
  }

  const spacings = value.split(' ').map(x => x.trim())

  if (spacings.length === 1) {
    return {
      [`${name}-top`]: value,
      [`${name}-right`]: value,
      [`${name}-bottom`]: value,
      [`${name}-left`]: value,
    }
  }

  if (spacings.length === 2) {
    return {
      [`${name}-top`]: spacings[0],
      [`${name}-right`]: spacings[1],
      [`${name}-bottom`]: spacings[0],
      [`${name}-left`]: spacings[1],
    }
  }

  if (spacings.length === 3) {
    return {
      [`${name}-top`]: spacings[0],
      [`${name}-right`]: spacings[1],
      [`${name}-bottom`]: spacings[2],
      [`${name}-left`]: spacings[1],
    }
  }

  if (spacings.length === 4) {
    return {
      [`${name}-top`]: spacings[0],
      [`${name}-right`]: spacings[1],
      [`${name}-bottom`]: spacings[2],
      [`${name}-left`]: spacings[3],
    }
  }

  return {
    [`${name}-top`]: value,
    [`${name}-right`]: value,
    [`${name}-bottom`]: value,
    [`${name}-left`]: value,
  }
}

function isSpacingValueValid(value: CssValueType) {
  if (typeof value === 'number') return true

  const [rawValue, unit] = splitSpacingValue(value)

  const numericValue = parseFloat(rawValue)

  return (rawValue === 'auto' || numericValue === numericValue) && unit !== null && cssValueUnits.includes(unit)
}

function isSpacingsValueValid(value: CssValueType) {
  if (typeof value === 'number') return true

  const values = value.split(' ').filter(x => Boolean(x.trim()))

  return values.length <= 4 && values.every(isSpacingValueValid)
}

export const cssAttributesMap: CSsAttributesMapType = {
  margin: {
    attributes: ['margin'],
    defaultValue: '0 0 0 0',
    converter: value => convertSpacing('margin', value),
    isValueValid: isSpacingsValueValid,
  },
  'margin-top': {
    attributes: ['margin-top', 'margin'],
    defaultValue: 0,
    extractValue: value => extractSpacing(value, 0),
    isValueValid: isSpacingValueValid,
  },
  'margin-right': {
    attributes: ['margin-right', 'margin'],
    defaultValue: 0,
    extractValue: value => extractSpacing(value, 1),
    isValueValid: isSpacingValueValid,
  },
  'margin-bottom': {
    attributes: ['margin-bottom', 'margin'],
    defaultValue: 0,
    extractValue: value => extractSpacing(value, 2),
    isValueValid: isSpacingValueValid,
  },
  'margin-left': {
    attributes: ['margin-left', 'margin'],
    defaultValue: 0,
    extractValue: value => extractSpacing(value, 3),
    isValueValid: isSpacingValueValid,
  },
  padding: {
    attributes: ['padding'],
    defaultValue: '0 0 0 0',
    converter: value => convertSpacing('padding', value),
    isValueValid: isSpacingsValueValid,
  },
  'padding-top': {
    attributes: ['padding-top', 'padding'],
    defaultValue: 0,
    extractValue: value => extractSpacing(value, 0),
    isValueValid: isSpacingValueValid,
  },
  'padding-right': {
    attributes: ['padding-right', 'padding'],
    defaultValue: 0,
    extractValue: value => extractSpacing(value, 1),
    isValueValid: isSpacingValueValid,
  },
  'padding-bottom': {
    attributes: ['padding-bottom', 'padding'],
    defaultValue: 0,
    extractValue: value => extractSpacing(value, 2),
    isValueValid: isSpacingValueValid,
  },
  'padding-left': {
    attributes: ['padding-left', 'padding'],
    defaultValue: 0,
    extractValue: value => extractSpacing(value, 3),
    isValueValid: isSpacingValueValid,
  },
  display: {
    attributes: ['display'],
    defaultValue: 'block',
    isValueValid: value => typeof value === 'string' && cssDisplayValues.includes(value),
  },
} as const

export const spacingSemanticValues = [
  'top',
  'right',
  'bottom',
  'left',
] as const
