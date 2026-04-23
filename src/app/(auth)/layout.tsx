export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F0E8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/images/logo.png" alt="DjLab Cafe" className="h-16 w-auto" />
          </div>
          <p className="text-gray-500 text-sm mt-1">Schedule Management System</p>
        </div>
        {children}
      </div>
    </div>
  )
}
