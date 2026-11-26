import { Sun, Moon } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useApp()
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-bgPrimary text-textSub"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-pressed={theme === 'dark'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}