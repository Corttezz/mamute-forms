'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ href = '/', size = 'md', className }: LogoProps) {
  const content = (
    <span
      className={cn(
        'text-[24px] font-bold leading-[100%] tracking-[0%]',
        'transition-colors',
        className
      )}
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        fontSize: '24px',
        lineHeight: '100%',
        letterSpacing: '0%',
        color: '#000000',
      }}
    >
      MamuteForms
    </span>
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
