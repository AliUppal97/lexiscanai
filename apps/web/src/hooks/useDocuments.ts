"use client"

import useSWR from "swr"
import { useAuth } from "./useAuth"
import { useToast } from "./useToast"
import { useCallback } from "react"

export type DocumentStatus = "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED"
export type ReviewStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED"

export interface Document {
  id: string
  title: string
  content?: string
  filePath?: string
  fileSize?: number
  mimeType?: string
  status: DocumentStatus
  uploadedBy: string
  tenantId: string
  createdAt: string
  updatedAt: string
  // Computed fields
  uploaderName?: string
  reviewsCount?: number
  latestReview?: Review
}

export interface Review {
  id: string
  documentId: string
  userId: string
  tenantId: string
  status: ReviewStatus
  score?: number
  feedback?: string
  analysis?: {
    summary?: string
    keyPoints?: string[]
    risks?: string[]
    recommendations?: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface DocumentFilters {
  status?: DocumentStatus[]
  search?: string
  uploadedBy?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: "createdAt" | "updatedAt" | "title" | "fileSize"
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

interface UseDocumentsReturn {
  documents: Document[]
  document: Document | null
  reviews: Review[]
  isLoading: boolean
  isProcessing: boolean
  error: Error | null
  totalCount: number
  totalPages: number
  // Document operations
  fetchDocuments: (filters?: DocumentFilters) => Promise<void>
  fetchDocument: (id: string) => Promise<Document>
  deleteDocument: (id: string) => Promise<void>
  downloadDocument: (id: string) => Promise<void>
  shareDocument: (id: string, email: string) => Promise<void>
  // Review operations
  fetchReviews: (documentId: string) => Promise<void>
  createReview: (documentId: string) => Promise<Review>
  updateReview: (reviewId: string, data: Partial<Review>) => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

/**
 * useDocuments - Document management system
 * 
 * Features:
 * - Document CRUD operations
 * - AI-powered document processing
 * - Review and analysis workflow
 * - Advanced filtering and search
 * - Document sharing
 * - Download management
 * - Real-time status updates
 * - Pagination support
 * 
 * @example
 * const { documents, fetchDocuments, deleteDocument } = useDocuments()
 * 
 * // Fetch with filters
 * useEffect(() => {
 *   fetchDocuments({ 
 *     status: ['PROCESSED'],
 *     search: 'contract',
 *     sortBy: 'createdAt',
 *     sortOrder: 'desc'
 *   })
 * }, [])
 * 
 * // Delete document
 * const handleDelete = async (id: string) => {
 *   await deleteDocument(id)
 * }
 */
export function useDocuments(initialFilters?: DocumentFilters): UseDocumentsReturn {
  const { session } = useAuth()
  const { success, error: showError } = useToast()

  // Fetch documents list
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<{ documents: Document[]; total: number; totalPages: number }>(
    session?.accessToken
      ? [`${API_URL}/documents`, session.accessToken, initialFilters]
      : null,
    async ([url, token, filters]) => {
      const params = new URLSearchParams()
      
      if (filters) {
        if (filters.status?.length) params.append("status", filters.status.join(","))
        if (filters.search) params.append("search", filters.search)
        if (filters.uploadedBy) params.append("uploadedBy", filters.uploadedBy)
        if (filters.dateFrom) params.append("dateFrom", filters.dateFrom)
        if (filters.dateTo) params.append("dateTo", filters.dateTo)
        if (filters.sortBy) params.append("sortBy", filters.sortBy)
        if (filters.sortOrder) params.append("sortOrder", filters.sortOrder)
        if (filters.page) params.append("page", filters.page.toString())
        if (filters.limit) params.append("limit", filters.limit.toString())
      }

      const res = await fetch(`${url}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!res.ok) throw new Error("Failed to fetch documents")
      return res.json()
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10000, // Refresh every 10 seconds for processing status
    }
  )

  // Fetch single document
  const {
    data: document,
    mutate: mutateDocument,
  } = useSWR<Document>(null) // Lazy loading, fetch on demand

  // Fetch document reviews
  const {
    data: reviews = [],
    mutate: mutateReviews,
  } = useSWR<Review[]>(null) // Lazy loading

  // Check if any document is processing
  const isProcessing = data?.documents.some((doc) => doc.status === "PROCESSING") ?? false

  // Fetch documents with new filters
  const fetchDocuments = useCallback(
    async (filters?: DocumentFilters) => {
      await mutate()
    },
    [mutate]
  )

  // Fetch single document
  const fetchDocument = useCallback(
    async (id: string): Promise<Document> => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      try {
        const res = await fetch(`${API_URL}/documents/${id}`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch document")
        }

        const doc = await res.json()
        mutateDocument(doc, false)
        return doc
      } catch (err) {
        showError("Failed to load document", (err as Error).message)
        throw err
      }
    },
    [session, mutateDocument, showError]
  )

  // Delete document
  const deleteDocument = useCallback(
    async (id: string) => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      try {
        const res = await fetch(`${API_URL}/documents/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.accessToken}` },
        })

        if (!res.ok) {
          throw new Error("Failed to delete document")
        }

        // Optimistically update the list
        await mutate(
          (current) => ({
            ...current!,
            documents: current!.documents.filter((d) => d.id !== id),
            total: current!.total - 1,
          }),
          false
        )

        success("Document deleted", "The document has been removed")
      } catch (err) {
        showError("Delete failed", (err as Error).message)
        throw err
      }
    },
    [session, mutate, success, showError]
  )

  // Download document
  const downloadDocument = useCallback(
    async (id: string) => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      try {
        const res = await fetch(`${API_URL}/documents/${id}/download`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        })

        if (!res.ok) {
          throw new Error("Failed to download document")
        }

        // Get filename from Content-Disposition header
        const contentDisposition = res.headers.get("Content-Disposition")
        const filename = contentDisposition
          ? contentDisposition.split("filename=")[1].replace(/"/g, "")
          : `document-${id}`

        // Create blob and download
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        success("Download started", "Your document is being downloaded")
      } catch (err) {
        showError("Download failed", (err as Error).message)
        throw err
      }
    },
    [session, success, showError]
  )

  // Share document
  const shareDocument = useCallback(
    async (id: string, email: string) => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      try {
        const res = await fetch(`${API_URL}/documents/${id}/share`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ email }),
        })

        if (!res.ok) {
          throw new Error("Failed to share document")
        }

        success("Document shared", `Shared with ${email}`)
      } catch (err) {
        showError("Share failed", (err as Error).message)
        throw err
      }
    },
    [session, success, showError]
  )

  // Fetch reviews
  const fetchReviews = useCallback(
    async (documentId: string) => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      try {
        const res = await fetch(`${API_URL}/documents/${documentId}/reviews`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch reviews")
        }

        const reviewsData = await res.json()
        mutateReviews(reviewsData, false)
      } catch (err) {
        showError("Failed to load reviews", (err as Error).message)
        throw err
      }
    },
    [session, mutateReviews, showError]
  )

  // Create review
  const createReview = useCallback(
    async (documentId: string): Promise<Review> => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      try {
        const res = await fetch(`${API_URL}/documents/${documentId}/reviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        })

        if (!res.ok) {
          throw new Error("Failed to create review")
        }

        const review = await res.json()
        await mutateReviews([...(reviews || []), review], false)
        
        success("Review started", "AI is analyzing your document")
        return review
      } catch (err) {
        showError("Review failed", (err as Error).message)
        throw err
      }
    },
    [session, reviews, mutateReviews, success, showError]
  )

  // Update review
  const updateReview = useCallback(
    async (reviewId: string, reviewData: Partial<Review>) => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      try {
        const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify(reviewData),
        })

        if (!res.ok) {
          throw new Error("Failed to update review")
        }

        await mutateReviews()
        success("Review updated", "Changes have been saved")
      } catch (err) {
        showError("Update failed", (err as Error).message)
        throw err
      }
    },
    [session, mutateReviews, success, showError]
  )

  return {
    documents: data?.documents ?? [],
    document,
    reviews,
    isLoading,
    isProcessing,
    error,
    totalCount: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    fetchDocuments,
    fetchDocument,
    deleteDocument,
    downloadDocument,
    shareDocument,
    fetchReviews,
    createReview,
    updateReview,
  }
}

