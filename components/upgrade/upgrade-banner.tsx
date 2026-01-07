'use client'

import { useState } from 'react'
import { UpgradeModal } from './upgrade-modal'

interface UpgradeBannerProps {
  className?: string
}

export function UpgradeBanner({ className }: UpgradeBannerProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors ${className || ''}`}
      >
        <svg width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_87_1659)">
            <path d="M10.8633 3.72656C11.2641 3.48047 11.5312 3.03398 11.5312 2.53125C11.5312 1.7543 10.902 1.125 10.125 1.125C9.34805 1.125 8.71875 1.7543 8.71875 2.53125C8.71875 3.0375 8.98594 3.48047 9.38672 3.72656L7.37227 7.75547C7.05234 8.39531 6.22266 8.57812 5.66367 8.13164L2.53125 5.625C2.70703 5.38945 2.8125 5.09766 2.8125 4.78125C2.8125 4.0043 2.1832 3.375 1.40625 3.375C0.629297 3.375 0 4.0043 0 4.78125C0 5.5582 0.629297 6.1875 1.40625 6.1875C1.41328 6.1875 1.42383 6.1875 1.43086 6.1875L3.0375 15.0258C3.23086 16.0945 4.1625 16.875 5.25234 16.875H14.9977C16.084 16.875 17.0156 16.098 17.2125 15.0258L18.8191 6.1875C18.8262 6.1875 18.8367 6.1875 18.8438 6.1875C19.6207 6.1875 20.25 5.5582 20.25 4.78125C20.25 4.0043 19.6207 3.375 18.8438 3.375C18.0668 3.375 17.4375 4.0043 17.4375 4.78125C17.4375 5.09766 17.543 5.38945 17.7188 5.625L14.5863 8.13164C14.0273 8.57812 13.1977 8.39531 12.8777 7.75547L10.8633 3.72656Z" fill="#F59E0B"/>
          </g>
          <defs>
            <clipPath id="clip0_87_1659">
              <path d="M0 0H20.25V18H0V0Z" fill="white"/>
            </clipPath>
          </defs>
        </svg>
        <span>
          Upgrade to <span className="text-blue-600 underline">Gold</span> to disable ads.
        </span>
      </button>

      <UpgradeModal open={showModal} onOpenChange={setShowModal} />
    </>
  )
}

