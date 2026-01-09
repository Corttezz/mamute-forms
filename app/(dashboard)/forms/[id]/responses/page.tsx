import { ResponsesDashboard } from '@/components/responses/responses-dashboard'
import { mockData, mockUser } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

interface ResponsesPageProps {
  params: Promise<{ id: string }>
}

export default async function ResponsesPage({ params }: ResponsesPageProps) {
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
      status: 'published',
      theme: 'minimal',
      questions: [],
      thank_you_message: 'Thank you for your response!',
    })
  }

  // Get responses
  const responses = mockData.responses.getByFormId(id)

  return (
    <ResponsesDashboard 
      form={form} 
      responses={responses} 
    />
  )
}

