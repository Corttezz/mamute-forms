'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface LogoProps {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'black' | 'white' | 'auto'
}

export function Logo({ href = '/', size = 'md', className, variant = 'auto' }: LogoProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine which logo to use
  let logoSrc = '/fox-form-logo-text-black.png'
  if (variant === 'white') {
    logoSrc = '/logo-fox-form-text-white.png'
  } else if (variant === 'auto' && mounted) {
    // Use white logo in dark mode, black in light mode
    logoSrc = theme === 'dark' 
      ? '/logo-fox-form-text-white.png'
      : '/fox-form-logo-text-black.png'
  }
  
  const content = (
    <Image
      src={logoSrc}
      alt="FoxForm"
      width={size === 'sm' ? 120 : size === 'lg' ? 180 : 150}
      height={size === 'sm' ? 30 : size === 'lg' ? 45 : 38}
      className={cn('object-contain', className)}
      priority
    />
  )

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
        {content}
      </Link>
    )
  }

  return content
}
