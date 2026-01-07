'use client'

import { Check, Lock, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const handleUpgrade = () => {
    // TODO: Implement upgrade logic
    toast.success('Upgrade to Gold coming soon!')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden" showCloseButton={true}>
        <div className="p-8 pb-0">
          <DialogTitle className="sr-only">Choose your plan</DialogTitle>
          <div className="text-left mb-6">
            <h2 className="text-[24px] font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Choose your plan
            </h2>
            <p className="text-[14px] text-slate-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
              Upgrade anytime to remove ads and unlock premium support.
            </p>
          </div>
          
          {/* Separator after title - full width */}
          <div className="border-t border-slate-200 mb-6 -mx-8 mt-6"></div>

          <div className="grid grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="border-2 border-slate-200 rounded-lg p-6 relative">
              <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-medium text-slate-600">
                <Check className="w-4 h-4" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Current plan</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Free with Ads
              </h3>
              <div className="mb-6">
                <div className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                  Free
                </div>
                <div className="text-[14px] text-slate-500" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  No credit card required
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mb-6 border-slate-300 bg-slate-50 text-slate-600"
                disabled
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                Current plan
              </Button>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[14px] font-medium text-slate-900" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      Unlimited responses
                    </div>
                    <div className="text-[12px] text-slate-500" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      Collect as many submissions as you need
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[14px] font-medium text-slate-900" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      All features included
                    </div>
                    <div className="text-[12px] text-slate-500" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      Access to all form building tools
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs font-bold text-red-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                      Aa
                    </span>
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-slate-900" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      Ads displayed
                    </div>
                    <div className="text-[12px] text-slate-500" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      Shown in form preview and submission pages
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gold Plan */}
            <div className="border-2 border-amber-500 rounded-lg p-6 relative bg-gradient-to-br from-amber-50/50 to-orange-50/50">
              <div className="absolute top-4 right-4">
                <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  ★ Recommended
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Gold Unlimited
              </h3>
              <div className="mb-6">
                <div className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                  $14<span className="text-lg font-normal text-slate-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    /month
                  </span>
                </div>
                <div className="text-[14px] text-slate-500" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Billed monthly - Cancel anytime
                </div>
              </div>
              <Button 
                className="w-full mb-6 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleUpgrade}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                Upgrade to Gold
              </Button>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[14px] font-medium text-slate-900" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      Unlimited responses
                    </div>
                    <div className="text-[12px] text-slate-500" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      Collect as many submissions as you need
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[14px] font-medium text-slate-900" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      All features included
                    </div>
                    <div className="text-[12px] text-slate-500" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      Access to all form building tools
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-green-50 rounded-lg p-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs font-bold text-white" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                      ?
                    </span>
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-slate-900" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      No ads
                    </div>
                    <div className="text-[12px] text-slate-500" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      Clean, professional forms without any advertisements
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-3">
                  <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[14px] font-medium text-slate-900" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      Premium Support
                    </div>
                    <div className="text-[12px] text-slate-500" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      Priority Chat support with faster response times
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        
        {/* Footer separator and footer together */}
        <div className="border-t border-slate-200 bg-slate-100 rounded-b-lg">
          <div className="flex items-center justify-center gap-2 pt-6 pb-6 px-8 text-[12px] text-slate-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
            <Lock className="w-4 h-4" />
            <span>Secure checkout powered by Stripe</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

