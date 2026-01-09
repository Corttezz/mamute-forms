'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Form, QuestionConfig, Json } from '@/lib/database.types'
import { mockData } from '@/lib/mock-data'
import { getTheme, getThemeCSSVariables } from '@/lib/themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown, Check, ArrowRight } from 'lucide-react'
import { QuestionRenderer } from './question-renderer'
import { toast } from 'sonner'

interface FormPlayerProps {
  form: Form
}

export function FormPlayer({ form }: FormPlayerProps) {
  const questions = (form.questions as QuestionConfig[]) || []
  const theme = getTheme(form.theme)
  const themeStyles = getThemeCSSVariables(theme)
  
  // Helper to get style for a question, falling back to theme defaults
  const getQuestionStyle = (question: QuestionConfig) => {
    const questionTheme = question.style?.theme ? getTheme(question.style.theme) : theme
    const style = question.style || {}
    return {
      fontFamily: style.fontFamily || questionTheme.fontFamily,
      textColor: style.textColor || questionTheme.textColor,
      buttonBackgroundColor: style.buttonBackgroundColor || 'white',
      buttonTextColor: style.buttonTextColor || questionTheme.primaryColor,
      theme: questionTheme,
    }
  }

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Json>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [direction, setDirection] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const skipNextValidationRef = useRef(false)

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const isFirstQuestion = currentIndex === 0
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
  
  // Get style for current question - recalculate when question changes
  const questionStyle = currentQuestion ? getQuestionStyle(currentQuestion) : null
  const displayTheme = questionStyle?.theme || theme

  const validateCurrentQuestion = useCallback(() => {
    if (!currentQuestion) return true
    
    const answer = answers[currentQuestion.id]
    
    if (currentQuestion.required) {
      if (answer === undefined || answer === null || answer === '') {
        setErrors({ ...errors, [currentQuestion.id]: 'This field is required' })
        return false
      }
      
      if (Array.isArray(answer) && answer.length === 0) {
        setErrors({ ...errors, [currentQuestion.id]: 'Please select at least one option' })
        return false
      }
    }

    // Type-specific validation
    if (answer && currentQuestion.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(String(answer))) {
        setErrors({ ...errors, [currentQuestion.id]: 'Please enter a valid email address' })
        return false
      }
    }

    if (answer && currentQuestion.type === 'url') {
      try {
        new URL(String(answer))
      } catch {
        setErrors({ ...errors, [currentQuestion.id]: 'Please enter a valid URL' })
        return false
      }
    }

    if (answer && currentQuestion.type === 'phone') {
      const phoneRegex = /^[+]?[\d\s\-().]+$/
      if (!phoneRegex.test(String(answer))) {
        setErrors({ ...errors, [currentQuestion.id]: 'Please enter a valid phone number' })
        return false
      }
    }

    // Clear error if valid
    const newErrors = { ...errors }
    delete newErrors[currentQuestion.id]
    setErrors(newErrors)
    return true
  }, [currentQuestion, answers, errors])

  const getNavigationTarget = useCallback((question: QuestionConfig): number | 'submit' => {
    const navBehavior = question.logic?.navigationBehavior
    const target = navBehavior?.onButtonClick || 'next_screen'
    
    if (target === 'end_form') {
      return 'submit' // Submit the form
    } else if (target === 'previous_screen') {
      return Math.max(0, currentIndex - 1)
    } else if (target === 'specific_screen' && navBehavior?.targetScreenId) {
      const targetIndex = questions.findIndex(q => q.id === navBehavior.targetScreenId)
      return targetIndex >= 0 ? targetIndex : currentIndex + 1
    } else {
      // next_screen (default)
      return Math.min(currentIndex + 1, questions.length - 1)
    }
  }, [questions, currentIndex])

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentQuestion()) return
    
    setIsSubmitting(true)
    
    try {
      mockData.responses.create({
        form_id: form.id,
        answers: answers,
      })
      setIsSubmitted(true)
    } catch (error) {
      toast.error('Failed to submit response')
      setIsSubmitting(false)
    }
  }, [validateCurrentQuestion, form.id, answers])

  const goToNext = useCallback((skipValidation?: boolean) => {
    // Check both the parameter and the ref for skip validation
    const shouldSkip = skipValidation || skipNextValidationRef.current
    skipNextValidationRef.current = false // Reset the ref
    
    // Flow screens (welcome, end, etc.) don't need validation
    const isFlowScreen = currentQuestion?.type === 'welcome' || 
                        currentQuestion?.type === 'end' || 
                        currentQuestion?.type === 'loading' || 
                        currentQuestion?.type === 'result'
    
    if (!shouldSkip && !isFlowScreen && !validateCurrentQuestion()) return
    
    // Check navigation behavior
    const target = getNavigationTarget(currentQuestion)
    
    if (target === 'submit' || isLastQuestion) {
      handleSubmit()
    } else {
      setDirection(1)
      setCurrentIndex(target)
    }
  }, [isLastQuestion, currentQuestion, validateCurrentQuestion, getNavigationTarget, handleSubmit])

  const goToPrevious = useCallback(() => {
    setDirection(-1)
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }, [])

  const updateAnswer = (questionId: string, value: Json) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    // Clear error when user starts typing
    if (errors[questionId]) {
      const newErrors = { ...errors }
      delete newErrors[questionId]
      setErrors(newErrors)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitted || isSubmitting) return
      
      if (e.key === 'Enter' && !e.shiftKey) {
        // Don't submit on enter for textarea
        if (currentQuestion?.type === 'long_text') {
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            goToNext()
          }
          return
        }
        e.preventDefault()
        goToNext()
      }
      
      if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault()
        goToPrevious()
      }
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentQuestion, goToNext, goToPrevious, isSubmitted, isSubmitting])

  // Timer countdown logic
  useEffect(() => {
    if (currentQuestion?.type === 'timer') {
      const duration = currentQuestion.minValue || 60
      setTimerSeconds(duration)
      
      const interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval)
            // Timer ended - handle action
            const action = currentQuestion.options?.[0] || 'auto_advance'
            if (action === 'auto_advance') {
              setTimeout(() => goToNext(true), 500)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(interval)
    } else {
      setTimerSeconds(null)
    }
  }, [currentQuestion, goToNext])

  // Auto-advance logic
  useEffect(() => {
    if (isSubmitted || isSubmitting) return
    
    const autoAdvance = currentQuestion?.logic?.autoAdvance
    if (!autoAdvance?.enabled) return
    
    const delay = (autoAdvance.delaySeconds || 3) * 1000
    const timer = setTimeout(() => {
      goToNext(true) // Skip validation for auto-advance
    }, delay)
    
    return () => clearTimeout(timer)
  }, [currentIndex, currentQuestion, isSubmitted, isSubmitting, goToNext])

  // Scroll/wheel navigation
  useEffect(() => {
    let lastScrollTime = 0
    const scrollThreshold = 500 // ms between scroll navigations
    const deltaThreshold = 50 // minimum scroll delta to trigger navigation

    const handleWheel = (e: WheelEvent) => {
      if (isSubmitted || isSubmitting) return
      
      // Don't interfere with scrollable inputs like textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'TEXTAREA') return
      
      const now = Date.now()
      if (now - lastScrollTime < scrollThreshold) return
      
      // Check if scroll delta is significant enough
      if (Math.abs(e.deltaY) < deltaThreshold) return
      
      if (e.deltaY > 0) {
        // Scrolling down - go to next question
        goToNext()
      } else {
        // Scrolling up - go to previous question
        goToPrevious()
      }
      
      lastScrollTime = now
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [goToNext, goToPrevious, isSubmitted, isSubmitting])

  // Thank you screen
  if (isSubmitted) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-6"
        style={{ 
          ...themeStyles,
          background: displayTheme.backgroundColor,
          fontFamily: questionStyle?.fontFamily || theme.fontFamily,
        } as React.CSSProperties}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${theme.primaryColor}20` }}
          >
            <Check className="w-10 h-10" style={{ color: displayTheme.primaryColor }} />
          </motion.div>
          <h1 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: questionStyle?.textColor || displayTheme.textColor }}
          >
            {form.thank_you_message}
          </h1>
          <p 
            className="text-lg opacity-70"
            style={{ color: questionStyle?.textColor || displayTheme.textColor }}
          >
            Your response has been recorded.
          </p>
          
          {/* FoxForm branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <a 
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm opacity-50 hover:opacity-70 transition-opacity"
              style={{ color: questionStyle?.textColor || displayTheme.textColor }}
            >
              <span>Made with</span>
              <span className="font-semibold">FoxForm</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Empty form
  if (questions.length === 0) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-6"
        style={{ 
          background: theme.backgroundColor,
          fontFamily: theme.fontFamily,
        } as React.CSSProperties}
      >
        <p style={{ color: theme.textColor }} className="opacity-50">
          This form has no questions yet.
        </p>
      </div>
    )
  }

  const slideVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      y: direction > 0 ? -100 : 100,
      opacity: 0,
    }),
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex flex-col"
      style={{ 
        ...themeStyles,
        background: displayTheme.backgroundColor,
        fontFamily: questionStyle?.fontFamily || theme.fontFamily,
      } as React.CSSProperties}
    >
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-white/20">
          <div 
            className="h-full bg-white/60 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6 pt-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Check if this is a flow screen (welcome/end) */}
              {(currentQuestion.type === 'welcome' || currentQuestion.type === 'end') ? (
                <>
                  {/* Welcome/End Screen */}
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                className="text-3xl font-bold mb-4 leading-tight"
                style={{ color: questionStyle?.textColor || displayTheme.textColor }}
              >
                {currentQuestion.title || (currentQuestion.type === 'welcome' ? 'Welcome' : 'Thank you!')}
              </motion.h2>

              {currentQuestion.description && (
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base opacity-80 mb-8 leading-relaxed"
                  style={{ color: questionStyle?.textColor || displayTheme.textColor }}
                >
                  {currentQuestion.description}
                </motion.p>
              )}

                  {/* Action button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8"
                  >
                    <Button
                      onClick={() => goToNext(true)}
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl font-semibold text-base transition-all hover:opacity-90 shadow-lg"
                      style={{ 
                        backgroundColor: questionStyle?.buttonBackgroundColor || displayTheme.primaryColor,
                        color: questionStyle?.buttonTextColor || displayTheme.backgroundColor,
                      }}
                    >
                      {currentQuestion.buttonText || (currentQuestion.type === 'welcome' ? 'Start' : 'Close')}
                    </Button>
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Regular Question or Content Screen */}
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  className="text-3xl font-bold mb-4 leading-tight"
                  style={{ color: questionStyle?.textColor || displayTheme.textColor }}
                >
                  {currentQuestion.title || 'Untitled question'}
                  {currentQuestion.required && currentQuestion.type !== 'testimonials' && 
                   currentQuestion.type !== 'media' && currentQuestion.type !== 'timer' && (
                    <span style={{ color: questionStyle?.buttonBackgroundColor || displayTheme.primaryColor }} className="ml-1">*</span>
                  )}
                </motion.h2>

                {currentQuestion.description && (
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-base opacity-80 mb-8 leading-relaxed"
                    style={{ color: questionStyle?.textColor || displayTheme.textColor }}
                  >
                    {currentQuestion.description}
                  </motion.p>
                )}

                  {/* Answer input or Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mt-8"
                  >
                <QuestionRenderer
                  question={currentQuestion}
                  value={currentQuestion.type === 'timer' ? timerSeconds : answers[currentQuestion.id]}
                  onChange={(value) => {
                    if (currentQuestion.type !== 'timer') {
                      updateAnswer(currentQuestion.id, value)
                    }
                  }}
                  theme={displayTheme}
                  error={errors[currentQuestion.id]}
                  onSubmit={(skipValidation?: boolean) => {
                    if (skipValidation) {
                      skipNextValidationRef.current = true
                    }
                    goToNext(skipValidation)
                  }}
                  onClearError={() => {
                    if (errors[currentQuestion.id]) {
                      const newErrors = { ...errors }
                      delete newErrors[currentQuestion.id]
                      setErrors(newErrors)
                    }
                  }}
                />
                  </motion.div>

                  {/* Error message */}
                  <AnimatePresence>
                    {errors[currentQuestion.id] && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 text-sm font-medium"
                        style={{ color: '#EF4444' }}
                      >
                        {errors[currentQuestion.id]}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Action buttons - hide for content screens that don't need buttons */}
                  {(currentQuestion.type !== 'testimonials' && currentQuestion.type !== 'media' && 
                    currentQuestion.type !== 'timer' && currentQuestion.type !== 'alert') && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8"
                  >
                    <Button
                      onClick={() => goToNext()}
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl font-semibold text-base transition-all hover:opacity-90 shadow-lg"
                      style={{ 
                        backgroundColor: questionStyle?.buttonBackgroundColor || displayTheme.primaryColor,
                        color: questionStyle?.buttonTextColor || displayTheme.backgroundColor,
                      }}
                    >
                      {isSubmitting ? (
                        'Submitting...'
                      ) : currentQuestion.buttonText ? (
                        currentQuestion.buttonText
                      ) : isLastQuestion ? (
                        'Submit'
                      ) : (
                        'Continue'
                      )}
                    </Button>
                    
                    <div className="mt-3 text-center">
                      <span 
                        className="text-sm opacity-70"
                        style={{ color: questionStyle?.textColor || displayTheme.textColor }}
                      >
                        Or press enter ↵
                      </span>
                    </div>
                  </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            disabled={isFirstQuestion}
            className="h-10 w-10 p-0"
            style={{ color: questionStyle?.textColor || displayTheme.textColor }}
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToNext()}
            disabled={isSubmitting}
            className="h-10 w-10 p-0"
            style={{ color: questionStyle?.textColor || displayTheme.textColor }}
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>

        {/* FoxForm branding */}
        <a 
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm opacity-50 hover:opacity-70 transition-opacity"
          style={{ color: questionStyle?.textColor || displayTheme.textColor }}
        >
          Powered by <span className="font-semibold">FoxForm</span>
        </a>
      </footer>
    </div>
  )
}

