// Mock Supabase server client - no actual Supabase dependency needed
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { mockStorage } from '@/lib/mock-storage'
import { Form, Response } from '@/lib/database.types'

// Mock user for development
const mockUser = {
  id: 'mock-user-id',
  email: 'user@example.com',
  user_metadata: {
    full_name: 'Mock User',
    avatar_url: null,
  },
}

// Create a chainable query builder with actual data filtering
function createQueryBuilder(table: string, filters: Array<{ type: string; column: string; value: any }> = []) {
  let data: any[] = []
  
  // Get data based on table - apply special filters first
  if (table === 'forms') {
    const formIdFilter = filters.find(f => f.column === 'id')
    const slugFilter = filters.find(f => f.column === 'slug')
    const userIdFilter = filters.find(f => f.column === 'user_id')
    
    if (formIdFilter) {
      // Get by ID
      const form = mockStorage.forms.getById(formIdFilter.value)
      data = form ? [form] : []
    } else if (slugFilter) {
      // Get by slug - check status filter too (searches all forms for published)
      const statusFilter = filters.find(f => f.column === 'status')
      const form = mockStorage.forms.getBySlug(slugFilter.value, statusFilter?.value)
      data = form ? [form] : []
    } else if (userIdFilter) {
      // Get by user_id
      data = Array.from(mockStorage.forms.getAll(userIdFilter.value))
    } else {
      // Default: get all user's forms
      data = Array.from(mockStorage.forms.getAll(mockUser.id))
    }
  } else if (table === 'responses') {
    const formIdFilter = filters.find(f => f.column === 'form_id')
    if (formIdFilter) {
      data = Array.from(mockStorage.responses.getByFormId(formIdFilter.value))
    } else {
      data = []
    }
  }

  // Apply remaining filters (excluding special ones already applied)
  const specialColumns = ['id', 'slug', 'user_id', 'form_id']
  filters.forEach(filter => {
    if (specialColumns.includes(filter.column)) return // Already handled
    
    if (filter.type === 'eq') {
      data = data.filter(item => item[filter.column] === filter.value)
    } else if (filter.type === 'neq') {
      data = data.filter(item => item[filter.column] !== filter.value)
    } else if (filter.type === 'in') {
      data = data.filter(item => filter.value.includes(item[filter.column]))
    }
  })

  const builder: any = {
    _filters: filters,
    _data: data,
    _table: table,
    eq: (column: string, value: any) => {
      return createQueryBuilder(table, [...filters, { type: 'eq', column, value }])
    },
    neq: (column: string, value: any) => {
      return createQueryBuilder(table, [...filters, { type: 'neq', column, value }])
    },
    in: (column: string, values: any[]) => {
      return createQueryBuilder(table, [...filters, { type: 'in', column, value: values }])
    },
    order: (column: string, options?: { ascending?: boolean }) => {
      const sorted = [...builder._data].sort((a, b) => {
        const aVal = a[column]
        const bVal = b[column]
        if (options?.ascending) {
          return aVal > bVal ? 1 : -1
        }
        return aVal < bVal ? 1 : -1
      })
      return {
        ...builder,
        _data: sorted,
        single: async () => ({ data: sorted[0] || null, error: null }),
        then: async (callback?: any) => {
          const result = { data: sorted, error: null }
          if (callback) return callback(result)
          return Promise.resolve(result)
        },
      }
    },
    single: async () => {
      // For forms, try to get by slug if filtering by slug
      if (table === 'forms') {
        const slugFilter = filters.find(f => f.column === 'slug')
        const statusFilter = filters.find(f => f.column === 'status')
        if (slugFilter) {
          const form = mockStorage.forms.getBySlug(slugFilter.value, statusFilter?.value)
          return { data: form, error: form ? null : { message: 'Not found' } }
        }
        const idFilter = filters.find(f => f.column === 'id')
        if (idFilter) {
          const form = mockStorage.forms.getById(idFilter.value)
          return { data: form, error: form ? null : { message: 'Not found' } }
        }
      }
      return { data: builder._data[0] || null, error: builder._data.length === 0 ? { message: 'Not found' } : null }
    },
    then: async (callback?: any) => {
      const result = { data: builder._data, error: null }
      if (callback) return callback(result)
      return Promise.resolve(result)
    },
  }
  return builder
}

