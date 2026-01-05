import { createClient } from '@/lib/supabase/server'
import { FormBuilder } from '@/components/form-builder/form-builder'
import { Form } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

interface EditFormPageProps {
  params: Promise<{ id: string }>
}

export default async function EditFormPage({ params }: EditFormPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Create mock form if not found
  const mockForm: Form = {
    id: id,
    user_id: user?.id || 'mock-user-id',
    title: 'Untitled Form',
    description: null,
    slug: 'untitled-form',
    status: 'draft',
    theme: 'minimal',
    questions: [],
    thank_you_message: 'Thank you for your response!',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Try to get form, but use mock if not found
  const { data } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single()

  const form = (data as Form | null) || mockForm

  return <FormBuilder form={form} />
}

