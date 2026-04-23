export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F0E8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FF6357] mb-4 shadow-lg">
            <span className="text-white font-black text-xl">DJ</span>
          </div>
          <h1 className="text-2xl font-bold text-[#323232]">DjLab Cafe</h1>
          <p className="text-gray-500 text-sm mt-1">Schedule Management System</p>
        </div>
        {children}
      </div>
    </div>
  )
}
