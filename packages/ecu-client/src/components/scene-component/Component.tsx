import { useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Div } from 'honorable'
import { RiNodeTree } from 'react-icons/ri'
import { MdBrush } from 'react-icons/md'

import { refetchKeys } from '~constants'

import { ComponentFileMetadataQuery, ComponentFileQueryDataType } from '~queries'

import TabsContext from '~contexts/TabsContext'

import useCurrentComponentPath from '~hooks/useCurrentComponentPath'
import useQuery from '~hooks/useQuery'
import useRefetch from '~hooks/useRefetch'

import BreakpointsButtons from '~components/scene-component/BreakpointsButtons'
import WidthBar from '~components/scene-component/WidthBar'
import HierarchyBar from '~components/scene-component/HierarchyBar'
import InteractiveModeButton from '~components/scene-component/InteractiveModeButton'
import RemountButton from '~components/scene-component/RemountButton'
import ComponentWindow from '~components/scene-component/ComponentWindow'
import RetractablePanel from '~components/layout/RetractablePanel'
import PanelHierarchy from '~components/scene-component/panels/PanelHierarchy'
import PanelStyles from '~components/scene-component/panels/styles/PanelStyles'

function Component() {
  const { '*': ecuComponentPath = '' } = useParams()

  const { tabs, setTabs } = useContext(TabsContext)

  const path = useCurrentComponentPath()

  const [componentFileMetadataQueryResult, refetchFileMetadataQuery] = useQuery<ComponentFileQueryDataType>({
    query: ComponentFileMetadataQuery,
    variables: {
      path,
    },
    pause: !path,
  })

  useRefetch({
    key: refetchKeys.componentFileMetadata,
    refetch: refetchFileMetadataQuery,
  })

  useEffect(() => {
    if (!ecuComponentPath) return

    const url = `/_ecu_/~/${ecuComponentPath}`

    if (tabs.some(tab => tab.url === url)) return

    setTabs(tabs => [...tabs, { url, label: path.split('/').pop() ?? '?' }])
  // Omitting tabs to trigger on ecuComponentPath change only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ecuComponentPath, path, setTabs])

  if (!path) return null
  if (!componentFileMetadataQueryResult.data) return null

  const { decoratorPaths } = componentFileMetadataQueryResult.data.componentFileMetadata

  return (
    <Div
      xflex="x4s"
      flexGrow
      maxHeight="100%"
    >
      <RetractablePanel
        direction="left"
        openPersistedStateKey="left-panel-open"
        items={[
          {
            label: 'Hierarchy',
            icon: <RiNodeTree />,
            children: <PanelHierarchy />,
          },
        ]}
      />
      <Div
        xflex="y2s"
        flexGrow
        maxHeight="100%"
        overflow="hidden"
        backgroundColor="background-component"
      >
        <Div
          xflex="x4"
          height={32}
          backgroundColor="background-component"
        >
          <Div flexGrow />
          <Div width={128} />
          <InteractiveModeButton
            borderLeft="1px solid border"
            borderRight="1px solid border"
            borderBottom="1px solid border"
          />
          <RemountButton
            borderRight="1px solid border"
            borderBottom="1px solid border"
          />
          <Div width={32} />
          <BreakpointsButtons />
          <Div width={3 * 32} />
          <Div flexGrow />
        </Div>
        <ComponentWindow
          componentPath={path}
          decoratorPaths={decoratorPaths}
        />
        <WidthBar />
        <HierarchyBar />
      </Div>
      <RetractablePanel
        direction="right"
        openPersistedStateKey="right-panel-open"
        items={[
          {
            label: 'Style',
            icon: <MdBrush />,
            children: <PanelStyles />,
          },
        ]}
      />
    </Div>
  )
}

export default Component
