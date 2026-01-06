'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Form, QuestionConfig, FormStatus } from '@/lib/database.types'
import { questionTypes, createDefaultQuestion } from '@/lib/questions'
import { getTheme, themes } from '@/lib/themes'
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
} from 'lucide-react'
import Link from 'next/link'
import { QuestionEditor } from './question-editor'
import { FormPreview } from './form-preview'

interface FormBuilderProps {
  form: Form
}

export function FormBuilder({ form: initialForm }: FormBuilderProps) {
  const supabase = createClient()
  
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

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId)
  
  // Get theme for selected question
  const getSelectedQuestionTheme = () => {
    if (!selectedQuestion) return themes.minimal
    const questionTheme = selectedQuestion.style?.theme || 'minimal'
    return getTheme(questionTheme)
  }
  
  const previewTheme = getSelectedQuestionTheme()

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    const updateData = {
      title: form.title,
      description: form.description,
      slug: form.slug,
      questions: questions,
      thank_you_message: form.thank_you_message,
    }
    const { error } = await supabase
      .from('forms')
      .update(updateData as never)
      .eq('id', form.id)

    if (error) {
      toast.error('Failed to save form')
    } else {
      toast.success('Form saved')
      setHasUnsavedChanges(false)
    }
    setIsSaving(false)
  }, [supabase, form, questions])

  const handlePublish = async () => {
    if (questions.length === 0) {
      toast.error('Add at least one question before publishing')
      return
    }

    setIsSaving(true)
    const newStatus: FormStatus = form.status === 'published' ? 'closed' : 'published'
    
    const updateData = {
      status: newStatus,
      questions: questions,
      title: form.title,
      description: form.description,
      slug: form.slug,
      thank_you_message: form.thank_you_message,
    }
    const { error } = await supabase
      .from('forms')
      .update(updateData as never)
      .eq('id', form.id)

    if (error) {
      toast.error('Failed to update form status')
    } else {
      setForm({ ...form, status: newStatus })
      toast.success(newStatus === 'published' ? 'Form published!' : 'Form unpublished')
      setShowPublishDialog(false)
      setHasUnsavedChanges(false)
    }
    setIsSaving(false)
  }

  const addQuestion = (type: QuestionConfig['type']) => {
    const newQuestion = createDefaultQuestion(type)
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

  const copyFormLink = () => {
    const link = `${window.location.origin}/f/${form.slug}`
    navigator.clipboard.writeText(link)
    toast.success('Link copied to clipboard')
  }


  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
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
              className="text-lg font-semibold border-0 border-b-2 border-transparent bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-primary hover:border-slate-300 px-1 pr-7 max-w-xs transition-colors"
              placeholder="Untitled Form"
            />
            <Pencil className="w-3.5 h-3.5 text-slate-400 absolute right-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-0 transition-opacity pointer-events-none" />
          </div>
          {form.status === 'published' && (
            <Badge className="bg-emerald-100 text-emerald-700">Published</Badge>
          )}
          {form.status === 'draft' && (
            <Badge variant="secondary">Draft</Badge>
          )}
          {form.status === 'closed' && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">Closed</Badge>
          )}
          {hasUnsavedChanges && (
            <span className="text-sm text-slate-500">Unsaved changes</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {form.status === 'published' && (
            <>
              <Button variant="outline" size="sm" onClick={copyFormLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy link
              </Button>
              <Link href={`/f/${form.slug}`} target="_blank">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View
                </Button>
              </Link>
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
      <div className="border-b border-slate-200 bg-white">
        <div className="px-4">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveMainTab('content')}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeMainTab === 'content'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
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
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
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
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
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
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
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
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
          <div className="shrink-0 px-6 pt-6 pb-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 ">Screens</h2>
            <p className="text-sm text-slate-600">Manage your form flow</p>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-2">
                {questions.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm text-slate-500">No screens yet</p>
                    <p className="text-xs text-slate-400 mt-1">Add your first screen to get started</p>
                  </div>
                ) : (
                  <Reorder.Group axis="y" values={questions} onReorder={handleReorder}>
                    <AnimatePresence>
                      {questions.map((question, index) => (
                        <Reorder.Item key={question.id} value={question}>
                          <motion.div
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`
                              group p-3 rounded-lg cursor-pointer mb-2 border transition-all
                              ${selectedQuestionId === question.id 
                                ? 'bg-primary/10 border-primary/20' 
                                : 'bg-white border-slate-100 hover:border-slate-200'
                              }
                            `}
                            onClick={() => setSelectedQuestionId(question.id)}
                          >
                            <div className="flex items-start gap-2">
                              <div className="mt-1 cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-4 h-4 text-slate-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-slate-400">
                                    {index + 1}
                                  </span>
                                  <span className="text-xs text-slate-400 capitalize">
                                    {question.type.replace('_', ' ')}
                                  </span>
                                  {question.required && (
                                    <span className="text-xs text-red-500">*</span>
                                  )}
                                </div>
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {question.title || 'Untitled question'}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteQuestion(question.id)
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                              </Button>
                            </div>
                          </motion.div>
                        </Reorder.Item>
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                )}
              </div>
            </ScrollArea>
            
            <div className="shrink-0 px-4 py-4 border-t border-slate-200">
              <Button 
                onClick={() => setShowAddQuestion(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
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
          <div className="flex-1 overflow-auto bg-slate-100 p-8">
            <div className="max-w-2xl mx-auto">
              <div className="rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600">Preview</span>
                </div>
                <div 
                  className="min-h-[500px] transition-colors"
                  style={{ backgroundColor: previewTheme.backgroundColor }}
                >
                  <FormPreview 
                    questions={questions}
                    selectedQuestionId={selectedQuestionId}
                    onSelectQuestion={setSelectedQuestionId}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Question Editor - Right side */}
          {selectedQuestion && (
            <div className="w-96 bg-white border-l border-slate-200 overflow-hidden shrink-0 flex flex-col">
              <QuestionEditor
                question={selectedQuestion}
                onUpdate={(updates) => updateQuestion(selectedQuestion.id, updates)}
                onDelete={() => deleteQuestion(selectedQuestion.id)}
              />
            </div>
          )}
        </div>
      </div>
      )}

      {activeMainTab === 'results' && (
        <div className="flex-1 flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Results</h3>
            <p className="text-slate-600">View and analyze form responses here</p>
            <Link href={`/forms/${form.id}/responses`}>
              <Button className="mt-4">
                View Responses
              </Button>
            </Link>
          </div>
        </div>
      )}

      {activeMainTab === 'settings' && (
        <div className="flex-1 overflow-auto bg-slate-50 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Form Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="form-slug" className="text-sm font-medium">Form URL</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-slate-500">/f/</span>
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
        <div className="flex-1 flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <Plug className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Connect</h3>
            <p className="text-slate-600">Integrate your form with external services</p>
            <p className="text-sm text-slate-500 mt-2">Coming soon</p>
          </div>
        </div>
      )}

      {/* Add Question Dialog */}
      <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Question</DialogTitle>
            <DialogDescription>
              Choose a question type to add to your form
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            {questionTypes.map((qt) => (
              <button
                key={qt.type}
                onClick={() => addQuestion(qt.type)}
                className="p-4 rounded-lg border border-slate-200 hover:border-primary/30 hover:bg-primary/10 transition-all text-left group"
              >
                <qt.icon className="w-6 h-6 text-slate-400 group-hover:text-primary mb-2" />
                <p className="font-medium text-sm text-slate-900">{qt.label}</p>
                <p className="text-xs text-slate-500 mt-1">{qt.description}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.status === 'published' ? 'Unpublish form?' : 'Publish form?'}
            </DialogTitle>
            <DialogDescription>
              {form.status === 'published' 
                ? 'This will make your form inaccessible to respondents. Existing responses will be kept.'
                : 'Your form will be accessible at:'
              }
            </DialogDescription>
          </DialogHeader>
          {form.status !== 'published' && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <code className="text-sm text-primary">
                {typeof window !== 'undefined' ? window.location.origin : ''}/f/{form.slug}
              </code>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePublish}
              disabled={isSaving}
              className={form.status === 'published' 
                ? 'bg-amber-500 hover:bg-amber-600' 
                : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
              }
            >
              {isSaving ? 'Saving...' : form.status === 'published' ? 'Unpublish' : 'Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
