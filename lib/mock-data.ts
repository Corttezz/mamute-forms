// Simple mock data for frontend-only interface
import { Form, Response, QuestionConfig } from './database.types'

// Mock user
export const mockUser = {
  id: 'mock-user-id',
  email: 'user@example.com',
  user_metadata: {
    full_name: 'Mock User',
    avatar_url: null,
  },
}

// In-memory storage (will be replaced by AWS backend)
const formsStorage = new Map<string, Form>()
const responsesStorage = new Map<string, Response>()

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Initialize with some mock data
const mockForm: Form = {
  id: 'mock-form-1',
  user_id: mockUser.id,
  title: 'Sample Form',
  description: 'This is a sample form',
  slug: 'sample-form',
  status: 'published',
  theme: 'minimal',
  questions: [
    {
      id: 'q1',
      type: 'welcome',
      title: 'Welcome',
      description: 'Welcome to our survey',
      required: false,
      buttonText: 'Start',
    },
    {
      id: 'q2',
      type: 'short_text',
      title: 'What is your name?',
      required: true,
    },
  ] as QuestionConfig[],
  thank_you_message: 'Thank you for your response!',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

formsStorage.set(mockForm.id, mockForm)

export const mockData = {
  // Forms operations
  forms: {
    getAll: (userId: string): Form[] => {
      return Array.from(formsStorage.values()).filter(f => f.user_id === userId)
    },
    getById: (id: string): Form | null => {
      return formsStorage.get(id) || null
    },
    getBySlug: (slug: string, status?: string): Form | null => {
      for (const form of formsStorage.values()) {
        if (form.slug === slug && (!status || form.status === status)) {
          return form
        }
      }
      return null
    },
    create: (data: Partial<Form>): Form => {
      const now = new Date().toISOString()
      const form: Form = {
        id: data.id || generateId(),
        user_id: data.user_id || mockUser.id,
        title: data.title || 'Untitled Form',
        description: data.description || null,
        slug: data.slug || `form-${generateId()}`,
        status: data.status || 'draft',
        theme: data.theme || 'minimal',
        questions: data.questions || [],
        thank_you_message: data.thank_you_message || 'Thank you for your response!',
        created_at: data.created_at || now,
        updated_at: now,
      }
      formsStorage.set(form.id, form)
      return form
    },
    update: (id: string, data: Partial<Form>): Form | null => {
      const existing = formsStorage.get(id)
      if (!existing) return null
      const updated: Form = {
        ...existing,
        ...data,
        updated_at: new Date().toISOString(),
      }
      formsStorage.set(id, updated)
      return updated
    },
    delete: (id: string): boolean => {
      // Also delete all responses for this form
      for (const [responseId, response] of responsesStorage.entries()) {
        if (response.form_id === id) {
          responsesStorage.delete(responseId)
        }
      }
      return formsStorage.delete(id)
    },
  },
  // Responses operations
  responses: {
    getByFormId: (formId: string): Response[] => {
      return Array.from(responsesStorage.values())
        .filter(r => r.form_id === formId)
        .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    },
    create: (data: Partial<Response>): Response => {
      const now = new Date().toISOString()
      const response: Response = {
        id: data.id || generateId(),
        form_id: data.form_id || '',
        answers: data.answers || {},
        submitted_at: data.submitted_at || now,
      }
      responsesStorage.set(response.id, response)
      return response
    },
    delete: (id: string): boolean => {
      return responsesStorage.delete(id)
    },
  },
}


