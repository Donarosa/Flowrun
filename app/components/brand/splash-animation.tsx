'use client'

import { useEffect, useRef } from 'react'

type Props = {
  // Tamaño en px (cuadrado). Default 280.
  size?: number
  // Mostrar la marca "flowrun" debajo. Default true.
  showWordmark?: boolean
}

export function SplashAnimation({ size = 280, showWordmark = true }: Props) {
  const pathRef = useRef<SVGPathElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  // Calcular longitud del path para el efecto de "dibujado".
  useEffect(() => {
    const path = pathRef.current
    const root = rootRef.current
    if (!path || !root) return
    const len = Math.ceil(path.getTotalLength())
    root.style.setProperty('--len', String(len))
  }, [])

  return (
    <div
      ref={rootRef}
      className="splash-anim flex flex-col items-center gap-10"
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        style={{ width: size, height: size }}
        className="mark"
      >
        <path
          ref={pathRef}
          d="M 14 84 L 72 80 C 88 79 88 63 72 62 L 28 58 C 12 57 12 41 28 40 L 72 36 C 88 35 88 19 72 18 L 42 14"
        />
        <circle cx="42" cy="14" r="5" />
      </svg>
      {showWordmark && (
        <div className="wordmark">
          flow<span className="accent">run</span>
        </div>
      )}

      <style jsx>{`
        .mark :global(path) {
          fill: none;
          stroke: var(--color-trail);
          stroke-width: 7;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: var(--len, 600);
          stroke-dashoffset: var(--len, 600);
          animation: draw 1.6s cubic-bezier(0.65, 0, 0.35, 1) 0.2s forwards;
        }
        .mark :global(circle) {
          fill: var(--color-trail);
          transform-origin: 42px 14px;
          transform: scale(0);
          animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 1.6s forwards;
        }
        .wordmark {
          font-size: 40px;
          font-weight: 600;
          letter-spacing: -0.04em;
          line-height: 1;
          color: var(--color-ink);
          text-transform: lowercase;
          opacity: 0;
          transform: translateY(8px);
          animation: rise 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 1.7s forwards;
        }
        .accent {
          color: var(--color-trail);
        }
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes pop {
          0% {
            transform: scale(0);
          }
          60% {
            transform: scale(1.25);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes rise {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
