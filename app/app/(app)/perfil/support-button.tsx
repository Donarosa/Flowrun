'use client'

export function SupportButton() {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new Event('flowrun:open-support'))
      }
      className="group w-full flex items-center gap-3 rounded-2xl p-4 bg-paper-2 ring-1 ring-[var(--color-border)] hover:bg-cream transition text-left"
    >
      <span className="w-11 h-11 rounded-xl bg-trail-tint flex items-center justify-center shrink-0 text-trail">
        <ChatBubbleIcon />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold tracking-[-0.012em] text-ink">
          Hablar con soporte
        </p>
        <p className="text-[12px] text-muted mt-0.5">
          Te respondemos por email
        </p>
      </div>
      <span
        aria-hidden
        className="font-mono w-7 h-7 rounded-[9px] bg-cream flex items-center justify-center text-[13px] font-medium text-muted transition-transform group-hover:translate-x-0.5"
      >
        →
      </span>
    </button>
  )
}

function ChatBubbleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 20.5l1.4-5.2a8.5 8.5 0 1 1 16.6-3.8Z" />
    </svg>
  )
}
