'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { ThemeSelector } from '@/components/theme-selector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ThemeDemo() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Controls</CardTitle>
          <CardDescription>
            Switch between light, dark, and system themes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Quick Toggle</h4>
            <ThemeToggle />
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Theme Selector</h4>
            <ThemeSelector />
          </div>
        </CardContent>
      </Card>

      {/* Demo content to showcase theming */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
          <CardDescription>
            See how different elements look in the current theme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-primary text-primary-foreground rounded-lg">
              <h5 className="font-semibold">Primary</h5>
              <p className="text-sm opacity-90">Primary color scheme</p>
            </div>
            <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
              <h5 className="font-semibold">Secondary</h5>
              <p className="text-sm opacity-90">Secondary color scheme</p>
            </div>
            <div className="p-4 bg-accent text-accent-foreground rounded-lg">
              <h5 className="font-semibold">Accent</h5>
              <p className="text-sm opacity-90">Accent color scheme</p>
            </div>
            <div className="p-4 bg-muted text-muted-foreground rounded-lg">
              <h5 className="font-semibold">Muted</h5>
              <p className="text-sm opacity-90">Muted color scheme</p>
            </div>
            <div className="p-4 bg-card text-card-foreground border rounded-lg">
              <h5 className="font-semibold">Card</h5>
              <p className="text-sm opacity-90">Card background</p>
            </div>
            <div className="p-4 bg-destructive text-destructive-foreground rounded-lg">
              <h5 className="font-semibold">Destructive</h5>
              <p className="text-sm opacity-90">Destructive actions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}