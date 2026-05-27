'use client'

import { useState, useRef, useEffect } from 'react'
import { LogoMark } from '@/components/brand/logo-mark'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY

export function SupportChat() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // foco en el mensaje al abrir
  useEffect(() => {
    if (open && status === 'idle') {
      const t = setTimeout(() => textareaRef.current?.focus(), 250)
      return () => clearTimeout(t)
    }
  }, [open, status])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || !email.trim()) return
    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: 'Nuevo mensaje de soporte · FlowRun',
          from_name: 'Soporte FlowRun',
          email, // se usa como reply-to: respondés directo desde Gmail
          message,
          botcheck: '', // honeypot anti-spam
        }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('sent')
        setMessage('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  function reset() {
    setStatus('idle')
    setMessage('')
  }

  return (
    <>
      {/* Botón flotante (FAB), alineado a la columna de la app, por encima del TabBar */}
      <div className="fixed inset-x-0 bottom-[88px] z-40 pointer-events-none">
        <div className="max-w-md mx-auto px-6 flex justify-end">
          <button
            type="button"
            aria-label={open ? 'Cerrar soporte' : 'Abrir soporte'}
            onClick={() => setOpen((v) => !v)}
            className="pointer-events-auto w-14 h-14 rounded-full bg-trail text-cream shadow-[0_8px_24px_-6px_rgba(43,79,45,0.5)] flex items-center justify-center transition-transform active:scale-95 hover:bg-trail-deep"
          >
            {open ? (
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 20.5l1.4-5.2a8.5 8.5 0 1 1 16.6-3.8Z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Panel del chat */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
            <div className="max-w-md mx-auto px-4 pb-4">
              <div className="pointer-events-auto rounded-[28px] bg-paper-2 shadow-[0_24px_60px_-12px_rgba(27,31,27,0.35)] overflow-hidden flex flex-col max-h-[78vh]">
                {/* Header */}
                <div className="bg-trail text-cream px-5 pt-5 pb-6 relative">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-full bg-cream/15 flex items-center justify-center">
                      <LogoMark className="w-5 h-5 text-cream" />
                    </span>
                    <div>
                      <p className="text-[15px] font-semibold tracking-[-0.02em] leading-tight">Soporte FlowRun</p>
                      <p className="text-[12px] text-cream/70 leading-tight">Te respondemos por email</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Cerrar"
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-cream/15 flex items-center justify-center"
                  >
                    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>

                {/* Cuerpo */}
                <div className="px-5 py-5 overflow-y-auto">
                  {/* Burbuja de saludo */}
                  <div className="bg-lichen text-fg text-[14px] leading-relaxed rounded-2xl rounded-tl-md px-4 py-3 max-w-[88%]">
                    ¡Hola! 👋 Contanos en qué te podemos ayudar y te respondemos a tu email lo antes posible.
                  </div>

                  {status === 'sent' ? (
                    <div className="mt-5 text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-trail-tint flex items-center justify-center mb-3">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-trail" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>
                      <p className="text-[15px] font-semibold text-ink tracking-[-0.02em]">¡Mensaje enviado!</p>
                      <p className="text-[13px] text-muted mt-1 leading-relaxed">
                        Recibimos tu consulta y te respondemos pronto a <span className="text-fg font-medium">{email}</span>.
                      </p>
                      <button
                        type="button"
                        onClick={reset}
                        className="mt-4 text-[13px] font-medium text-trail hover:text-trail-deep"
                      >
                        Enviar otro mensaje
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                      <div>
                        <label className="text-[12px] font-medium text-muted px-1">Tu email</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tucorreo@email.com"
                          className="mt-1 w-full rounded-xl bg-cream px-4 py-3 text-[14px] text-fg placeholder:text-soft outline-none focus:ring-2 focus:ring-trail/30"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-medium text-muted px-1">Tu mensaje</label>
                        <textarea
                          ref={textareaRef}
                          required
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Escribí tu consulta..."
                          className="mt-1 w-full rounded-xl bg-cream px-4 py-3 text-[14px] text-fg placeholder:text-soft outline-none focus:ring-2 focus:ring-trail/30 resize-none"
                        />
                      </div>

                      {status === 'error' && (
                        <p className="text-[13px] text-alert px-1">
                          No se pudo enviar. Probá de nuevo o escribinos a flowrun200@gmail.com.
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="w-full rounded-xl bg-trail text-cream text-[15px] font-semibold py-3.5 transition-colors hover:bg-trail-deep disabled:opacity-60 active:scale-[0.99]"
                      >
                        {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
