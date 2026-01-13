'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'
import { Plus, Search, Filter, ArrowUpDown, MoreVertical, List, Grid, FileText, BookOpen, Play } from 'lucide-react'
import { Form, FormStatus } from '@/lib/database.types'
import { useRouter } from 'next/navigation'

// Mock data for demonstration
const mockForms: Form[] = [
  {
    id: '1',
    user_id: 'mock-user-id',
    title: 'Customer Feedback Survey',
    description: null,
    slug: 'customer-feedback-survey',
    status: 'published',
    theme: 'minimal',
    questions: [],
    thank_you_message: 'Thank you!',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date('2024-12-15T14:58:00').toISOString(),
  },
  {
    id: '2',
    user_id: 'mock-user-id',
    title: 'Product Registration Form',
    description: null,
    slug: 'product-registration',
    status: 'published',
    theme: 'minimal',
    questions: [],
    thank_you_message: 'Thank you!',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date('2024-12-14T09:12:00').toISOString(),
  },
  {
    id: '3',
    user_id: 'mock-user-id',
    title: 'Event RSVP Form',
    description: null,
    slug: 'event-rsvp',
    status: 'draft',
    theme: 'minimal',
    questions: [],
    thank_you_message: 'Thank you!',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date('2024-12-17T16:22:00').toISOString(),
  },
  {
    id: '4',
    user_id: 'mock-user-id',
    title: 'Newsletter Subscription',
    description: null,
    slug: 'newsletter-subscription',
    status: 'published',
    theme: 'minimal',
    questions: [],
    thank_you_message: 'Thank you!',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date('2024-12-16T11:45:00').toISOString(),
  },
  {
    id: '5',
    user_id: 'mock-user-id',
    title: 'Contact Us Form',
    description: null,
    slug: 'contact-us',
    status: 'published',
    theme: 'minimal',
    questions: [],
    thank_you_message: 'Thank you!',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date('2024-12-17T13:18:00').toISOString(),
  },
  {
    id: '6',
    user_id: 'mock-user-id',
    title: 'Job Application Form',
    description: null,
    slug: 'job-application',
    status: 'published',
    theme: 'minimal',
    questions: [],
    thank_you_message: 'Thank you!',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date('2024-12-16T15:55:00').toISOString(),
  },
  {
    id: '7',
    user_id: 'mock-user-id',
    title: 'Support Ticket Form',
    description: null,
    slug: 'support-ticket',
    status: 'draft',
    theme: 'minimal',
    questions: [],
    thank_you_message: 'Thank you!',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date('2024-12-17T10:30:00').toISOString(),
  },
  {
    id: '8',
    user_id: 'mock-user-id',
    title: 'Website Feedback Form',
    description: null,
    slug: 'website-feedback',
    status: 'published',
    theme: 'minimal',
    questions: [],
    thank_you_message: 'Thank you!',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date('2024-12-17T17:40:00').toISOString(),
  },
]

const mockResponseCounts: Record<string, { total: number; today: number }> = {
  '1': { total: 247, today: 12 },
  '2': { total: 1432, today: 45 },
  '3': { total: 0, today: 0 },
  '4': { total: 3892, today: 127 },
  '5': { total: 89, today: 5 },
  '6': { total: 156, today: 8 },
  '7': { total: 0, today: 0 },
  '8': { total: 34, today: 3 },
}

function formatDate(date: string) {
  const d = new Date(date)
  const month = d.toLocaleString('en-US', { month: 'short' })
  const day = d.getDate()
  const year = d.getFullYear()
  const hour = d.getHours()
  const minute = d.getMinutes()
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  const minuteStr = minute.toString().padStart(2, '0')
  return `${month} ${day}, ${year} ${hour12}:${minuteStr} ${ampm}`
}

