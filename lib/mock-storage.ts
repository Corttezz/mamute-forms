// Mock storage for forms and responses - persists data in memory
import { Form, Response, FormInsert, FormUpdate, ResponseInsert } from '@/lib/database.types'

// In-memory storage
const formsStorage = new Map<string, Form>()
const responsesStorage = new Map<string, Response>()

// Helper to generate ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Forms operations
export const mockStorage = {
  forms: {
    // Get all forms for a user
    getAll: (userId: string): Form[] => {
      return Array.from(formsStorage.values()).filter(f => f.user_id === userId)
    },

    // Get form by ID
    getById: (id: string): Form | null => {
      return formsStorage.get(id) || null
    },

    // Get form by slug (searches all forms, not just user's)
    getBySlug: (slug: string, status?: string): Form | null => {
      for (const form of formsStorage.values()) {
        if (form.slug === slug && (!status || form.status === status)) {
          return form
        }
      }
      return null
    },

    // Get all forms (for published forms lookup)
    getAllForms: (): Form[] => {
      return Array.from(formsStorage.values())
    },

    // Create form
    create: (data: FormInsert): Form => {
      const now = new Date().toISOString()
      const form: Form = {
        id: data.id || generateId(),
        user_id: data.user_id,
        title: data.title || 'Untitled Form',
        description: data.description || null,
        slug: data.slug,
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

    // Update form
    update: (id: string, data: FormUpdate): Form | null => {
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

    // Delete form
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

  responses: {
    // Get all responses for a form
    getByFormId: (formId: string): Response[] => {
      return Array.from(responsesStorage.values())
        .filter(r => r.form_id === formId)
        .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    },

    // Get response by ID
    getById: (id: string): Response | null => {
      return responsesStorage.get(id) || null
    },

    // Create response
    create: (data: ResponseInsert): Response => {
      const now = new Date().toISOString()
      const response: Response = {
        id: data.id || generateId(),
        form_id: data.form_id,
        answers: data.answers,
        submitted_at: data.submitted_at || now,
      }
      responsesStorage.set(response.id, response)
      return response
    },

    // Delete response
    delete: (id: string): boolean => {
      return responsesStorage.delete(id)
    },
  },
}

