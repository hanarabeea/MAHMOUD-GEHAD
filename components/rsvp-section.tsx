"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/translations'
import { useLanguage } from '@/contexts/LanguageContext'

export default function RSVPSection() {
  const t = useTranslation()
  const { language } = useLanguage()
  const [name, setName] = useState('')
  const [guests, setGuests] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' as 'success' | 'error' | 'info' | '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!name.trim() || !guests.trim()) {
      setMessage({ text: t('rsvpError'), type: 'error' })
      return
    }

    setIsSubmitting(true)
    setMessage({ text: language === 'ar' ? 'جاري الإرسال...' : 'Submitting...', type: 'info' })

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
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
      className="relative py-20 px-4 md:py-32 bg-gradient-to-b from-accent/5 via-background to-transparent overflow-hidden"
      style={{
        clipPath: 'polygon(0 0%, 100% 3%, 100% 100%, 0% 97%)',
      }}
    >
      {/* Decorative background elements */}
      <motion.div 
        className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        initial={{ x: -300, opacity: 0, scale: 0.5 }}
        whileInView={{ x: 0, opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        initial={{ x: 300, opacity: 0, scale: 0.5 }}
        whileInView={{ x: 0, opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
      />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Decorative elements */}
          <motion.div 
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-accent to-accent" />
            <motion.svg 
              className="w-6 h-6 text-accent" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </motion.svg>
            <div className="w-24 h-px bg-gradient-to-l from-transparent via-accent to-accent" />
          </motion.div>

          <h2 className="font-luxury text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 tracking-wide">{t('rsvpTitle')}</h2>
          <p className="font-luxury text-lg md:text-xl text-muted-foreground mb-8 italic max-w-2xl mx-auto">{t('rsvpDescription')}</p>
        </motion.div>
        
        {/* Elegant form card */}
        <motion.div 
          className="relative bg-gradient-to-br from-card/95 via-card/90 to-accent/10 backdrop-blur-sm border-4 border-accent/40 p-8 md:p-12 shadow-2xl"
          initial={{ scale: 0.95, opacity: 0, y: 50 }}
          whileInView={{ scale: 1, opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            clipPath: 'polygon(8% 0%, 92% 0%, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0% 92%, 0% 8%)',
          }}
        >
          {/* Decorative corner hearts */}
          <motion.div
            className="absolute -top-3 -left-3"
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          >
            <svg className="w-10 h-10 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </motion.div>
          <motion.div
            className="absolute -top-3 -right-3"
            initial={{ scale: 0, rotate: 180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
          >
            <svg className="w-10 h-10 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </motion.div>
          <motion.div
            className="absolute -bottom-3 -left-3"
            initial={{ scale: 0, rotate: 180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
          >
            <svg className="w-10 h-10 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </motion.div>
          <motion.div
            className="absolute -bottom-3 -right-3"
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
          >
            <svg className="w-10 h-10 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </motion.div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <label htmlFor="rsvp-name" className="block text-sm font-medium text-foreground mb-2 font-luxury">
                {t('rsvpFormName')}
              </label>
              <input
                id="rsvp-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('rsvpFormName')}
                className="w-full px-4 py-3 bg-background/50 border-2 border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all font-luxury"
                required
                disabled={isSubmitting}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <label htmlFor="rsvp-guests" className="block text-sm font-medium text-foreground mb-2 font-luxury">
                {t('rsvpFormGuests')}
              </label>
              <select
                id="rsvp-guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full px-4 py-3 bg-background/50 border-2 border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all font-luxury"
                required
                disabled={isSubmitting}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num.toString()}>
                    {num} {num === 1 ? (language === 'ar' ? 'ضيف' : 'Guest') : (language === 'ar' ? 'ضيوف' : 'Guests')}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button
                type="submit"
                className="w-full px-8 py-4 text-white bg-accent rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-all font-luxury text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : t('rsvpFormSubmit')}
              </button>
            </motion.div>

            {message.text && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-4 p-4 rounded-lg text-center font-luxury ${
                  message.type === 'error' ? 'bg-red-100/80 text-red-700 border-2 border-red-300' : 
                  message.type === 'info' ? 'bg-blue-100/80 text-blue-700 border-2 border-blue-300' : 
                  'bg-green-100/80 text-green-700 border-2 border-green-300'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  )
}

