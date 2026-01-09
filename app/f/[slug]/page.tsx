import { FormPlayer } from '@/components/form-player/form-player'
import { Form } from '@/lib/database.types'
import { mockData } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

interface FormPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: FormPageProps) {
  const { slug } = await params
  const form = mockData.forms.getBySlug(slug, 'published')

  if (!form) {
    return { title: 'Form' }
  }

  return {
    title: form.title || 'Form',
    description: form.description || 'Fill out this form',
  }
}

export default async function FormPage({ params }: FormPageProps) {
  const { slug } = await params

  // Get form by slug, or create mock form if not found
  let form = mockData.forms.getBySlug(slug, 'published')

  if (!form) {
    // Create mock form if not found
    form = {
      id: 'mock-form-id',
      user_id: 'mock-user-id',
      title: 'Sample Form',
      description: 'This is a sample form',
      slug: slug,
      status: 'published',
      theme: 'minimal',
      questions: [
        {
          id: 'q1',
          type: 'short_text',
          title: 'What is your name?',
          required: true,
        },
      ],
      thank_you_message: 'Thank you for your response!',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  return <FormPlayer form={form} />
}

