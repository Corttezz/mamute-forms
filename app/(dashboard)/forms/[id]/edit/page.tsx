import { FormBuilder } from '@/components/form-builder/form-builder'
import { Form } from '@/lib/database.types'
import { mockData, mockUser } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

interface EditFormPageProps {
  params: Promise<{ id: string }>
}

export default async function EditFormPage({ params }: EditFormPageProps) {
  const { id } = await params

  // Get form from mock data or create new one
  let form = mockData.forms.getById(id)
  
  if (!form) {
    // Create new form if not found
    form = mockData.forms.create({
      id: id,
      user_id: mockUser.id,
      title: 'Untitled Form',
      description: null,
      slug: `form-${id}`,
      status: 'draft',
      theme: 'minimal',
      questions: [],
      thank_you_message: 'Thank you for your response!',
    })
  }

  return <FormBuilder form={form} />
}