// Mock Supabase server client
export async function createClient() {
  return {
    auth: {
      getUser: async () => ({
        data: { user: mockUser },
        error: null,
      }),
      exchangeCodeForSession: async () => ({ error: null }),
    },
    from: (table: string) => {
      return {
        select: (columns?: string) => createQueryBuilder(table),
        insert: (values: any) => {
          let inserted: any = null
          if (table === 'forms') {
            inserted = mockStorage.forms.create(values)
          } else if (table === 'responses') {
            inserted = mockStorage.responses.create(values)
          }
          return {
            select: (columns?: string) => ({
              single: async () => ({ data: inserted, error: null }),
              then: async (callback?: any) => {
                const result = { data: inserted, error: null }
                if (callback) return callback(result)
                return Promise.resolve(result)
              },
            }),
            then: async (callback?: any) => {
              const result = { data: inserted, error: null }
              if (callback) return callback(result)
              return Promise.resolve(result)
            },
          }
        },
        update: (values: any) => {
          let updateId: string | null = null
          const updateBuilder: any = {
            eq: (column: string, value: any) => {
              if (column === 'id') {
                updateId = value
              }
              return {
                ...updateBuilder,
                select: (columns?: string) => ({
                  single: async () => {
                    if (table === 'forms' && updateId) {
                      const updated = mockStorage.forms.update(updateId, values)
                      return { data: updated, error: updated ? null : { message: 'Not found' } }
                    }
                    return { data: null, error: { message: 'Not found' } }
                  },
                  then: async (callback?: any) => {
                    if (table === 'forms' && updateId) {
                      const updated = mockStorage.forms.update(updateId, values)
                      const result = { data: updated, error: updated ? null : { message: 'Not found' } }
                      if (callback) return callback(result)
                      return Promise.resolve(result)
                    }
                    const result = { data: null, error: { message: 'Not found' } }
                    if (callback) return callback(result)
                    return Promise.resolve(result)
                  },
                }),
                then: async (callback?: any) => {
                  if (table === 'forms' && updateId) {
                    const updated = mockStorage.forms.update(updateId, values)
                    const result = { data: updated, error: updated ? null : { message: 'Not found' } }
                    if (callback) return callback(result)
                    return Promise.resolve(result)
                  }
                  const result = { data: null, error: { message: 'Not found' } }
                  if (callback) return callback(result)
                  return Promise.resolve(result)
                },
              }
            },
            select: (columns?: string) => updateBuilder,
            then: async (callback?: any) => {
              const result = { data: null, error: { message: 'No ID specified' } }
              if (callback) return callback(result)
              return Promise.resolve(result)
            },
          }
          return updateBuilder
        },
        delete: () => {
          let deleteId: string | null = null
          return {
            eq: (column: string, value: any) => {
              if (column === 'id') {
                deleteId = value
              }
              return {
                then: async (callback?: any) => {
                  let deleted = false
                  if (table === 'forms' && deleteId) {
                    deleted = mockStorage.forms.delete(deleteId)
                  } else if (table === 'responses' && deleteId) {
                    deleted = mockStorage.responses.delete(deleteId)
                  }
                  const result = { data: deleted ? {} : null, error: deleted ? null : { message: 'Not found' } }
                  if (callback) return callback(result)
                  return Promise.resolve(result)
                },
              }
            },
            then: async (callback?: any) => {
              const result = { data: null, error: { message: 'No ID specified' } }
              if (callback) return callback(result)
              return Promise.resolve(result)
            },
          }
    },
      }
    },
  } as any
}
