import { createClient } from '@/lib/supabase/server'
import { FormPlayer } from '@/components/form-player/form-player'
import { Form } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

interface FormPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: FormPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('forms')
    .select('title, description')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  const form = data as { title: string; description: string | null } | null

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
  const supabase = await createClient()

  // Create mock form if not found
  const mockForm: Form = {
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

  const { data } = await supabase
    .from('forms')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  const form = (data as Form | null) || mockForm

  return <FormPlayer form={form} />
}

