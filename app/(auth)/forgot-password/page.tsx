'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/logo'
import { AuthPromo } from '@/components/auth/auth-promo'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setIsLoading(true)
    // Mock sending reset link
    setTimeout(() => {
      setEmailSent(true)
      setIsLoading(false)
      toast.success('Reset link sent to your email!')
    }, 1000)
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden flex">
          {/* Left Side - Success Message */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-12">
            <div className="w-full max-w-md">
              <Logo href="/" />
              
              <div className="mt-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#111827] flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h1 className="text-[24px] font-semibold text-slate-900 text-center mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  Check your email
                </h1>
                <p className="text-[14px] text-slate-600 text-center mb-6" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  We&apos;ve sent a password reset link to <strong className="text-slate-900">{email}</strong>
                </p>
                <p className="text-[14px] text-slate-500 text-center mb-8" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Click the link in your email to reset your password. You can close this tab.
                </p>
                
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-[14px] border-slate-200"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to log in
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Promotional Content */}
          <AuthPromo />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden flex">
        {/* Left Side - Forgot Password Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-12">
          <div className="w-full max-w-md">
            <Logo href="/" />
            
            <h1 className="text-[24px] font-semibold text-slate-900 mt-8 mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Forgot your password?
            </h1>
            <p className="text-[14px] text-slate-600 mb-8" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
              No worries, we&apos;ll send you reset instructions.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[14px] text-slate-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-12 text-[14px] border-slate-200"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#111827] hover:bg-[#111827]/90 text-white text-[14px] font-medium"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Link href="/login">
                <Button
                  variant="ghost"
                  className="w-full h-12 text-[14px] text-slate-700 hover:text-slate-900"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to log in
                </Button>
              </Link>
            </form>
          </div>
        </div>

        {/* Right Side - Promotional Content */}
        <AuthPromo />
      </div>
    </div>
  )
}

