import { Form, QuestionConfig, ThemePreset } from './database.types'

/**
 * Serializable form data for URL encoding
 * Minimal structure to keep URLs short
 */
export interface SerializedForm {
  t: string // title
  d?: string // description
  th: ThemePreset // theme
  q: SerializedQuestion[] // questions
  ty?: string // thank you message
}

interface SerializedQuestion {
  i: string // id
  tp: string // type
  t: string // title
  d?: string // description
  r?: boolean // required
  bt?: string // buttonText
  o?: string[] // options
  mn?: number // minValue
  mx?: number // maxValue
  ph?: string // placeholder
  st?: {
    th?: ThemePreset
    ff?: string // fontFamily
    tc?: string // textColor
    bbc?: string // buttonBackgroundColor
    btc?: string // buttonTextColor
    va?: 'center' | 'left' // verticalAlignment
  }
  lg?: {
    aa?: { e: boolean; ds?: number } // autoAdvance: enabled, delaySeconds
    nb?: {
      obc?: string // onButtonClick
      oaa?: string // onAutoAdvance
      tsi?: string // targetScreenId
    }
  }
}

/**
 * Compress form data to minimal JSON structure
 */
function compressForm(form: Form): SerializedForm {
  const compressed: SerializedForm = {
    t: form.title,
    th: form.theme,
    q: (form.questions as QuestionConfig[]).map(q => {
      const cq: SerializedQuestion = {
        i: q.id,
        tp: q.type,
        t: q.title,
      }
      
      if (q.description) cq.d = q.description
      if (q.required) cq.r = true
      if (q.buttonText) cq.bt = q.buttonText
      if (q.options?.length) cq.o = q.options
      if (q.minValue !== undefined) cq.mn = q.minValue
      if (q.maxValue !== undefined) cq.mx = q.maxValue
      if (q.placeholder) cq.ph = q.placeholder
      
      if (q.style) {
        cq.st = {}
        if (q.style.theme) cq.st.th = q.style.theme
        if (q.style.fontFamily) cq.st.ff = q.style.fontFamily
        if (q.style.textColor) cq.st.tc = q.style.textColor
        if (q.style.buttonBackgroundColor) cq.st.bbc = q.style.buttonBackgroundColor
        if (q.style.buttonTextColor) cq.st.btc = q.style.buttonTextColor
        if (q.style.verticalAlignment) cq.st.va = q.style.verticalAlignment
      }
      
      if (q.logic) {
        cq.lg = {}
        if (q.logic.autoAdvance) {
          cq.lg.aa = { e: q.logic.autoAdvance.enabled }
          if (q.logic.autoAdvance.delaySeconds) cq.lg.aa.ds = q.logic.autoAdvance.delaySeconds
        }
        if (q.logic.navigationBehavior) {
          cq.lg.nb = {}
          if (q.logic.navigationBehavior.onButtonClick) cq.lg.nb.obc = q.logic.navigationBehavior.onButtonClick
          if (q.logic.navigationBehavior.onAutoAdvance) cq.lg.nb.oaa = q.logic.navigationBehavior.onAutoAdvance
          if (q.logic.navigationBehavior.targetScreenId) cq.lg.nb.tsi = q.logic.navigationBehavior.targetScreenId
        }
      }
      
      return cq
    }),
  }
  
  if (form.description) compressed.d = form.description
  if (form.thank_you_message !== 'Thank you for your response!') {
    compressed.ty = form.thank_you_message
  }
  
  return compressed
}

/**
 * Decompress form data from minimal JSON structure
 */
function decompressForm(compressed: SerializedForm): Form {
  const now = new Date().toISOString()
  
  return {
    id: 'shared-form',
    user_id: 'shared',
    title: compressed.t,
    description: compressed.d || null,
    slug: 'shared',
    status: 'published',
    theme: compressed.th,
    questions: compressed.q.map(cq => {
      const q: QuestionConfig = {
        id: cq.i,
        type: cq.tp as QuestionConfig['type'],
        title: cq.t,
        required: cq.r || false,
      }
      
      if (cq.d) q.description = cq.d
      if (cq.bt) q.buttonText = cq.bt
      if (cq.o) q.options = cq.o
      if (cq.mn !== undefined) q.minValue = cq.mn
      if (cq.mx !== undefined) q.maxValue = cq.mx
      if (cq.ph) q.placeholder = cq.ph
      
      if (cq.st) {
        q.style = {}
        if (cq.st.th) q.style.theme = cq.st.th
        if (cq.st.ff) q.style.fontFamily = cq.st.ff
        if (cq.st.tc) q.style.textColor = cq.st.tc
        if (cq.st.bbc) q.style.buttonBackgroundColor = cq.st.bbc
        if (cq.st.btc) q.style.buttonTextColor = cq.st.btc
        if (cq.st.va) q.style.verticalAlignment = cq.st.va
      }
      
      if (cq.lg) {
        q.logic = {}
        if (cq.lg.aa) {
          q.logic.autoAdvance = { enabled: cq.lg.aa.e }
          if (cq.lg.aa.ds) q.logic.autoAdvance.delaySeconds = cq.lg.aa.ds
        }
        if (cq.lg.nb) {
          q.logic.navigationBehavior = {}
          if (cq.lg.nb.obc) q.logic.navigationBehavior.onButtonClick = cq.lg.nb.obc as any
          if (cq.lg.nb.oaa) q.logic.navigationBehavior.onAutoAdvance = cq.lg.nb.oaa as any
          if (cq.lg.nb.tsi) q.logic.navigationBehavior.targetScreenId = cq.lg.nb.tsi
        }
      }
      
      return q
    }),
    thank_you_message: compressed.ty || 'Thank you for your response!',
    created_at: now,
    updated_at: now,
  }
}

/**
 * Encode form to URL-safe Base64 string
 */
export function encodeFormToURL(form: Form): string {
  const compressed = compressForm(form)
  const jsonString = JSON.stringify(compressed)
  
  // Use browser's btoa for Base64 encoding, but handle Unicode
  const utf8Bytes = new TextEncoder().encode(jsonString)
  const base64 = btoa(String.fromCharCode(...utf8Bytes))
  
  // Make URL-safe: replace + with -, / with _, remove padding =
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Decode form from URL-safe Base64 string
 */
export function decodeFormFromURL(encoded: string): Form | null {
  try {
    // Restore standard Base64: replace - with +, _ with /
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '='
    }
    
    // Decode Base64 to bytes
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    // Decode UTF-8
    const jsonString = new TextDecoder().decode(bytes)
    const compressed = JSON.parse(jsonString) as SerializedForm
    
    return decompressForm(compressed)
  } catch (error) {
    console.error('Failed to decode form from URL:', error)
    return null
  }
}

/**
 * Generate shareable URL for a form
 */
export function generateShareableURL(form: Form, baseURL: string): string {
  const encoded = encodeFormToURL(form)
  return `${baseURL}/s/${encoded}`
}


