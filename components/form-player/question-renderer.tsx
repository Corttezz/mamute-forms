'use client'

import { useState, useRef, useCallback } from 'react'
import { QuestionConfig, ThemeConfig, Json } from '@/lib/database.types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { Star, Upload, Check, X, FileText, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'

interface FileUploadValue {
  name: string
  url: string
  type: string
  size?: number
}

interface FileUploadQuestionProps {
  question: QuestionConfig
  value: FileUploadValue | null
  onChange: (value: FileUploadValue | null) => void
  theme: ThemeConfig
}

function FileUploadQuestion({ question, value, onChange, theme }: FileUploadQuestionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileSelect = useCallback(async (file: File) => {
    setUploadError(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        // If R2 is not configured, fall back to base64
        if (response.status === 503 && !result.configured) {
          // Fall back to base64 for local/demo usage
          const reader = new FileReader()
          reader.onload = () => {
            onChange({
              name: file.name,
              type: file.type,
              size: file.size,
              url: reader.result as string, // base64 data URL
            })
            setIsUploading(false)
          }
          reader.onerror = () => {
            setUploadError('Failed to read file')
            setIsUploading(false)
          }
          reader.readAsDataURL(file)
          return
        }
        
        throw new Error(result.error || 'Upload failed')
      }

      // Success - store the R2 URL
      onChange({
        name: result.file.name,
        type: result.file.type,
        size: result.file.size,
        url: result.url,
      })
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [onChange])

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFileSelect(file)
          }
          // Reset input so same file can be selected again
          e.target.value = ''
        }}
      />
      
      {value ? (
        <div 
          className="p-4 rounded-xl border-2 flex items-center gap-4"
          style={{ borderColor: theme.primaryColor }}
        >
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${theme.primaryColor}20` }}
          >
            {value.type?.startsWith('image/') ? (
              <ImageIcon className="w-6 h-6" style={{ color: theme.primaryColor }} />
            ) : (
              <FileText className="w-6 h-6" style={{ color: theme.primaryColor }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate" style={{ color: theme.textColor }}>
              {value.name}
            </p>
            {value.size && (
              <p className="text-sm opacity-50" style={{ color: theme.textColor }}>
                {(value.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>
          <button
            onClick={() => onChange(null)}
            className="p-2 rounded-lg transition-colors hover:opacity-70"
            style={{ color: theme.textColor }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : isUploading ? (
        <div 
          className="w-full p-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-3"
          style={{ 
            borderColor: theme.primaryColor,
            color: theme.textColor,
          }}
        >
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.primaryColor }} />
          <p className="font-medium">Uploading...</p>
        </div>
      ) : (
        <div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-3 transition-colors"
            style={{ 
              borderColor: uploadError ? '#EF4444' : `${theme.textColor}30`,
              color: theme.textColor,
            }}
          >
            <Upload className="w-8 h-8 opacity-50" />
            <div className="text-center">
              <p className="font-medium">Click to upload</p>
              <p className="text-sm opacity-50 mt-1">
                Images & PDFs up to {question.maxFileSize || 10}MB
              </p>
            </div>
          </motion.button>
          {uploadError && (
            <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: '#EF4444' }}>
              <AlertCircle className="w-4 h-4" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface QuestionRendererProps {
  question: QuestionConfig
  value: Json
  onChange: (value: Json) => void
  theme: ThemeConfig
  error?: string
  onSubmit: (skipValidation?: boolean) => void
  onClearError?: () => void
}

export function QuestionRenderer({ 
  question, 
  value, 
  onChange, 
  theme,
  error,
  onSubmit,
  onClearError
}: QuestionRendererProps) {
  const [isFocused, setIsFocused] = useState(false)

  const inputStyles = {
    borderColor: error ? '#EF4444' : 'rgba(255, 255, 255, 0.3)',
    color: theme.textColor,
    backgroundColor: 'transparent',
  }

  switch (question.type) {
    case 'short_text':
    case 'email':
    case 'phone':
    case 'url':
    case 'number':
      return (
        <Input
          type={question.type === 'number' ? 'number' : question.type === 'email' ? 'email' : 'text'}
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={question.placeholder || 'Type your answer here'}
          className="text-lg h-auto py-4 px-0 border-0 border-b-2 rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:opacity-60"
          style={inputStyles}
          autoFocus
        />
      )

    case 'long_text':
      return (
        <Textarea
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={question.placeholder || 'Type your answer here'}
          className="text-base min-h-[120px] p-4 border-2 rounded-xl bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:opacity-60 resize-none"
          style={inputStyles}
          autoFocus
        />
      )

    case 'date':
      return (
        <Input
          type="date"
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="text-lg h-auto py-4 px-0 border-0 border-b-2 rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          style={inputStyles}
          autoFocus
        />
      )

    case 'dropdown':
      return (
        <div className="space-y-3">
          {(question.options || []).map((option, index) => {
            const isSelected = value === option
            return (
              <motion.button
                key={index}
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange(option)
                  onClearError?.()
                  onSubmit(true)
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: isSelected ? theme.primaryColor : `${theme.textColor}20`,
                  backgroundColor: isSelected ? `${theme.primaryColor}10` : 'transparent',
                  color: theme.textColor,
                }}
              >
                <div 
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                  style={{ 
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    backgroundColor: 'transparent',
                  }}
                >
                  <span className="text-xs font-medium opacity-80">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <span className="text-base">{option}</span>
              </motion.button>
            )
          })}
        </div>
      )

    case 'checkboxes':
      const selectedValues = Array.isArray(value) ? value : []
      return (
        <div className="space-y-3">
          {(question.options || []).map((option, index) => {
            const isSelected = selectedValues.includes(option)
            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  const newValues = isSelected
                    ? selectedValues.filter(v => v !== option)
                    : [...selectedValues, option]
                  onChange(newValues)
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all hover:bg-white/10"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'transparent',
                  color: theme.textColor,
                }}
              >
                <div 
                  className="w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors"
                  style={{ 
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    backgroundColor: 'transparent',
                  }}
                >
                  <span className="text-xs font-medium opacity-80">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <span className="text-base">{option}</span>
              </motion.button>
            )
          })}
          <p className="text-sm opacity-50 mt-2" style={{ color: theme.textColor }}>
            Select all that apply
          </p>
        </div>
      )

    case 'yes_no':
      return (
        <div className="flex gap-4">
          {['Yes', 'No'].map((option) => {
            const isSelected = value === option
            return (
              <motion.button
                key={option}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange(option)
                  onClearError?.()
                  onSubmit(true)
                }}
                className="flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all hover:bg-white/10"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'transparent',
                  color: theme.textColor,
                }}
              >
                <span className="text-base font-medium">{option}</span>
              </motion.button>
            )
          })}
        </div>
      )

    case 'rating':
      const maxRating = question.maxValue || 5
      const currentRating = typeof value === 'number' ? value : 0
      return (
        <div className="flex gap-2">
          {Array.from({ length: maxRating }).map((_, index) => {
            const starValue = index + 1
            const isActive = starValue <= currentRating
            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onChange(starValue)}
                className="p-1"
              >
                <Star
                  className="w-10 h-10 transition-all hover:scale-110 cursor-pointer"
                  fill="none"
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.3)',
                    strokeWidth: 2,
                  }}
                />
              </motion.button>
            )
          })}
        </div>
      )

    case 'opinion_scale':
      const minScale = question.minValue || 1
      const maxScale = question.maxValue || 10
      const scaleValue = typeof value === 'number' ? value : null
      return (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: maxScale - minScale + 1 }).map((_, index) => {
            const num = minScale + index
            const isSelected = scaleValue === num
            return (
              <motion.button
                key={num}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange(num)
                  onClearError?.()
                  onSubmit(true)
                }}
                className="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-base font-semibold transition-all hover:bg-white/10 cursor-pointer"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'transparent',
                  color: theme.textColor,
                }}
              >
                {num}
              </motion.button>
            )
          })}
        </div>
      )

    case 'file_upload':
      return (
        <FileUploadQuestion
          question={question}
          value={value as FileUploadValue | null}
          onChange={(fileValue) => onChange(fileValue as Json)}
          theme={theme}
        />
      )

    case 'slider':
      const sliderValue = typeof value === 'number' ? value : parseInt(question.placeholder || '50') || 50
      const minValue = question.minValue || 0
      const maxValue = question.maxValue || 100
      return (
        <div className="space-y-4">
          <div className="flex justify-between text-sm opacity-70" style={{ color: theme.textColor }}>
            <span>{question.options?.[0] || minValue}</span>
            <span className="text-2xl font-bold opacity-100">{sliderValue}</span>
            <span>{question.options?.[1] || maxValue}</span>
          </div>
          <input
            type="range"
            min={minValue}
            max={maxValue}
            value={sliderValue}
            onChange={(e) => {
              const newValue = parseInt(e.target.value)
              onChange(newValue)
              onClearError?.()
            }}
            className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer"
            style={{
              accentColor: theme.primaryColor,
            }}
          />
        </div>
      )

    case 'testimonials':
      return (
        <div className="space-y-4">
          {(question.options || []).map((testimonial, i) => {
            const parts = testimonial.split('|')
            const name = parts[0] || 'Anonymous'
            const rating = parseInt(parts[1] || '5')
            const comment = parts[2] || 'Great experience!'
            const initials = parts[3] || name.slice(0, 2).toUpperCase()
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border-2 bg-white/5 backdrop-blur-sm"
                style={{ 
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: theme.textColor 
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-sm font-semibold" style={{ color: theme.textColor }}>
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
              </motion.div>
            )
          })}
        </div>
      )

    case 'media':
      const mediaType = question.options?.[0] || 'image'
      const mediaUrl = question.placeholder || ''
      return (
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
            {mediaUrl ? (
              mediaType === 'video' ? (
                <video
                  src={mediaUrl}
                  controls
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={question.title || 'Media'}
                  className="w-full aspect-video object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              )
            ) : (
              <div className="aspect-video bg-white/10 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm opacity-70" style={{ color: theme.textColor }}>
                    No media URL provided
                  </p>
                </div>
              </div>
            )}
          </div>
          {question.description && (
            <p className="text-sm opacity-70 text-center" style={{ color: theme.textColor }}>
              {question.description}
            </p>
          )}
        </div>
      )

    case 'timer':
      const timerValue = typeof value === 'number' ? value : (question.minValue || 60)
      const minutes = Math.floor(timerValue / 60)
      const seconds = timerValue % 60
      const isTimerEnded = timerValue <= 0
      
      return (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4" style={{ borderColor: theme.primaryColor }}>
            <div className="text-center">
              {isTimerEnded ? (
                <div className="text-lg font-semibold" style={{ color: theme.textColor }}>
                  {question.placeholder || 'Time is up!'}
                </div>
              ) : (
                <>
                  <div className="text-4xl font-bold" style={{ color: theme.textColor }}>
                    {minutes}:{seconds < 10 ? '0' : ''}{seconds}
                  </div>
                  <div className="text-xs opacity-70 mt-1" style={{ color: theme.textColor }}>remaining</div>
                </>
              )}
            </div>
          </div>
          {question.description && !isTimerEnded && (
            <p className="text-base opacity-80" style={{ color: theme.textColor }}>
              {question.description}
            </p>
          )}
        </div>
      )

    // Flow screens - these don't need input, just display content
    case 'loading':
      return (
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{ color: theme.textColor }} />
        </div>
      )

    case 'result':
      return (
        <div className="text-center space-y-4">
          {/* Result screen - displays personalized results */}
          <div 
            className="p-6 rounded-xl border-2 bg-white/5"
            style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <p className="text-lg opacity-80" style={{ color: theme.textColor }}>
              {question.description || 'Your personalized result will appear here'}
            </p>
          </div>
        </div>
      )

    case 'alert':
      return (
        <div 
          className="p-6 rounded-xl border-2 bg-white/10 backdrop-blur-sm"
          style={{ 
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: theme.textColor 
          }}
        >
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: theme.primaryColor }} />
            <p className="text-base leading-relaxed">
              {question.description || 'Important information'}
            </p>
          </div>
        </div>
      )

    default:
      return (
        <p style={{ color: theme.textColor }} className="opacity-50">
          Unsupported question type: {question.type}
        </p>
      )
  }
}

