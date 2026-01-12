'use client'

import { useEffect, useState } from 'react'
import { FormPlayer } from '@/components/form-player/form-player'
import { Form } from '@/lib/database.types'
import { decodeFormFromURL } from '@/lib/form-serializer'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertCircle, FileX, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SharedFormPage() {
  const params = useParams()
  const [form, setForm] = useState<Form | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const data = params.data as string
    
    if (!data) {
      setError('No form data provided')
      setIsLoading(false)
      return
    }

    try {
      const decodedForm = decodeFormFromURL(data)
      
      if (!decodedForm) {
        setError('Failed to decode form data')
        setIsLoading(false)
        return
      }

      if (!decodedForm.questions || decodedForm.questions.length === 0) {
        setError('This form has no questions')
        setIsLoading(false)
        return
      }

      setForm(decodedForm)
    } catch (err) {
      console.error('Error decoding form:', err)
      setError('Invalid form data')
    } finally {
      setIsLoading(false)
    }
  }, [params.data])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-white/50 animate-spin mx-auto mb-4" />
          <p className="text-white/70 text-lg">Loading form...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <FileX className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Unable to load form
          </h1>
          <p className="text-white/60 mb-6">
            {error || 'The form link may be invalid or expired.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Go to Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-white text-slate-900 hover:bg-white/90">
                Create a Form
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return <FormPlayer form={form} />
}


