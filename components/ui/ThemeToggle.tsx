'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
    const { theme, toggleTheme, mounted } = useTheme()

    if (!mounted) return null

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-text" />
            ) : (
                <Sun className="w-5 h-5 text-text" />
            )}
        </button>
    )
}