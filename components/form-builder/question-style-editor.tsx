'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { QuestionStyle, ThemePreset } from '@/lib/database.types'
import { themeList } from '@/lib/themes'

interface QuestionStyleEditorProps {
  style: QuestionStyle
  onUpdate: (style: QuestionStyle) => void
}

const fontFamilies = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Nunito',
]

const quickColors = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
]

// Better color picker component
function ColorPicker({ 
  value, 
  onChange, 
  label 
}: { 
  value: string
  onChange: (value: string) => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  
  return (
    <div className="relative">
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="w-10 h-10 rounded border-2 border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-sm hover:shadow-md"
            style={{ backgroundColor: value || '#111827' }}
          />
          {open && (
            <div className="absolute top-12 left-0 z-50 w-64 p-3 bg-white border border-slate-200 rounded-lg shadow-lg">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Quick Colors</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {quickColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => {
                          onChange(color.value)
                          setOpen(false)
                        }}
                        className="w-8 h-8 rounded border-2 border-slate-200 hover:border-slate-300 transition-all hover:scale-110"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Custom Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={value || '#111827'}
                      onChange={(e) => onChange(e.target.value)}
                      className="w-12 h-10 p-1 border border-slate-200 rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={value || '#111827'}
                      onChange={(e) => onChange(e.target.value)}
                      className="flex-1 font-mono text-xs h-9"
                      placeholder="#111827"
                      pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm h-10"
          placeholder="Use theme default"
        />
      </div>
      {open && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}

export function QuestionStyleEditor({ style, onUpdate }: QuestionStyleEditorProps) {
  const updateStyle = (updates: Partial<QuestionStyle>) => {
    onUpdate({ ...style, ...updates })
  }

  return (
    <div className="p-4 space-y-6 overflow-auto">
      {/* Theme */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Theme</Label>
        <div className="grid grid-cols-2 gap-2">
          {themeList.map((theme) => (
            <button
              key={theme.id}
              onClick={() => updateStyle({ theme: theme.id })}
              className={`
                p-3 rounded-lg border-2 transition-all text-left
                ${style.theme === theme.id 
                  ? 'border-slate-900 ring-2 ring-slate-900/20' 
                  : 'border-slate-200 hover:border-slate-300'
                }
              `}
            >
              <div 
                className="w-full h-8 rounded mb-2"
                style={{ backgroundColor: theme.backgroundColor }}
              >
                <div 
                  className="w-1/2 h-full rounded-l flex items-center justify-center"
                  style={{ backgroundColor: theme.primaryColor }}
                />
              </div>
              <span className="text-xs font-medium text-slate-700">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>
      <Separator />

      {/* Quick Colors */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Quick Colors</Label>
        <div className="flex items-center gap-2 flex-wrap">
          {quickColors.map((color) => (
            <button
              key={color.value}
              onClick={() => updateStyle({ textColor: color.value, buttonBackgroundColor: color.value })}
              className="w-8 h-8 rounded border-2 border-slate-200 hover:border-slate-300 transition-all hover:scale-110"
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
          <button className="w-8 h-8 rounded border-2 border-slate-200 hover:border-slate-300 flex items-center justify-center text-xs font-medium text-slate-600 bg-slate-100">
            M
          </button>
        </div>
      </div>

      <Separator />

      {/* Content */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-4">Content</h4>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="font-family" className="text-sm font-medium">Font Family</Label>
            <Select
              value={style.fontFamily || '__default__'}
              onValueChange={(value) => updateStyle({ fontFamily: value === '__default__' ? undefined : value })}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="Use theme default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__default__">Use theme default</SelectItem>
                {fontFamilies.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ColorPicker
            value={style.textColor || ''}
            onChange={(value) => updateStyle({ textColor: value || undefined })}
            label="Color"
          />
        </div>
      </div>

      <Separator />

      {/* Button Text */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-4">Button Text</h4>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="button-font-family" className="text-sm font-medium">Font Family</Label>
            <Select
              value={style.fontFamily || '__default__'}
              onValueChange={(value) => updateStyle({ fontFamily: value === '__default__' ? undefined : value })}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="Use theme default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__default__">Use theme default</SelectItem>
                {fontFamilies.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ColorPicker
            value={style.buttonBackgroundColor || ''}
            onChange={(value) => updateStyle({ buttonBackgroundColor: value || undefined })}
            label="Button Background Color"
          />

          <ColorPicker
            value={style.buttonTextColor || ''}
            onChange={(value) => updateStyle({ buttonTextColor: value || undefined })}
            label="Button Text Color"
          />
        </div>
      </div>

      <Separator />

      {/* Layout */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-4">Layout</h4>
        
        <div>
          <Label className="text-sm font-medium mb-3 block">Vertical Alignment</Label>
          <div className="flex gap-2">
            <Button
              variant={style.verticalAlignment === 'left' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateStyle({ verticalAlignment: 'left' })}
              className="flex-1"
            >
              Left
            </Button>
            <Button
              variant={style.verticalAlignment === 'center' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateStyle({ verticalAlignment: 'center' })}
              className="flex-1"
            >
              Center
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Apply to all */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          // This would apply the style to all questions
          // For now, just show a message
          alert('This feature will apply the style to all questions')
        }}
      >
        Apply this style to all screens
      </Button>
    </div>
  )
}
