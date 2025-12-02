"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/translations'
import { useLanguage } from '@/contexts/LanguageContext'

export default function RSVPSection() {
  const t = useTranslation()
  const { language } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [guests, setGuests] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' as 'success' | 'error' | 'info' | '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!name.trim() || !email.trim() || !guests.trim()) {
      setMessage({ text: t('rsvpError'), type: 'error' })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setMessage({ text: language === 'ar' ? 'الرجاء إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address', type: 'error' })
      return
    }

    setIsSubmitting(true)
    setMessage({ text: language === 'ar' ? 'جاري الإرسال...' : 'Submitting...', type: 'info' })

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('email', email.trim())
      formData.append('guests', guests.trim())
      formData.append('type', 'rsvp')

      const response = await fetch('/api/send-email', {
        method: 'POST',
        body: formData,
      })

      const contentType = response.headers.get('content-type') || ''
      let responseData: any = null
      
      if (contentType.includes('application/json')) {
        try {
          responseData = await response.json()
        } catch (e) {
          console.error('Failed to parse JSON response:', e)
          const rawText = await response.text().catch(() => '')
          responseData = { raw: rawText }
        }
      } else {
        const rawText = await response.text().catch(() => '')
        responseData = { raw: rawText }
      }

      if (!response.ok) {
        console.error('Server error:', response.status, response.statusText, responseData)
        const msg = responseData?.message
          || responseData?.error
          || (typeof responseData?.raw === 'string' && responseData.raw.trim() ? responseData.raw : '')
          || 'Failed to submit RSVP'
        throw new Error(msg)
      }

      if (!responseData.success) {
        console.error('API error:', responseData)
        throw new Error(responseData.message || 'RSVP submission failed')
      }

      setMessage({ 
        text: t('rsvpSuccess'),
        type: 'success' as const
      })
      
      // Reset form
      setName('')
      setEmail('')
      setGuests('1')
      
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      setMessage({ 
        text: error instanceof Error ? error.message : t('rsvpError'), 
        type: 'error' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section 
      id="rsvp" 
      className="py-16 px-4 md:py-20 bg-gradient-to-b from-accent/5 to-background"
      style={{
        clipPath: 'polygon(0 3%, 100% 0%, 100% 97%, 0% 100%)',
      }}
    >
      <div className="max-w-2xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6">{t('rsvpTitle')}</h2>
          <p className="text-gray-600 text-lg mb-4">{t('rsvpDescription')}</p>
          <div className="w-20 h-1 bg-accent mx-auto mb-8"></div>
          
          <div className="bg-white/90 p-8 md:p-10 rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="rsvp-name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('rsvpFormName')}
                </label>
                <input
                  id="rsvp-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('rsvpFormName')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="rsvp-email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('rsvpFormEmail')}
                </label>
                <input
                  id="rsvp-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('rsvpFormEmail')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="rsvp-guests" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('rsvpFormGuests')}
                </label>
                <select
                  id="rsvp-guests"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num.toString()}>
                      {num} {num === 1 ? (language === 'ar' ? 'ضيف' : 'Guest') : (language === 'ar' ? 'ضيوف' : 'Guests')}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-3 text-white bg-accent rounded-md hover:bg-accent/90 disabled:opacity-50 transition-colors font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : t('rsvpFormSubmit')}
              </button>

              {message.text && (
                <div className={`mt-4 p-4 rounded-md text-center ${
                  message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 
                  message.type === 'info' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                  'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  {message.text}
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

