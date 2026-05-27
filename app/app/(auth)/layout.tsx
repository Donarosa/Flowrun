export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex-1 flex flex-col bg-cream px-7 pt-2 pb-6">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}
