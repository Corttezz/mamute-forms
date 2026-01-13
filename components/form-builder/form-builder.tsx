'use client'

import { useState, useCallback, useEffect } from 'react'
import { Form, QuestionConfig, FormStatus } from '@/lib/database.types'
import { mockData } from '@/lib/mock-data'
import { questionTypes, flowScreens, contentScreens, createDefaultQuestion, getQuestionTypeInfo } from '@/lib/questions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Save,
  Globe,
  ExternalLink,
  Copy,
  FileText,
  Pencil,
  BarChart3,
  Plug,
  X,
  Home,
  ArrowRight,
  Info,
  Share2,
  Check,
  Link2,
} from 'lucide-react'
import Link from 'next/link'
import { QuestionEditor } from './question-editor'
import { FormPreview } from './form-preview'
import { UpgradeBanner } from '@/components/upgrade/upgrade-banner'
import { encodeFormToURL } from '@/lib/form-serializer'

interface FormBuilderProps {
  form: Form
}

export function FormBuilder({ form: initialForm }: FormBuilderProps) {
  const [form, setForm] = useState(initialForm)
  const [questions, setQuestions] = useState<QuestionConfig[]>(
    (initialForm.questions as QuestionConfig[]) || []
  )
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [activeMainTab, setActiveMainTab] = useState('content')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId)

  // Ensure form exists in client-side mockData storage
  useEffect(() => {
    // Check if form exists in client storage, if not, create it
    const existingForm = mockData.forms.getById(initialForm.id)
    if (!existingForm) {
      mockData.forms.create(initialForm)
    }
  }, [initialForm])

  // Generate shareable link with form data embedded in URL
  const generateShareLink = useCallback(() => {
    const formWithQuestions: Form = {
      ...form,
      questions: questions,
    }
    const encoded = encodeFormToURL(formWithQuestions)
    const baseURL = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseURL}/s/${encoded}`
  }, [form, questions])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    const updated = mockData.forms.update(form.id, {
      title: form.title,
      description: form.description,
      slug: form.slug,
      questions: questions,
      thank_you_message: form.thank_you_message,
    })

    if (!updated) {
      toast.error('Failed to save form')
    } else {
      setForm(updated)
      toast.success('Form saved')
      setHasUnsavedChanges(false)
    }
    setIsSaving(false)
  }, [form, questions])

  const handlePublish = async () => {
    if (questions.length === 0) {
      toast.error('Add at least one question before publishing')
      return
    }

    setIsSaving(true)
    const newStatus: FormStatus = form.status === 'published' ? 'closed' : 'published'
    
    const updated = mockData.forms.update(form.id, {
      status: newStatus,
      questions: questions,
      title: form.title,
      description: form.description,
      slug: form.slug,
      thank_you_message: form.thank_you_message,
    })

    if (!updated) {
      toast.error('Failed to update form status')
    } else {
      setForm(updated)
      
      if (newStatus === 'published') {
        // Generate shareable link
        const link = generateShareLink()
        setGeneratedLink(link)
        setShowPublishDialog(false)
        setShowShareDialog(true)
        toast.success('Form published!')
      } else {
        toast.success('Form unpublished')
        setShowPublishDialog(false)
      }
      setHasUnsavedChanges(false)
    }
    setIsSaving(false)
  }

  const handlePreview = () => {
    const link = generateShareLink()
    window.open(link, '_blank')
  }

  const copyShareLink = () => {
    const link = generatedLink || generateShareLink()
    navigator.clipboard.writeText(link)
    toast.success('Link copied to clipboard!')
  }

  const addQuestion = (type: QuestionConfig['type']) => {
    const newQuestion = createDefaultQuestion(type)
    
    // Inherit styles from the currently selected question (or the last question)
    const sourceQuestion = selectedQuestion || questions[questions.length - 1]
    if (sourceQuestion?.style) {
      newQuestion.style = { ...sourceQuestion.style }
    }
    
    setQuestions([...questions, newQuestion])
    setSelectedQuestionId(newQuestion.id)
    setShowAddQuestion(false)
    setHasUnsavedChanges(true)
  }

  const updateQuestion = (id: string, updates: Partial<QuestionConfig>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ))
    setHasUnsavedChanges(true)
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
    if (selectedQuestionId === id) {
      setSelectedQuestionId(null)
    }
    setHasUnsavedChanges(true)
  }

  const handleReorder = (newOrder: QuestionConfig[]) => {
    setQuestions(newOrder)
    setHasUnsavedChanges(true)
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div className="group relative flex items-center">
            <Input
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value })
                setHasUnsavedChanges(true)
              }}
              className="text-lg font-semibold border-0 border-b-2 border-transparent bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-primary hover:border-border px-1 pr-7 max-w-xs transition-colors"
              placeholder="Untitled Form"
            />
            <Pencil className="w-3.5 h-3.5 text-muted-foreground absolute right-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-0 transition-opacity pointer-events-none" />
          </div>
          {form.status === 'published' && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Published</Badge>
          )}
          {form.status === 'draft' && (
            <Badge variant="secondary">Draft</Badge>
          )}
          {form.status === 'closed' && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Closed</Badge>
          )}
          {hasUnsavedChanges && (
            <span className="text-sm text-muted-foreground">Unsaved changes</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Preview button - always available */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePreview}
            disabled={questions.length === 0}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          {form.status === 'published' && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            size="sm"
            onClick={() => setShowPublishDialog(true)}
            className={form.status === 'published' 
              ? 'bg-amber-500 hover:bg-amber-600' 
              : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
            }
          >
            <Globe className="w-4 h-4 mr-2" />
            {form.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card">
        <div className="px-4">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveMainTab('content')}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeMainTab === 'content'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }
              `}
            >
              Content
            </button>
            <button
              onClick={() => setActiveMainTab('results')}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeMainTab === 'results'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }
              `}
            >
              Results
            </button>
            <button
              onClick={() => setActiveMainTab('settings')}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeMainTab === 'settings'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }
              `}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveMainTab('connect')}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeMainTab === 'connect'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }
              `}
            >
              Connect
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      {activeMainTab === 'content' && (
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-card border-r border-border flex flex-col shrink-0 overflow-hidden" style={{ width: '320px', maxWidth: '320px' }}>
          <div className="shrink-0 px-6 pt-6 pb-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Screens</h2>
            <p className="text-sm text-muted-foreground">Manage your form flow</p>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden min-h-0 w-full" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="flex-1 min-h-0 overflow-hidden w-full max-w-full" style={{ width: '100%', maxWidth: '100%' }}>
              <ScrollArea className="h-full w-full max-w-full" style={{ width: '100%', maxWidth: '100%' }}>
                <div className="p-2 w-full max-w-full overflow-hidden box-border" style={{ width: '100%', maxWidth: '100%', padding: '8px' }}>
                {questions.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No screens yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Add your first screen to get started</p>
                  </div>
                ) : (
                  <div className="w-full max-w-full overflow-hidden" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                    <Reorder.Group axis="y" values={questions} onReorder={handleReorder} className="w-full" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                      <AnimatePresence>
                        {questions.map((question, index) => (
                          <Reorder.Item 
                            key={question.id}
                            value={question} 
                            className="w-full"
                            data-reorder-item
                            style={{ 
                              width: '100%', 
                              maxWidth: '100%', 
                              boxSizing: 'border-box',
                              overflow: 'hidden',
                              contain: 'layout'
                            } as React.CSSProperties}
                          >
                            <motion.div
                              layout={false}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className={`
                                group p-3 rounded-lg cursor-pointer mb-2 border transition-all w-full overflow-hidden
                                ${selectedQuestionId === question.id 
                                  ? 'bg-primary/10 border-primary/20' 
                                  : 'bg-background border-border hover:border-border/80'
                                }
                              `}
                              style={{ 
                                width: '100%', 
                                maxWidth: '100%', 
                                boxSizing: 'border-box', 
                                overflow: 'hidden',
                                wordBreak: 'break-word'
                              } as React.CSSProperties}
                              onClick={() => setSelectedQuestionId(question.id)}
                            >
                                <div className="flex items-start gap-2 w-full min-w-0" style={{ width: '100%', maxWidth: '100%' }}>
                                  <div className="mt-1 cursor-grab active:cursor-grabbing flex-shrink-0">
                                    <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                                  </div>
                                  <div className="flex-1 min-w-0 overflow-hidden" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-muted-foreground flex-shrink-0">
                                        {index + 1}
                                      </span>
                                      <span className="text-xs text-muted-foreground capitalize flex-shrink-0">
                                        {question.type.replace('_', ' ')}
                                      </span>
                                      {question.required && (
                                        <span className="text-xs text-red-500 flex-shrink-0">*</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 min-w-0" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
                                      {(() => {
                                        const typeInfo = getQuestionTypeInfo(question.type)
                                        const Icon = typeInfo?.icon
                                        if (Icon) {
                                          return <Icon className="w-4 h-4 text-foreground flex-shrink-0" />
                                        }
                                        return null
                                      })()}
                                      <p className="text-sm font-medium text-foreground truncate min-w-0 flex-1" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, maxWidth: '100%' }}>
                                        {question.title || 'Untitled question'}
                                      </p>
                                    </div>
                                    {question.description && (
                                      <p className="text-xs text-muted-foreground truncate mt-0.5 min-w-0" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, maxWidth: '100%' }}>
                                        {question.description}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 flex-shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteQuestion(question.id)
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                                  </Button>
                                </div>
                              </motion.div>
                            </Reorder.Item>
                        ))}
                      </AnimatePresence>
                    </Reorder.Group>
                  </div>
                )}
                </div>
              </ScrollArea>
            </div>
            
            <div className="shrink-0 px-4 py-4 border-t border-border">
              <Button 
                onClick={() => setShowAddQuestion(true)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add screen
              </Button>
            </div>
          </div>


        </aside>

        {/* Preview / Editor area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview */}
          <div className="flex-1 overflow-auto bg-muted/30 p-8 flex flex-col">
            <div className="max-w-2xl mx-auto flex-1 flex flex-col min-h-0 w-full">
              <div className="rounded-lg shadow-sm border border-border overflow-hidden mb-4 flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-2 px-4 py-2 bg-muted border-b border-border flex-shrink-0">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Preview</span>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <FormPreview 
                    questions={questions}
                    selectedQuestionId={selectedQuestionId}
                    onSelectQuestion={setSelectedQuestionId}
                  />
                </div>
              </div>
              
              {/* Upgrade Banner */}
              <div className="max-w-5xl mx-auto flex justify-center mt-4 flex-shrink-0">
                <UpgradeBanner />
              </div>
            </div>
          </div>

          {/* Question Editor - Right side */}
          {selectedQuestion && (
            <div className="w-96 bg-card border-l border-border overflow-hidden shrink-0 flex flex-col h-full">
              <QuestionEditor
                question={selectedQuestion}
                questions={questions}
                onUpdate={(updates) => updateQuestion(selectedQuestion.id, updates)}
                onDelete={() => deleteQuestion(selectedQuestion.id)}
              />
            </div>
          )}
        </div>
      </div>
      )}

      {activeMainTab === 'results' && (
        <div className="flex-1 flex items-center justify-center bg-muted/30">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Results</h3>
            <p className="text-muted-foreground">View and analyze form responses here</p>
            <Link href={`/forms/${form.id}/responses`}>
              <Button className="mt-4">
                View Responses
              </Button>
            </Link>
          </div>
        </div>
      )}

      {activeMainTab === 'settings' && (
        <div className="flex-1 overflow-auto bg-muted/30 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Form Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="form-slug" className="text-sm font-medium">Form URL</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">/f/</span>
                      <Input
                        id="form-slug"
                        value={form.slug}
                        onChange={(e) => {
                          const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                          setForm({ ...form, slug })
                          setHasUnsavedChanges(true)
                        }}
                        className="flex-1"
                        placeholder="my-form"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="form-description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="form-description"
                      value={form.description || ''}
                      onChange={(e) => {
                        setForm({ ...form, description: e.target.value })
                        setHasUnsavedChanges(true)
                      }}
                      className="mt-2"
                      placeholder="Optional form description..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="form-thank-you" className="text-sm font-medium">Thank You Message</Label>
                    <Textarea
                      id="form-thank-you"
                      value={form.thank_you_message}
                      onChange={(e) => {
                        setForm({ ...form, thank_you_message: e.target.value })
                        setHasUnsavedChanges(true)
                      }}
                      className="mt-2"
                      placeholder="Thank you for your response!"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMainTab === 'connect' && (
        <div className="flex-1 flex items-center justify-center bg-muted/30">
          <div className="text-center">
            <Plug className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Connect</h3>
            <p className="text-muted-foreground">Integrate your form with external services</p>
            <p className="text-sm text-muted-foreground/70 mt-2">Coming soon</p>
          </div>
        </div>
      )}

      {/* Add Screen Dialog */}
      <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
        <DialogContent className="max-w-[70vw] w-[70vw] max-h-[85vh] overflow-hidden flex flex-col p-0" showCloseButton={false}>
          {/* Header with white background */}
          <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <DialogTitle className="text-foreground text-xl font-semibold">Add Screen</DialogTitle>
            <button
              onClick={() => setShowAddQuestion(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Subtitle */}
          <div className="px-6 pt-4 pb-2">
            <DialogDescription className="text-muted-foreground">
              Choose a screen type to add to your form flow
            </DialogDescription>
          </div>

          {/* Content with scroll */}
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            {/* Flow Screens */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-foreground mb-3">Flow Screens</h3>
              <div className="grid grid-cols-4 gap-3">
                {flowScreens.map((screen) => (
                  <button
                    key={screen.type}
                    onClick={() => {
                      addQuestion(screen.type)
                      setShowAddQuestion(false)
                    }}
                    className="p-4 rounded-lg border border-border hover:border-blue-500 hover:bg-blue-500/10 transition-all text-left group"
                  >
                    {screen.type === 'welcome' ? (
                      <div className="relative w-6 h-6 mb-2">
                        <Home className="w-5 h-5 text-blue-500 absolute" />
                        <ArrowRight className="w-3 h-3 text-blue-500 absolute right-0 bottom-0" />
                      </div>
                    ) : (
                      <screen.icon className={`w-6 h-6 mb-2 ${
                        screen.type === 'loading' || screen.type === 'result' ? 'text-purple-500' :
                        'text-muted-foreground'
                      } group-hover:scale-110 transition-transform`} />
                    )}
                    <p className="font-medium text-sm text-foreground">{screen.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{screen.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Screens */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-foreground mb-3">Question Screens</h3>
              <div className="grid grid-cols-4 gap-3">
                {questionTypes.map((qt) => (
                  <button
                    key={qt.type}
                    onClick={() => {
                      addQuestion(qt.type)
                      setShowAddQuestion(false)
                    }}
                    className="p-4 rounded-lg border border-border hover:border-border/80 hover:bg-muted transition-all text-left group"
                  >
                    <qt.icon className="w-6 h-6 text-muted-foreground group-hover:text-foreground mb-2" />
                    <p className="font-medium text-sm text-foreground">{qt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{qt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Screens */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Content Screens</h3>
              <div className="grid grid-cols-4 gap-3">
                {contentScreens.map((screen) => (
                  <button
                    key={screen.type}
                    onClick={() => {
                      addQuestion(screen.type)
                      setShowAddQuestion(false)
                    }}
                    className="p-4 rounded-lg border border-border hover:border-orange-500 hover:bg-orange-500/10 transition-all text-left group"
                  >
                    <screen.icon className={`w-6 h-6 mb-2 ${
                      screen.type === 'media' ? 'text-pink-500' : 'text-orange-500'
                    } group-hover:scale-110 transition-transform`} />
                    <p className="font-medium text-sm text-foreground">{screen.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{screen.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-3 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>Selection adds screen immediately</span>
            </div>
            <div className="text-xs text-muted-foreground/70 font-medium">
              FoxForm Builder
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {form.status === 'published' ? 'Unpublish form?' : 'Publish form?'}
            </DialogTitle>
            <DialogDescription>
              {form.status === 'published' 
                ? 'This will make your form inaccessible to respondents. Existing responses will be kept.'
                : 'Your form will be published and you will get a shareable link.'
              }
            </DialogDescription>
          </DialogHeader>
          {form.status !== 'published' && (
            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-slate-600">
                <Link2 className="w-4 h-4" />
                <span className="text-sm font-medium">A unique shareable link will be generated</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-sm">All form data embedded in the URL</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-sm">No backend required - works instantly</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePublish}
              disabled={isSaving || questions.length === 0}
              className={form.status === 'published' 
                ? 'bg-amber-500 hover:bg-amber-600' 
                : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
              }
            >
              {isSaving ? 'Publishing...' : form.status === 'published' ? 'Unpublish' : 'Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog - shown after publishing */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Form Published!</DialogTitle>
                <DialogDescription className="mt-1">
                  Your form is ready to be shared
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Shareable Link
              </Label>
              <div className="flex gap-2">
                <Input 
                  value={generatedLink || generateShareLink()} 
                  readOnly 
                  className="flex-1 text-sm bg-slate-50 font-mono"
                />
                <Button onClick={copyShareLink} className="shrink-0">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                This link contains all form data and works without a database
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    const link = generatedLink || generateShareLink()
                    window.open(link, '_blank')
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Form
                </Button>
                <Button 
                  className="flex-1 bg-primary"
                  onClick={() => setShowShareDialog(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
