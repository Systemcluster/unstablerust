import { useThemeUI } from '@theme-ui/core'
import { darkTheme } from '@/themes/dark'

const useTheme = () => {
    const { theme } = useThemeUI()
    return { theme: theme as typeof darkTheme }
}

export default useTheme
