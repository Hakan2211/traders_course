import { Link } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-color)] text-[var(--text-color-primary-800)] p-4">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="bg-red-100 p-4 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-[var(--text-color-primary-600)] mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-[var(--text-color-primary-800)] text-[var(--bg-color)] rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}
