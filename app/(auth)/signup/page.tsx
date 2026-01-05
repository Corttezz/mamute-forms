'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Logo } from '@/components/ui/logo'
import { AuthPromo } from '@/components/auth/auth-promo'
import { toast } from 'sonner'
import { CheckCircle2, Circle } from 'lucide-react'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const passwordRequirements = [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'number', label: 'One number', met: /\d/.test(password) },
    { id: 'uppercase', label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { id: 'special', label: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    const allRequirementsMet = passwordRequirements.every(req => req.met)
    if (!allRequirementsMet) {
      toast.error('Please meet all password requirements')
      return
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    setIsLoading(true)
    try {
      // Mock signup - just redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
        toast.success('Account created successfully!')
      }, 500)
    } catch (error) {
      toast.error('Error creating account')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden flex">
        {/* Left Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-12 overflow-y-auto max-h-[90vh]">
          <div className="w-full max-w-md">
            <Logo href="/" />
            
            <h1 className="text-[24px] font-semibold text-slate-900 mt-8 mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Create your account
            </h1>

            <form onSubmit={handleSignup} className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[14px] text-slate-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="h-12 text-[14px] border-slate-200"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                />
              </div>

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
                
              {/* Password Requirements */}
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                {passwordRequirements.map((req) => (
                  <div key={req.id} className="flex items-center gap-2">
                    {req.met ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    )}
                    <span
                      className={`text-[12px] ${req.met ? 'text-slate-600' : 'text-slate-400'}`}
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                />
                <label htmlFor="terms" className="text-[14px] text-slate-700 cursor-pointer" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#111827] font-medium hover:underline">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-[#111827] font-medium hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#111827] hover:bg-[#111827]/90 text-white text-[14px] font-medium"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>

              <p className="text-center text-[14px] text-slate-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                Already have an account?{' '}
                <Link href="/login" className="text-[#111827] font-medium hover:underline">
                  Log in
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

