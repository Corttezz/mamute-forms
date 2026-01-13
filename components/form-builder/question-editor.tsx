'use client'

import { useState } from 'react'
import { QuestionConfig, NavigationTarget, QuestionLogic } from '@/lib/database.types'
import { getQuestionTypeInfo } from '@/lib/questions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2, Plus, GripVertical, X, Code, Palette } from 'lucide-react'
import { QuestionStyleEditor } from './question-style-editor'
import { QuestionStyle } from '@/lib/database.types'

interface QuestionEditorProps {
  question: QuestionConfig
  questions?: QuestionConfig[] // All questions for navigation target dropdown
  onUpdate: (updates: Partial<QuestionConfig>) => void
  onDelete: () => void
}

export function QuestionEditor({ question, questions = [], onUpdate, onDelete }: QuestionEditorProps) {
  const typeInfo = getQuestionTypeInfo(question.type)
  const [activeTab, setActiveTab] = useState('component')
  
  // Get style from question metadata or use defaults (empty means use theme defaults)
  const questionStyle: QuestionStyle = question.style || {}
  
  // Get logic from question or use defaults
  const logic: QuestionLogic = question.logic || {}

  const handleStyleUpdate = (style: QuestionStyle) => {
    onUpdate({ style })
  }
  
  const handleLogicUpdate = (updates: Partial<QuestionLogic>) => {
    onUpdate({ logic: { ...logic, ...updates } })
  }
  
  const isFlowScreen = question.type === 'welcome' || question.type === 'end' || 
                       question.type === 'loading' || question.type === 'result'

  const addOption = () => {
    const options = question.options || []
    onUpdate({ options: [...options, `Option ${options.length + 1}`] })
  }

  const updateOption = (index: number, value: string) => {
    const options = [...(question.options || [])]
    options[index] = value
    onUpdate({ options })
  }

  const deleteOption = (index: number) => {
    const options = (question.options || []).filter((_, i) => i !== index)
    onUpdate({ options })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border bg-card">
        <div className="px-4">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('component')}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'component'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }
              `}
            >
              Component
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'style'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }
              `}
            >
              Style
            </button>
            <button
              onClick={() => setActiveTab('logic')}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'logic'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }
              `}
            >
              Logic
            </button>
          </div>
        </div>
        </div>

      {/* Main content */}
      {activeTab === 'component' && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6 space-y-6">
      {/* Screen Type (for flow screens) */}
      {isFlowScreen && (
        <div>
          <Label htmlFor="screen-type" className="text-sm font-medium">Screen type</Label>
          <Select
            value={question.type}
            onValueChange={(value) => onUpdate({ type: value as QuestionConfig['type'] })}
          >
            <SelectTrigger id="screen-type" className="mt-2 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="welcome">Welcome</SelectItem>
              <SelectItem value="loading">Loading</SelectItem>
              <SelectItem value="result">Result</SelectItem>
              <SelectItem value="end">End</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Question Type Badge (for regular questions) */}
      {!isFlowScreen && (
        <div className="flex items-center gap-2">
          {typeInfo && <typeInfo.icon className="w-4 h-4 text-primary" />}
          <span className="text-sm font-medium text-muted-foreground">{typeInfo?.label}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-sm font-medium">
          {isFlowScreen ? 'Title' : 'Question'}
        </Label>
        <Textarea
          id="title"
          value={question.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder={isFlowScreen ? "Enter title..." : "Type your question here..."}
          className="mt-2 resize-none"
          rows={2}
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-sm font-medium">
          Description <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="description"
          value={question.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Add a description..."
          className="mt-2 resize-none"
          rows={2}
        />
      </div>

      {/* Button Text (for all screens with buttons) */}
      <div>
        <Label htmlFor="button-text" className="text-sm font-medium">Button text</Label>
        <Input
          id="button-text"
          value={question.buttonText || ''}
          onChange={(e) => onUpdate({ buttonText: e.target.value })}
          placeholder={
            question.type === 'welcome' ? 'Start' : 
            question.type === 'end' ? 'Close' : 
            'Continue'
          }
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {question.type === 'welcome' || question.type === 'end' 
            ? 'Text displayed on the action button'
            : 'Leave empty to use default (Continue/Submit)'}
        </p>
      </div>

      {/* Separator only if there are type-specific settings below */}
      {!isFlowScreen && (
        <Separator />
      )}

      {/* Type-specific settings */}
      {(question.type === 'dropdown' || question.type === 'checkboxes') && (
        <div>
          <Label className="text-sm font-medium mb-3 block">Options</Label>
          <div className="space-y-2">
            {(question.options || []).map((option, index) => (
              <div
                key={index}
                className="flex items-center gap-2"
              >
                <div className="cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                </div>
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteOption(index)}
                  className="h-8 w-8 p-0"
                  disabled={(question.options?.length || 0) <= 1}
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addOption}
            className="mt-3 w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add option
          </Button>
        </div>
      )}

      {(question.type === 'short_text' || question.type === 'long_text' || 
        question.type === 'email' || question.type === 'phone' || 
        question.type === 'url' || question.type === 'number') && (
        <div>
          <Label htmlFor="placeholder" className="text-sm font-medium">Placeholder</Label>
          <Input
            id="placeholder"
            value={question.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder="Placeholder text..."
            className="mt-2"
          />
        </div>
      )}

      {question.type === 'rating' && (
        <div>
          <Label className="text-sm font-medium mb-3 block">Rating Scale</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="minValue" className="text-xs text-muted-foreground">Min</Label>
              <Input
                id="minValue"
                type="number"
                value={question.minValue || 1}
                onChange={(e) => onUpdate({ minValue: parseInt(e.target.value) || 1 })}
                min={1}
                max={4}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="maxValue" className="text-xs text-muted-foreground">Max</Label>
              <Input
                id="maxValue"
                type="number"
                value={question.maxValue || 5}
                onChange={(e) => onUpdate({ maxValue: parseInt(e.target.value) || 5 })}
                min={2}
                max={10}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {question.type === 'opinion_scale' && (
        <div>
          <Label className="text-sm font-medium mb-3 block">Scale Range</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="minValue" className="text-xs text-muted-foreground">Min</Label>
              <Input
                id="minValue"
                type="number"
                value={question.minValue || 1}
                onChange={(e) => onUpdate({ minValue: parseInt(e.target.value) || 1 })}
                min={0}
                max={1}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="maxValue" className="text-xs text-muted-foreground">Max</Label>
              <Input
                id="maxValue"
                type="number"
                value={question.maxValue || 10}
                onChange={(e) => onUpdate({ maxValue: parseInt(e.target.value) || 10 })}
                min={5}
                max={10}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {question.type === 'file_upload' && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Allowed file types</Label>
            <p className="text-sm text-muted-foreground">Images and PDFs are allowed</p>
          </div>
          <div>
            <Label htmlFor="maxFileSize" className="text-sm font-medium">Max file size (MB)</Label>
            <Input
              id="maxFileSize"
              type="number"
              value={question.maxFileSize || 10}
              onChange={(e) => onUpdate({ maxFileSize: parseInt(e.target.value) || 10 })}
              min={1}
              max={25}
              className="mt-2"
            />
          </div>
        </div>
      )}

      {question.type === 'slider' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="slider-min" className="text-sm font-medium">Min value</Label>
              <Input
                id="slider-min"
                type="number"
                value={question.minValue || 0}
                onChange={(e) => onUpdate({ minValue: parseInt(e.target.value) || 0 })}
                className="mt-2"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="slider-max" className="text-sm font-medium">Max value</Label>
              <Input
                id="slider-max"
                type="number"
                value={question.maxValue || 100}
                onChange={(e) => onUpdate({ maxValue: parseInt(e.target.value) || 100 })}
                className="mt-2"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="slider-default" className="text-sm font-medium">Default value</Label>
            <Input
              id="slider-default"
              type="number"
              value={question.placeholder || '50'}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              min={question.minValue || 0}
              max={question.maxValue || 100}
              className="mt-2"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="slider-min-label" className="text-sm font-medium">Min label</Label>
              <Input
                id="slider-min-label"
                type="text"
                value={question.options?.[0] || ''}
                onChange={(e) => {
                  const options = [...(question.options || [])]
                  options[0] = e.target.value
                  if (!options[1]) options[1] = ''
                  onUpdate({ options })
                }}
                placeholder="Left label"
                className="mt-2"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="slider-max-label" className="text-sm font-medium">Max label</Label>
              <Input
                id="slider-max-label"
                type="text"
                value={question.options?.[1] || ''}
                onChange={(e) => {
                  const options = [...(question.options || [])]
                  if (!options[0]) options[0] = ''
                  options[1] = e.target.value
                  onUpdate({ options })
                }}
                placeholder="Right label"
                className="mt-2"
              />
            </div>
          </div>
        </div>
      )}

      {question.type === 'testimonials' && (
        <div className="space-y-4">
          <Label className="text-sm font-medium">Testimonials</Label>
          <p className="text-xs text-muted-foreground mb-3">Format: Name|Rating(1-5)|Comment|Initials</p>
          <div className="space-y-3">
            {(question.options || []).map((testimonial, index) => {
              const parts = testimonial.split('|')
              return (
                <div key={index} className="p-3 border border-border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Testimonial {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const options = (question.options || []).filter((_, i) => i !== index)
                        onUpdate({ options })
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Name"
                    value={parts[0] || ''}
                    onChange={(e) => {
                      const options = [...(question.options || [])]
                      const newParts = [...parts]
                      newParts[0] = e.target.value
                      options[index] = newParts.join('|')
                      onUpdate({ options })
                    }}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Rating (1-5)"
                      min={1}
                      max={5}
                      value={parts[1] || ''}
                      onChange={(e) => {
                        const options = [...(question.options || [])]
                        const newParts = [...parts]
                        newParts[1] = e.target.value
                        options[index] = newParts.join('|')
                        onUpdate({ options })
                      }}
                      className="text-sm flex-1"
                    />
                    <Input
                      placeholder="Initials"
                      value={parts[3] || ''}
                      onChange={(e) => {
                        const options = [...(question.options || [])]
                        const newParts = [...parts]
                        newParts[3] = e.target.value
                        options[index] = newParts.join('|')
                        onUpdate({ options })
                      }}
                      className="text-sm w-20"
                    />
                  </div>
                  <Textarea
                    placeholder="Comment"
                    value={parts[2] || ''}
                    onChange={(e) => {
                      const options = [...(question.options || [])]
                      const newParts = [...parts]
                      newParts[2] = e.target.value
                      options[index] = newParts.join('|')
                      onUpdate({ options })
                    }}
                    className="text-sm min-h-[60px]"
                  />
                </div>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const options = [...(question.options || []), 'New User|5|Great experience!|NU']
              onUpdate({ options })
            }}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add testimonial
          </Button>
        </div>
      )}

      {question.type === 'media' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="media-type" className="text-sm font-medium mb-2 block">Media type</Label>
            <Select
              value={question.options?.[0] || 'image'}
              onValueChange={(value) => {
                const options = [value]
                onUpdate({ options })
              }}
            >
              <SelectTrigger id="media-type" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="media-url" className="text-sm font-medium">Media URL</Label>
            <Input
              id="media-url"
              type="url"
              value={question.placeholder || ''}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Enter the URL of the image or video</p>
          </div>
        </div>
      )}

      {question.type === 'timer' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="timer-duration" className="text-sm font-medium">Duration (seconds)</Label>
            <Input
              id="timer-duration"
              type="number"
              value={question.minValue || 60}
              onChange={(e) => onUpdate({ minValue: parseInt(e.target.value) || 60 })}
              min={1}
              max={3600}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Timer will countdown from this value</p>
          </div>
          <div>
            <Label htmlFor="timer-message" className="text-sm font-medium">End message</Label>
            <Input
              id="timer-message"
              type="text"
              value={question.placeholder || ''}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              placeholder="Time is up!"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Message shown when timer reaches zero</p>
          </div>
          <div>
            <Label htmlFor="timer-action" className="text-sm font-medium mb-2 block">Action when timer ends</Label>
            <Select
              value={question.options?.[0] || 'auto_advance'}
              onValueChange={(value) => {
                const options = [value]
                onUpdate({ options })
              }}
            >
              <SelectTrigger id="timer-action" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto_advance">Auto advance to next screen</SelectItem>
                <SelectItem value="show_message">Show message only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Required toggle (only for questions, not flow screens) */}
      {!isFlowScreen && (
        <>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Required</Label>
              <p className="text-xs text-muted-foreground">Respondents must answer this question</p>
            </div>
            <Switch
              checked={question.required}
              onCheckedChange={(checked) => onUpdate({ required: checked })}
            />
          </div>
        </>
      )}

      <Separator />

      {/* Delete button */}
      <Button
        variant="outline"
        onClick={onDelete}
        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete question
      </Button>
          </div>
        </div>
      )}

      {activeTab === 'style' && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <QuestionStyleEditor
            style={questionStyle}
            onUpdate={handleStyleUpdate}
          />
        </div>
      )}

      {activeTab === 'logic' && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6 space-y-6">
            {/* Auto-advance */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Enable auto-advance</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically advance to the next screen
                  </p>
                </div>
                <Switch
                  checked={logic.autoAdvance?.enabled || false}
                  onCheckedChange={(checked) => 
                    handleLogicUpdate({ 
                      autoAdvance: { 
                        ...logic.autoAdvance, 
                        enabled: checked,
                        delaySeconds: logic.autoAdvance?.delaySeconds || 3
                      } 
                    })
                  }
                />
              </div>
              
              {logic.autoAdvance?.enabled && (
                <div>
                  <Label htmlFor="delay-seconds" className="text-sm font-medium">
                    Delay (seconds)
                  </Label>
                  <Input
                    id="delay-seconds"
                    type="number"
                    value={logic.autoAdvance?.delaySeconds || 3}
                    onChange={(e) => 
                      handleLogicUpdate({ 
                        autoAdvance: { 
                          ...logic.autoAdvance, 
                          enabled: true,
                          delaySeconds: parseInt(e.target.value) || 3
                        } 
                      })
                    }
                    min={1}
                    max={60}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How long to wait before advancing to the next screen
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Navigation behavior */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Navigation behavior</Label>
              
              <div>
                <Label htmlFor="on-button-click" className="text-sm font-medium">
                  On button click (or auto-advance), go to:
                </Label>
                <Select
                  value={logic.navigationBehavior?.onButtonClick || 'next_screen'}
                  onValueChange={(value: NavigationTarget) => 
                    handleLogicUpdate({ 
                      navigationBehavior: { 
                        ...logic.navigationBehavior, 
                        onButtonClick: value 
                      } 
                    })
                  }
                >
                  <SelectTrigger id="on-button-click" className="mt-2 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="next_screen">Next screen</SelectItem>
                    <SelectItem value="previous_screen">Previous screen</SelectItem>
                    <SelectItem value="specific_screen">Specific screen</SelectItem>
                    <SelectItem value="end_form">End form</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Define what happens when user clicks the button
                </p>
              </div>

              {logic.navigationBehavior?.onButtonClick === 'specific_screen' && (
                <div>
                  <Label htmlFor="target-screen" className="text-sm font-medium">
                    Select screen:
                  </Label>
                  <Select
                    value={logic.navigationBehavior?.targetScreenId || ''}
                    onValueChange={(value) => 
                      handleLogicUpdate({ 
                        navigationBehavior: { 
                          ...logic.navigationBehavior, 
                          targetScreenId: value 
                        } 
                      })
                    }
                  >
                    <SelectTrigger id="target-screen" className="mt-2 w-full">
                      <SelectValue placeholder="Select a screen" />
                    </SelectTrigger>
                    <SelectContent>
                      {questions
                        .filter(q => q.id !== question.id)
                        .map((q) => (
                          <SelectItem key={q.id} value={q.id}>
                            {q.title || `Untitled (${q.type})`}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
