import { useJuiceTheme } from 'contexts/Theme/JuiceTheme'
import { ThemeContext } from 'contexts/Theme/ThemeContext'

export const ThemeProvider: React.FC = ({ children }) => {
  const juiceTheme = useJuiceTheme()

  return (
    <ThemeContext.Provider value={juiceTheme}>{children}</ThemeContext.Provider>
  )
}
