import { useCallback, useEffect, useState } from 'react'
import { A, Button, Div, H2, Input } from 'honorable'
import shortId from 'shortid'

import { SpacingType } from '~types'

import { refetchKeys } from '~constants'

import { SpacingsQuery, SpacingsQueryDataType, UpdateSpacingsMutation, UpdateSpacingsMutationDataType } from '~queries'

import useQuery from '~hooks/useQuery'
import useRefetch from '~hooks/useRefetch'
import useMutation from '~hooks/useMutation'
import useThrottleAsynchronous from '~hooks/useThrottleAsynchronous'

import CssValueInput from '~components/css-inputs/CssValueInput'

function DesignSystemSectionSpacings() {
  const [spacings, setSpacings] = useState<SpacingType[]>([])

  const [spacingsQueryResult, refetchSpacingsQuery] = useQuery<SpacingsQueryDataType>({
    query: SpacingsQuery,
  })
  const [, updateSpacings] = useMutation<UpdateSpacingsMutationDataType>(UpdateSpacingsMutation)

  const throttledUpdateSpacings = useThrottleAsynchronous(updateSpacings, 1000)

  useRefetch({
    key: refetchKeys.spacings,
    refetch: refetchSpacingsQuery,
  })

  const handleSpacingChange = useCallback(async (spacings: SpacingType[]) => {
    setSpacings(spacings)

    await throttledUpdateSpacings({
      spacingsJson: JSON.stringify(spacings),
    })
  }, [throttledUpdateSpacings])

  const handleCreateSpacing = useCallback(() => {
    const id = shortId()

    handleSpacingChange([
      ...spacings,
      {
        id,
        variableName: `--spacing-${id}`,
        name: `Spacing ${spacings.length + 1}`,
        value: '1rem',
      },
    ])
  }, [spacings, handleSpacingChange])

  useEffect(() => {
    if (!spacingsQueryResult.data?.spacings) return

    setSpacings(spacingsQueryResult.data.spacings)
  }, [spacingsQueryResult.data])

  return (
    <Div xflex="y2s">
      <H2 mb={2}>Spacing</H2>
      <Div
        xflex="x11"
        columnGap={2}
        rowGap={1}
      >
        {spacings.map(spacing => (
          <SpacingItem
            key={spacing.id}
            spacing={spacing}
            onChange={spacing => handleSpacingChange(spacings.map(c => c.id === spacing.id ? spacing : c))}
          />
        ))}
        {!spacings.length && (
          <Div color="text-light">
            {spacingsQueryResult.fetching ? 'Fetching...' : 'No spacing variables'}
          </Div>
        )}
      </Div>
      <Button
        onClick={handleCreateSpacing}
        alignSelf="flex-start"
        mt={1.5}
      >
        Add spacing
      </Button>
    </Div>
  )
}

type SpacingItemPropsType = {
  spacing: SpacingType
  onChange: (spacing: SpacingType) => void
}

function SpacingItem({ spacing, onChange }: SpacingItemPropsType) {
  const [name, setName] = useState(spacing.name)
  const [isEdited, setIsEdited] = useState(false)
  const [isNameEdited, setIsNameEdited] = useState(false)

  const handleUpdateName = useCallback(() => {
    setIsNameEdited(false)

    if (!name) return

    onChange({
      ...spacing,
      name,
    })
  }, [spacing, name, onChange])

  return (
    <Div
      xflex="y2"
      width={`calc(max(${spacing.value}, 128px))`}
      minWidth={0} // For ellipsis to work
      gap={1}
      _hover={{
        '> #SpacingItem-edit': {
          opacity: 1,
        },
      }}
    >
      <Div
        ellipsis
        onClick={() => setIsNameEdited(true)}
        px={0.5}
      >
        {isNameEdited ? (
          <Input
            bare
            autoFocus
            autoSelect
            width="100%"
            inputProps={{ textAlign: 'center' }}
            value={name}
            onChange={event => setName(event.target.value)}
            onBlur={handleUpdateName}
            onEnter={handleUpdateName}
          />
        ) : spacing.name}
      </Div>
      {isEdited && (
        <Div
          xflex="x5"
          fontSize="0.75rem"
        >
          <CssValueInput
            value={spacing.value}
            onChange={value => onChange({ ...spacing, value })}
          />
        </Div>
      )}
      <Div
        width={spacing.value}
        height={spacing.value}
        backgroundColor="primary"
      />
      <Div
        id="SpacingItem-edit"
        fontWeight="0.75rem"
        opacity={isEdited ? 1 : 0}
      >
        <A onClick={() => setIsEdited(x => !x)}>
          {isEdited ? 'End editing' : 'Edit'}
        </A>
      </Div>
    </Div>
  )
}

export default DesignSystemSectionSpacings
