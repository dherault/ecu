import { ReactNode, useContext } from 'react'
import { useMatch } from 'react-router-dom'
import { CssBaseline, ThemeProvider, mergeTheme } from 'honorable'

import theme from '../../../theme'
import themeComponent from '../../../themeComponent'

import ThemeModeContext from '@contexts/ThemeModeContext'

type EcuThemeProviderPropsType = {
  children: ReactNode
}

function ProviderTheme({ children }: EcuThemeProviderPropsType) {
  const ecuRouteMatched = useMatch('/_ecu_/*')

  const { themeMode } = useContext(ThemeModeContext)

  return (
    <ThemeProvider theme={ecuRouteMatched ? mergeTheme(theme, { mode: themeMode }) : themeComponent}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

export default ProviderTheme