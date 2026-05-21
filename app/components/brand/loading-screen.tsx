'use client'

import { SplashAnimation } from './splash-animation'

type Props = {
  // Mensaje opcional debajo de la animación. Si no se pasa, sólo aparece la marca.
  message?: string
  // Si true, se renderiza como overlay full-screen fixed encima de todo.
  overlay?: boolean
}

export function LoadingScreen({ message, overlay = false }: Props) {
  const wrapClass = overlay
    ? 'fixed inset-0 z-50 bg-cream flex flex-col items-center justify-center'
    : 'flex-1 flex flex-col items-center justify-center min-h-screen bg-cream'

  return (
    <div className={wrapClass}>
      <SplashAnimation size={240} showWordmark={!message} />
      {message && (
        <p className="mt-8 font-mono text-[11px] tracking-[0.16em] uppercase text-muted font-semibold loading-message">
          {message}
        </p>
      )}
      <style jsx>{`
        .loading-message {
          opacity: 0;
          animation: fade-in 0.4s ease 1.9s forwards;
        }
        @keyframes fade-in {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
