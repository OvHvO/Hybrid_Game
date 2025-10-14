'use client'

import * as React from 'react'
import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

interface ThemeOption {
  value: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const themes: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    icon: Monitor,
  },
]

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2 p-2 border rounded-lg">
        <div className="flex space-x-1">
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors"
            >
              <themeOption.icon className="h-4 w-4" />
              <span>{themeOption.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 p-2 border rounded-lg bg-background">
      <div className="flex space-x-1">
        {themes.map((themeOption) => {
          const isSelected = theme === themeOption.value
          return (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <themeOption.icon className="h-4 w-4" />
              <span>{themeOption.label}</span>
              {isSelected && <Check className="h-3 w-3 ml-1" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}