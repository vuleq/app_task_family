export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
        <p className="mt-4 text-sm text-gray-300">Đang tải...</p>
      </div>
    </div>
  )
}

