import { QuestionType, QuestionConfig } from './database.types'
import { 
  Type, 
  AlignLeft, 
  List, 
  CheckSquare, 
  Mail, 
  Phone, 
  Hash, 
  Calendar, 
  Star, 
  Gauge, 
  ThumbsUp, 
  Upload, 
  Link,
  Home,
  ArrowRight,
  Loader2,
  BarChart3,
  Flag,
  AlertTriangle,
  Quote,
  Image,
  Timer,
  Sliders,
  LucideIcon
} from 'lucide-react'

export interface QuestionTypeInfo {
  type: QuestionType
  label: string
  description: string
  icon: LucideIcon
  defaultConfig: Partial<QuestionConfig>
}

export const questionTypes: QuestionTypeInfo[] = [
  {
    type: 'short_text',
    label: 'Short Text',
    description: 'Single-line text input.',
    icon: Type,
    defaultConfig: {
      placeholder: 'Type your answer here...',
    },
  },
  {
    type: 'long_text',
    label: 'Long Text',
    description: 'Multi-line text input.',
    icon: AlignLeft,
    defaultConfig: {
      placeholder: 'Type your answer here...',
    },
  },
  {
    type: 'number',
    label: 'Number',
    description: 'Numeric input.',
    icon: Hash,
    defaultConfig: {
      placeholder: '0',
    },
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Email address input.',
    icon: Mail,
    defaultConfig: {
      placeholder: 'name@example.com',
    },
  },
  {
    type: 'phone',
    label: 'Phone',
    description: 'Phone number input.',
    icon: Phone,
    defaultConfig: {
      placeholder: '+1 (555) 000-0000',
    },
  },
  {
    type: 'dropdown',
    label: 'Dropdown',
    description: 'Select one option from a list.',
    icon: List,
    defaultConfig: {
      options: ['Option 1', 'Option 2', 'Option 3'],
    },
  },
  {
    type: 'checkboxes',
    label: 'Checkboxes',
    description: 'Select multiple options.',
    icon: CheckSquare,
    defaultConfig: {
      options: ['Option 1', 'Option 2', 'Option 3'],
    },
  },
  {
    type: 'yes_no',
    label: 'Yes/No',
    description: 'Binary choice input.',
    icon: ThumbsUp,
    defaultConfig: {},
  },
  {
    type: 'rating',
    label: 'Rating',
    description: 'Star-based rating input.',
    icon: Star,
    defaultConfig: {
      minValue: 1,
      maxValue: 5,
    },
  },
  {
    type: 'opinion_scale',
    label: 'Opinion Scale',
    description: 'Numeric scale (e.g. 1-10).',
    icon: Gauge,
    defaultConfig: {
      minValue: 1,
      maxValue: 10,
    },
  },
  {
    type: 'slider',
    label: 'Level / Slider',
    description: 'Numeric slider input.',
    icon: Sliders,
    defaultConfig: {
      minValue: 0,
      maxValue: 100,
    },
  },
  {
    type: 'date',
    label: 'Date',
    description: 'Date picker input.',
    icon: Calendar,
    defaultConfig: {},
  },
  {
    type: 'file_upload',
    label: 'File Upload',
    description: 'Upload files or images.',
    icon: Upload,
    defaultConfig: {
      allowedFileTypes: ['image/*', 'application/pdf'],
      maxFileSize: 10, // MB
    },
  },
  {
    type: 'url',
    label: 'Website URL',
    description: 'URL input field.',
    icon: Link,
    defaultConfig: {
      placeholder: 'https://example.com',
    },
  },
]

// Flow Screens
export const flowScreens: QuestionTypeInfo[] = [
  {
    type: 'welcome',
    label: 'Welcome',
    description: 'Intro screen with title, description and start button.',
    icon: Home,
    defaultConfig: {
      title: 'Welcome',
      description: 'Get started by clicking the button below',
      buttonText: 'Start',
    },
  },
  {
    type: 'loading',
    label: 'Loading',
    description: 'Temporary screen shown while processing data.',
    icon: Loader2,
    defaultConfig: {
      title: 'Loading...',
      description: 'Please wait while we process your information',
    },
  },
  {
    type: 'result',
    label: 'Result',
    description: 'Personalized result screen based on logic rules.',
    icon: BarChart3,
    defaultConfig: {
      title: 'Your Result',
      description: 'Based on your answers',
    },
  },
  {
    type: 'end',
    label: 'End',
    description: 'Final screen with closing message or CTA.',
    icon: Flag,
    defaultConfig: {
      title: 'Thank you!',
      description: 'Your response has been recorded',
      buttonText: 'Close',
    },
  },
]

// Content Screens
export const contentScreens: QuestionTypeInfo[] = [
  {
    type: 'alert',
    label: 'Alert',
    description: 'Highlight important messages or warnings.',
    icon: AlertTriangle,
    defaultConfig: {
      title: 'Alert',
      description: 'Important information',
    },
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    description: 'Display social proof with name, rating and comment.',
    icon: Quote,
    defaultConfig: {
      title: 'What our users say',
      description: '',
    },
  },
  {
    type: 'media',
    label: 'Media',
    description: 'Image or video content screen.',
    icon: Image,
    defaultConfig: {
      title: 'Media',
      description: '',
    },
  },
  {
    type: 'timer',
    label: 'Timer',
    description: 'Countdown or timed message screen.',
    icon: Timer,
    defaultConfig: {
      title: 'Timer',
      description: '',
    },
  },
]

export function getQuestionTypeInfo(type: QuestionType): QuestionTypeInfo | undefined {
  return questionTypes.find(qt => qt.type === type) ||
         flowScreens.find(fs => fs.type === type) ||
         contentScreens.find(cs => cs.type === type)
}

export function createDefaultQuestion(type: QuestionType): QuestionConfig {
  const typeInfo = getQuestionTypeInfo(type)
  const id = crypto.randomUUID()
  
  return {
    id,
    type,
    title: '',
    description: '',
    required: false,
    ...typeInfo?.defaultConfig,
  }
}

