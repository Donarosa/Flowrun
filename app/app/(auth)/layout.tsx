export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-cream px-7 py-15">
      <div className="w-full max-w-sm flex flex-col">{children}</div>
    </div>
  )
}
