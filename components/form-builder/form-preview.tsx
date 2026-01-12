'use client'

import { QuestionConfig, ThemePreset } from '@/lib/database.types'
import { ThemeConfig } from '@/lib/database.types'
import { themes, getTheme } from '@/lib/themes'
import { motion } from 'framer-motion'
import { Star, Check, Image } from 'lucide-react'
import NextImage from 'next/image'

interface FormPreviewProps {
  questions: QuestionConfig[]
  selectedQuestionId: string | null
  onSelectQuestion: (id: string) => void
}

export function FormPreview({ 
  questions, 
  selectedQuestionId, 
  onSelectQuestion 
}: FormPreviewProps) {
  // Helper to get theme for a question, falling back to minimal
  const getQuestionTheme = (question: QuestionConfig): ThemeConfig => {
    const questionTheme = question.style?.theme || 'minimal'
    return getTheme(questionTheme)
  }

  // Helper to get style for a question, falling back to theme defaults
  const getQuestionStyle = (question: QuestionConfig) => {
    const theme = getQuestionTheme(question)
    const style = question.style || {}
    return {
      fontFamily: style.fontFamily || theme.fontFamily,
      textColor: style.textColor || theme.textColor,
      buttonBackgroundColor: style.buttonBackgroundColor || 'white',
      buttonTextColor: style.buttonTextColor || theme.primaryColor,
      verticalAlignment: style.verticalAlignment || 'left', // Default to left alignment
      theme: theme, // Include full theme for background color
    }
  }
  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)] p-8 bg-white" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="text-center">
          <p className="text-slate-600 text-[14px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
            Add questions to see a preview
          </p>
        </div>
      </div>
    )
  }

  // Find the selected question or use the first one if none selected
  const selectedQuestion = selectedQuestionId 
    ? questions.find(q => q.id === selectedQuestionId)
    : questions[0]

  if (!selectedQuestion) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)] p-8 bg-white" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="text-center">
          <p className="text-slate-600 text-[14px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
            Select a question to preview
          </p>
        </div>
      </div>
    )
  }

  const qStyle = getQuestionStyle(selectedQuestion)
  const isCentered = qStyle.verticalAlignment === 'center'
  const alignmentClass = isCentered ? 'items-center justify-center' : 'items-start'
  const questionIndex = questions.findIndex(q => q.id === selectedQuestion.id)

  return (
    <div 
      className="h-full flex flex-col min-h-[calc(100vh-200px)]"
      style={{ 
        background: qStyle.theme.backgroundColor,
        minHeight: 'calc(100vh - 200px)',
      } as React.CSSProperties}
    >
      <motion.div
        key={selectedQuestion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`
          px-12 py-8 flex-1 transition-all flex flex-col ${alignmentClass} ${isCentered ? 'justify-center' : 'justify-start'}
        `}
        style={{ 
          fontFamily: qStyle.fontFamily,
        } as React.CSSProperties}
      >
        <div className="mb-8 w-full">
          {/* Progress bar */}
          <div className="h-1 bg-white/20 rounded-full mb-12 overflow-hidden relative">
            {/* Base progress - full segment (darker when auto-advance) */}
            <div 
              className="h-full transition-all absolute left-0 top-0"
              style={{ 
                width: `${((questionIndex + 1) / questions.length) * 100}%`,
                backgroundColor: selectedQuestion.logic?.autoAdvance?.enabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)'
              }}
            />
            {/* Auto-advance timer fill animation - starts from previous question */}
            {selectedQuestion.logic?.autoAdvance?.enabled && (
              <div 
                className="h-full bg-white absolute top-0"
                style={{ 
                  left: `${(questionIndex / questions.length) * 100}%`,
                  width: `${(1 / questions.length) * 100}%`,
                  animation: `autoAdvanceSegment ${selectedQuestion.logic.autoAdvance.delaySeconds || 3}s linear infinite`,
                  transformOrigin: 'left',
                }}
              />
            )}
          </div>
        </div>
        
        <div className="w-full">
          <h3 
            className="text-3xl font-bold mb-4 leading-tight"
            style={{ color: qStyle.textColor }}
          >
            {selectedQuestion.title || (selectedQuestion.type === 'welcome' ? 'Welcome' : selectedQuestion.type === 'end' ? 'Thank you!' : 'Untitled question')}
            {selectedQuestion.required && selectedQuestion.type !== 'welcome' && selectedQuestion.type !== 'end' && (
              <span style={{ color: qStyle.buttonBackgroundColor }} className="ml-1">*</span>
            )}
          </h3>
          
          {selectedQuestion.description && (
            <p 
              className="text-base opacity-80 mb-8 leading-relaxed"
              style={{ color: qStyle.textColor }}
            >
              {selectedQuestion.description}
            </p>
          )}
        </div>

        {/* Content Screens Preview */}
        {selectedQuestion.type === 'slider' && (
          <div className="mt-6 w-full">
            <div className="space-y-4">
              <div className="flex justify-between text-sm opacity-70" style={{ color: qStyle.textColor }}>
                <span>{selectedQuestion.options?.[0] || selectedQuestion.minValue || 0}</span>
                <span className="text-lg font-semibold opacity-100">{selectedQuestion.placeholder || '50'}</span>
                <span>{selectedQuestion.options?.[1] || selectedQuestion.maxValue || 100}</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={selectedQuestion.minValue || 0}
                  max={selectedQuestion.maxValue || 100}
                  value={selectedQuestion.placeholder || '50'}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  style={{
                    accentColor: qStyle.buttonBackgroundColor || qStyle.theme.primaryColor,
                  }}
                  readOnly
                />
              </div>
            </div>
          </div>
        )}

        {selectedQuestion.type === 'testimonials' && (
          <div className="mt-6 w-full space-y-4">
            {(selectedQuestion.options || []).map((testimonial, i) => {
              const parts = testimonial.split('|')
              const name = parts[0] || 'Anonymous'
              const rating = parseInt(parts[1] || '5')
              const comment = parts[2] || 'Great experience!'
              const initials = parts[3] || name.slice(0, 2).toUpperCase()
              
              return (
                <div 
                  key={i}
                  className="p-6 rounded-xl border-2 bg-white/5 backdrop-blur-sm"
                  style={{ 
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: qStyle.textColor 
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-sm font-semibold" style={{ color: qStyle.textColor }}>
                      {initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-base">{name}</span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              className="w-4 h-4"
                              style={{ 
                                color: j < rating ? '#FFD700' : 'rgba(255, 255, 255, 0.3)',
                                fill: j < rating ? '#FFD700' : 'none'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm opacity-80 leading-relaxed">{comment}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {selectedQuestion.type === 'media' && (
          <div className="mt-6 w-full">
            <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              {selectedQuestion.options?.[0] === 'video' ? (
                <div className="aspect-video bg-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-16 h-16 mx-auto mb-2 opacity-50" style={{ color: qStyle.textColor }} />
                    <p className="text-sm opacity-70" style={{ color: qStyle.textColor }}>
                      {selectedQuestion.placeholder || 'Video URL'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-16 h-16 mx-auto mb-2 opacity-50" style={{ color: qStyle.textColor }} />
                    <p className="text-sm opacity-70" style={{ color: qStyle.textColor }}>
                      {selectedQuestion.placeholder || 'Image URL'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {selectedQuestion.description && (
              <p className="text-sm opacity-70 mt-3 text-center" style={{ color: qStyle.textColor }}>
                {selectedQuestion.description}
              </p>
            )}
          </div>
        )}

        {selectedQuestion.type === 'timer' && (
          <div className="mt-6 w-full">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4" style={{ borderColor: qStyle.buttonBackgroundColor || qStyle.theme.primaryColor }}>
                <div className="text-center">
                  <div className="text-4xl font-bold" style={{ color: qStyle.textColor }}>
                    {Math.floor((selectedQuestion.minValue || 60) / 60)}:{(selectedQuestion.minValue || 60) % 60 < 10 ? '0' : ''}{(selectedQuestion.minValue || 60) % 60}
                  </div>
                  <div className="text-xs opacity-70 mt-1" style={{ color: qStyle.textColor }}>remaining</div>
                </div>
              </div>
              {selectedQuestion.description && (
                <p className="text-base opacity-80" style={{ color: qStyle.textColor }}>
                  {selectedQuestion.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Preview of input types - only show for regular questions */}
        {(selectedQuestion.type !== 'welcome' && selectedQuestion.type !== 'end' && 
          selectedQuestion.type !== 'loading' && selectedQuestion.type !== 'result' &&
          selectedQuestion.type !== 'slider' && selectedQuestion.type !== 'testimonials' &&
          selectedQuestion.type !== 'media' && selectedQuestion.type !== 'timer') && (
        <div className="mt-6 w-full">
          {(selectedQuestion.type === 'short_text' || selectedQuestion.type === 'email' || 
            selectedQuestion.type === 'phone' || selectedQuestion.type === 'url' || 
            selectedQuestion.type === 'number') && (
            <div 
              className="border-b-2 py-4 text-lg opacity-60 w-full placeholder-shown"
              style={{ 
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: qStyle.textColor 
              }}
            >
              {selectedQuestion.placeholder || 'Type your answer here'}
            </div>
          )}

          {selectedQuestion.type === 'long_text' && (
            <div 
              className="border-2 rounded-lg p-3 opacity-50 min-h-[80px] w-full"
              style={{ 
                borderColor: `${qStyle.buttonBackgroundColor}40`,
                color: qStyle.textColor 
              }}
            >
              {selectedQuestion.placeholder || 'Type your answer here...'}
            </div>
          )}

          {selectedQuestion.type === 'date' && (
            <div 
              className="border-b-2 py-4 text-lg opacity-60 w-full"
              style={{ 
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: qStyle.textColor 
              }}
            >
              MM / DD / YYYY
            </div>
          )}

          {(selectedQuestion.type === 'dropdown' || selectedQuestion.type === 'checkboxes') && (
            <div className="space-y-3">
              {(selectedQuestion.options || []).map((option, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 transition-colors hover:bg-white/10"
                  style={{ 
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: qStyle.textColor 
                  }}
                >
                  <div 
                    className={`w-6 h-6 rounded-${selectedQuestion.type === 'dropdown' ? 'full' : 'md'} border-2 flex items-center justify-center`}
                    style={{ borderColor: 'rgba(255, 255, 255, 0.6)' }}
                  >
                    <span className="text-xs font-medium opacity-80">
                      {String.fromCharCode(65 + i)}
                    </span>
                  </div>
                  <span className="text-base">{option}</span>
                </div>
              ))}
            </div>
          )}

          {selectedQuestion.type === 'yes_no' && (
            <div className="flex gap-4">
              {['Yes', 'No'].map((option, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 flex-1 justify-center transition-colors hover:bg-white/10"
                  style={{ 
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: qStyle.textColor 
                  }}
                >
                  <span className="text-base font-medium">{option}</span>
                </div>
              ))}
            </div>
          )}

          {selectedQuestion.type === 'rating' && (
            <div className="flex gap-3">
              {Array.from({ length: selectedQuestion.maxValue || 5 }).map((_, i) => (
                <Star 
                  key={i}
                  className="w-10 h-10 transition-all hover:scale-110 cursor-pointer"
                  style={{ color: 'rgba(255, 255, 255, 0.3)', fill: 'none', strokeWidth: 2 }}
                />
              ))}
            </div>
          )}

          {selectedQuestion.type === 'opinion_scale' && (
            <div className="flex gap-2">
              {Array.from({ length: (selectedQuestion.maxValue || 10) - (selectedQuestion.minValue || 1) + 1 }).map((_, i) => (
                <div 
                  key={i}
                  className="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-base font-semibold transition-all hover:bg-white/10 cursor-pointer"
                  style={{ 
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: qStyle.textColor 
                  }}
                >
                  {(selectedQuestion.minValue || 1) + i}
                </div>
              ))}
            </div>
          )}

          {selectedQuestion.type === 'file_upload' && (
            <div 
              className="border-2 border-dashed rounded-xl p-8 text-center transition-all hover:bg-white/5"
              style={{ 
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: qStyle.textColor 
              }}
            >
              <p className="text-base opacity-80">Drop files here or click to upload</p>
              <p className="text-sm opacity-60 mt-2">
                Images & PDFs up to {selectedQuestion.maxFileSize || 10}MB
              </p>
            </div>
          )}
        </div>
        )}

        {/* Button preview */}
        <div className="mt-8 w-full">
          <button
            className="w-full py-4 rounded-xl font-semibold text-base transition-all hover:opacity-90 shadow-lg"
            style={{
              backgroundColor: qStyle.buttonBackgroundColor,
              color: qStyle.buttonTextColor,
            }}
          >
            {(() => {
              // Use buttonText if available, otherwise use defaults
              if (selectedQuestion.buttonText) {
                return selectedQuestion.buttonText
              }
              
              // Check if it's a welcome or end screen
              if (selectedQuestion.type === 'welcome') {
                return 'Start'
              } else if (selectedQuestion.type === 'end') {
                return 'Close'
              } else {
                // Regular question - check if it's the last one
                const isLast = questionIndex === questions.length - 1
                return isLast ? 'Submit' : 'Continue'
              }
            })()}
          </button>
          
          {/* Keyboard hint - only show for regular questions, not welcome/end screens */}
          {(selectedQuestion.type !== 'welcome' && selectedQuestion.type !== 'end') && (
            <div className="mt-3 text-center">
              <span className="text-sm opacity-70" style={{ color: qStyle.textColor }}>
                Or press enter ↵
              </span>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Ad Banner - Footer inside preview */}
      <div className="w-full shrink-0" style={{ paddingBottom: '65px' }}>
        <NextImage 
          src="/ad-banner.png" 
          alt="Ad Banner" 
          width={800}
          height={200}
          className="w-full h-auto"
        />
      </div>
    </div>
  )
}

