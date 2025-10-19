import { Loading } from "@/components/ui/loading"

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loading size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">Loading LexiScan AI...</p>
      </div>
    </div>
  )
}

