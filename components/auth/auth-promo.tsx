'use client'

import { Zap, Rocket, Palette, Sparkles, Quote } from 'lucide-react'

export function AuthPromo() {
  const features = [
    {
      icon: Zap,
      title: 'Unlimited Forms',
      description: 'Create as many forms as you need.',
    },
    {
      icon: Rocket,
      title: 'Forever Free Plan',
      description: '1,000 responses included for free.',
    },
    {
      icon: Palette,
      title: 'Customizable Design',
      description: 'Simple and adaptable to your brand.',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Creation',
      description: 'Generate forms in seconds.',
    },
  ]

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-[#111827] p-12 flex-col justify-between relative overflow-hidden rounded-r-2xl">
      <div>
        <h1 className="text-[24px] font-semibold text-white mb-4 leading-[100%]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          Create forms that people love to answer.
        </h1>
        <p className="text-[14px] text-white/80 mb-8 leading-[100%]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
          Simple, fast, and flexible forms to collect feedback, leads, and insights — all in one place.
        </p>

        <div className="space-y-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[14px] font-medium text-white mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {feature.title}
                  </h3>
                  <p className="text-[12px] text-white/60" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-[#1F2937] rounded-lg p-6 mt-8">
        <div className="flex items-start gap-3">
          <Quote className="w-5 h-5 text-white/60 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-[14px] text-white/90 italic mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
              &quot;FoxForm transformed how we collect feedback. Fast, intuitive, and powerful!&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">FO</span>
              </div>
              <div>
                <p className="text-[14px] font-medium text-white" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  Fernanda Oliveira
                </p>
                <p className="text-[12px] text-white/60" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Product Manager
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

