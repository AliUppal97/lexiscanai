import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
        <p className="mt-3 text-gray-600">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
