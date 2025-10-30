'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-[60vh] flex items-center justify-center px-6">
          <div className="max-w-lg text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Application error</h1>
            <p className="mt-3 text-gray-600">
              {error?.message || 'An unexpected error occurred.'}
            </p>
            {error?.digest && (
              <p className="mt-1 text-sm text-gray-400">Reference: {error.digest}</p>
            )}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Try again
              </button>
              <a
                href="/"
                className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
} 