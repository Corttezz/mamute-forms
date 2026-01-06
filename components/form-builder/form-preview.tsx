'use client'

import { QuestionConfig, ThemePreset } from '@/lib/database.types'
import { ThemeConfig } from '@/lib/database.types'
import { themes, getTheme } from '@/lib/themes'
import { motion } from 'framer-motion'
import { Star, Check } from 'lucide-react'

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
      buttonBackgroundColor: style.buttonBackgroundColor || theme.primaryColor,
      buttonTextColor: style.buttonTextColor || theme.backgroundColor,
      verticalAlignment: style.verticalAlignment || 'left', // Default to left alignment
      theme: theme, // Include full theme for background color
    }
  }
  if (questions.length === 0) {
    const defaultTheme = themes.minimal
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <p style={{ color: defaultTheme.textColor }} className="opacity-50">
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
    const defaultTheme = themes.minimal
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <p style={{ color: defaultTheme.textColor }} className="opacity-50">
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
    <div className="p-8">
      <motion.div
        key={selectedQuestion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`
          p-6 rounded-xl transition-all flex flex-col ${alignmentClass} ${isCentered ? 'min-h-[400px]' : ''}
        `}
        style={{ 
          backgroundColor: qStyle.theme.backgroundColor,
          fontFamily: qStyle.fontFamily,
        } as React.CSSProperties}
      >
        <div className="mb-4">
          <span 
            className="text-sm font-medium opacity-60"
            style={{ color: qStyle.textColor }}
          >
            {questionIndex + 1} →
          </span>
        </div>
        
        <h3 
          className="text-xl font-semibold mb-2"
          style={{ color: qStyle.textColor }}
        >
          {selectedQuestion.title || 'Untitled question'}
          {selectedQuestion.required && (
            <span style={{ color: qStyle.buttonBackgroundColor }} className="ml-1">*</span>
          )}
        </h3>
        
        {selectedQuestion.description && (
          <p 
            className="text-sm opacity-70 mb-4"
            style={{ color: qStyle.textColor }}
          >
            {selectedQuestion.description}
          </p>
        )}

        {/* Preview of input types */}
        <div className="mt-4 w-full">
          {(selectedQuestion.type === 'short_text' || selectedQuestion.type === 'email' || 
            selectedQuestion.type === 'phone' || selectedQuestion.type === 'url' || 
            selectedQuestion.type === 'number') && (
            <div 
              className="border-b-2 py-2 text-lg opacity-50 w-full"
              style={{ 
                borderColor: qStyle.buttonBackgroundColor,
                color: qStyle.textColor 
              }}
            >
              {selectedQuestion.placeholder || 'Type your answer here...'}
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
              className="border-b-2 py-2 text-lg opacity-50 w-full"
              style={{ 
                borderColor: qStyle.buttonBackgroundColor,
                color: qStyle.textColor 
              }}
            >
              MM / DD / YYYY
            </div>
          )}

          {(selectedQuestion.type === 'dropdown' || selectedQuestion.type === 'checkboxes') && (
            <div className="space-y-2">
              {(selectedQuestion.options || []).map((option, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg border-2 transition-colors hover:border-opacity-100"
                  style={{ 
                    borderColor: `${qStyle.buttonBackgroundColor}40`,
                    color: qStyle.textColor 
                  }}
                >
                  <div 
                    className={`w-6 h-6 rounded-${selectedQuestion.type === 'dropdown' ? 'full' : 'md'} border-2 flex items-center justify-center`}
                    style={{ borderColor: qStyle.buttonBackgroundColor }}
                  >
                    <span className="text-xs font-medium" style={{ color: qStyle.buttonBackgroundColor }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                  </div>
                  <span>{option}</span>
                </div>
              ))}
            </div>
          )}

          {selectedQuestion.type === 'yes_no' && (
            <div className="flex gap-3">
              {['Yes', 'No'].map((option, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg border-2 flex-1 justify-center transition-colors"
                  style={{ 
                    borderColor: `${qStyle.buttonBackgroundColor}40`,
                    color: qStyle.textColor 
                  }}
                >
                  <div 
                    className="w-6 h-6 rounded-md border-2 flex items-center justify-center"
                    style={{ borderColor: qStyle.buttonBackgroundColor }}
                  >
                    <span className="text-xs font-medium" style={{ color: qStyle.buttonBackgroundColor }}>
                      {option[0]}
                    </span>
                  </div>
                  <span>{option}</span>
                </div>
              ))}
            </div>
          )}

          {selectedQuestion.type === 'rating' && (
            <div className="flex gap-2">
              {Array.from({ length: selectedQuestion.maxValue || 5 }).map((_, i) => (
                <Star 
                  key={i}
                  className="w-8 h-8"
                  style={{ color: `${qStyle.buttonBackgroundColor}40` }}
                />
              ))}
            </div>
          )}

          {selectedQuestion.type === 'opinion_scale' && (
            <div className="flex gap-2">
              {Array.from({ length: (selectedQuestion.maxValue || 10) - (selectedQuestion.minValue || 1) + 1 }).map((_, i) => (
                <div 
                  key={i}
                  className="w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium"
                  style={{ 
                    borderColor: `${qStyle.buttonBackgroundColor}40`,
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
              className="border-2 border-dashed rounded-lg p-6 text-center opacity-70"
              style={{ 
                borderColor: `${qStyle.buttonBackgroundColor}40`,
                color: qStyle.textColor 
              }}
            >
              <p className="text-sm">Drop files here or click to upload</p>
              <p className="text-xs opacity-60 mt-1">
                Images & PDFs up to {selectedQuestion.maxFileSize || 10}MB
              </p>
            </div>
          )}
        </div>

        {/* Button preview */}
        <div className="mt-6">
          <button
            className="px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
            style={{
              backgroundColor: qStyle.buttonBackgroundColor,
              color: qStyle.buttonTextColor,
            }}
          >
            OK
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="mt-4 flex items-center gap-2 opacity-50">
          <span className="text-xs" style={{ color: qStyle.textColor }}>Press</span>
          <kbd 
            className="px-2 py-1 rounded text-xs font-medium"
            style={{ 
              backgroundColor: `${qStyle.buttonBackgroundColor}20`,
              color: qStyle.textColor 
            }}
          >
            Enter ↵
          </kbd>
        </div>
      </motion.div>
    </div>
  )
}