function getTimeAgo(date: string) {
  const now = new Date()
  const formDate = new Date(date)
  const diffInDays = Math.floor((now.getTime() - formDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Created today'
  if (diffInDays === 1) return 'Created yesterday'
  if (diffInDays < 7) return `Created ${diffInDays} days ago`
  if (diffInDays < 14) return 'Created 1 week ago'
  if (diffInDays < 30) return `Created ${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 60) return 'Created 1 month ago'
  return `Created ${Math.floor(diffInDays / 30)} months ago`
}

function getStatusBadge(status: FormStatus) {
  switch (status) {
    case 'published':
      return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/30 border-0">Published</Badge>
    case 'draft':
      return <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-0">Draft</Badge>
    case 'closed':
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-0">Closed</Badge>
  }
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredForms = useMemo(() => {
    if (!searchQuery) return mockForms
    return mockForms.filter(form =>
      form.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div className="w-full overflow-x-hidden">
      <div className="w-full">
        {/* Header */}
        <div className="p-8 bg-card">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-[24px] font-semibold text-foreground mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Forms
              </h1>
              <p className="text-[14px] text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                Create and manage your your forms
              </p>
            </div>
            <Link href="/forms/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 text-[14px] font-medium" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                <Plus className="w-4 h-4 mr-2" />
                Create form
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-card border-t border-b border-border px-8 mb-6">
          <div className="w-full py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="w-[300px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-[14px] border-border shadow-none"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="h-10 text-[14px] border-border bg-card" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                
                <Button variant="outline" size="sm" className="h-10 text-[14px] border-border bg-card" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Sort
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    className={`h-10 w-10 p-0 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card border-border'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    className={`h-10 w-10 p-0 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-card border-border'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="px-8 pb-8">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
          {/* Forms Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="text-[14px] text-muted-foreground font-medium px-6 py-4 text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    Form name
                  </th>
                  <th className="text-[14px] text-muted-foreground font-medium px-6 py-4 text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    Status
                  </th>
                  <th className="text-[14px] text-muted-foreground font-medium px-6 py-4 text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    Responses
                  </th>
                  <th className="text-[14px] text-muted-foreground font-medium px-6 py-4 text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    Last updated
                  </th>
                  <th className="text-[14px] text-muted-foreground font-medium px-6 py-4 text-right" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.map((form, index) => {
                  const responseData = mockResponseCounts[form.id] || { total: 0, today: 0 }
                  return (
                    <tr 
                      key={form.id} 
                      className={`border-b border-border hover:bg-muted transition-colors ${index === filteredForms.length - 1 ? 'border-b-0' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${form.status === 'published' ? 'bg-primary' : 'bg-muted-foreground'}`}>
                            <FileText className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div>
                            <Link
                              href={`/forms/${form.id}/edit`}
                              className="text-[14px] font-medium text-foreground hover:text-primary transition-colors block"
                              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                            >
                              {form.title}
                            </Link>
                            <p className="text-[12px] text-muted-foreground mt-0.5" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                              {getTimeAgo(form.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(form.status)}
                      </td>
                      <td className="px-6 py-4">
                        {form.status === 'published' ? (
                          <div className="flex flex-col">
                            <span className="text-[14px] text-foreground" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                              {responseData.total.toLocaleString('en-US').replace(/,/g, '.')}
                            </span>
                            {responseData.today > 0 && (
                              <span className="text-[12px] text-emerald-500 mt-0.5" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                                (+{responseData.today} today)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[14px] text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                            Not published
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                          {formatDate(form.updated_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/forms/${form.id}/edit`} className="cursor-pointer">
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/forms/${form.id}/responses`} className="cursor-pointer">
                                  View responses
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Help Section */}
          <div 
            className="px-6 py-6 border-t border-border"
            style={mounted && theme === 'dark' ? { background: 'linear-gradient(90deg, #1F255C 0%, #40499A 100%)' } : { backgroundColor: 'var(--card)' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-foreground mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  Need help getting started?
                </h3>
                <p className="text-[14px] text-muted-foreground mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Check out our comprehensive guides and tutorials to make the most of FoxForm.
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 text-[14px] border-0"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Documentation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 bg-transparent text-foreground hover:bg-muted text-[14px] border-border"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Tutorials
                  </Button>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
