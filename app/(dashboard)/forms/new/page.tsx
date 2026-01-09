import { redirect } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { mockData, mockUser } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

function generateSlug(): string {
  // Generate a short random slug
  return Math.random().toString(36).substring(2, 10)
}

export default async function NewFormPage() {
  // Create a new form
  const formId = uuidv4()
  const slug = generateSlug()

  const newForm = mockData.forms.create({
    id: formId,
    user_id: mockUser.id,
    title: 'Untitled Form',
    slug: slug,
    status: 'draft',
    theme: 'minimal',
    questions: [],
    thank_you_message: 'Thank you for your response!',
  })

  // Redirect to the form editor
  redirect(`/forms/${newForm.id}/edit`)
}

