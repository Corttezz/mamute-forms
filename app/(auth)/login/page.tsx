'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Logo } from '@/components/ui/logo'
import { AuthPromo } from '@/components/auth/auth-promo'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter your email and password')
      return
    }

    setIsLoading(true)
    try {
      // Mock login - just redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
        toast.success('Welcome back!')
      }, 500)
    } catch (error) {
      toast.error('Invalid email or password')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden flex">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-12">
          <div className="w-full max-w-md">
            <Logo href="/" />
            
            <h1 className="text-[24px] font-semibold text-slate-900 mt-8 mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Welcome back
            </h1>

            <form onSubmit={handleLogin} className="mt-8 space-y-6">
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[14px] text-slate-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-12 text-[14px] border-slate-200"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  label="Remember me"
                />
                <Link
                  href="/forgot-password"
                  className="text-[14px] text-slate-700 hover:text-slate-900 transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  Forgot your password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#111827] hover:bg-[#111827]/90 text-white text-[14px] font-medium"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>

              <p className="text-center text-[14px] text-slate-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-[#111827] font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right Side - Promotional Content */}
        <AuthPromo />
      </div>
    </div>
  )
}
