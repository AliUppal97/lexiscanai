"use client"

import * as React from "react"
import { useDropzone, type Accept, type FileRejection } from "react-dropzone"
import { Upload, X, File, FileText, Image as ImageIcon, Film, Music, Archive, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * FileUploadZone - Enterprise drag & drop file upload component
 * 
 * A powerful file upload component with drag & drop, preview, validation,
 * and progress tracking. Supports multiple files, file type restrictions,
 * and size limits.
 * 
 * Features:
 * - Drag & drop upload
 * - Click to browse
 * - File type validation
 * - File size validation
 * - Multiple file support
 * - Upload progress
 * - File preview
 * - Error handling
 * - Accessible (ARIA)
 * 
 * @example
 * <FileUploadZone
 *   accept={{ 'application/pdf': ['.pdf'] }}
 *   maxSize={10 * 1024 * 1024} // 10MB
 *   maxFiles={5}
 *   onUpload={async (files) => {
 *     await uploadFiles(files)
 *   }}
 *   onError={(errors) => console.error(errors)}
 * />
 */

export interface UploadedFile extends File {
  preview?: string
  progress?: number
  status?: "pending" | "uploading" | "success" | "error"
  error?: string
  id?: string
}

export interface FileUploadZoneProps {
  // File restrictions
  accept?: Accept
  maxSize?: number // in bytes
  maxFiles?: number
  multiple?: boolean
  disabled?: boolean

  // Upload handling
  onUpload?: (files: File[]) => Promise<void> | void
  onRemove?: (file: UploadedFile) => void
  onError?: (errors: FileRejection[]) => void

  // Styling
  className?: string
  variant?: "default" | "compact" | "minimal"

  // Display
  showPreview?: boolean
  showProgress?: boolean
  description?: string
  uploadText?: string
  browseText?: string
  
  // Controlled
  value?: UploadedFile[]
  onChange?: (files: UploadedFile[]) => void
}

export function FileUploadZone({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 1,
  multiple = false,
  disabled = false,
  onUpload,
  onRemove,
  onError,
  className,
  variant = "default",
  showPreview = true,
  showProgress = true,
  description,
  uploadText = "Drag & drop files here, or click to browse",
  browseText = "Browse files",
  value: controlledValue,
  onChange,
}: FileUploadZoneProps) {
  const [files, setFiles] = React.useState<UploadedFile[]>([])
  const [uploading, setUploading] = React.useState(false)

  // Support both controlled and uncontrolled
  const isControlled = controlledValue !== undefined
  const displayFiles = isControlled ? controlledValue : files

  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        onError?.(rejectedFiles)
      }

      if (acceptedFiles.length === 0) return

      // Create preview URLs for images
      const filesWithPreview: UploadedFile[] = acceptedFiles.map((file) => {
        const uploadFile = file as UploadedFile
        uploadFile.id = Math.random().toString(36).substring(7)
        uploadFile.status = "pending"
        
        if (file.type.startsWith("image/")) {
          uploadFile.preview = URL.createObjectURL(file)
        }
        
        return uploadFile
      })

      const newFiles = [...displayFiles, ...filesWithPreview].slice(0, maxFiles)

      if (!isControlled) {
        setFiles(newFiles)
      }
      onChange?.(newFiles)

      // Handle upload
      if (onUpload) {
        setUploading(true)
        try {
          await onUpload(acceptedFiles)
          
          // Update status to success
          const updatedFiles = newFiles.map((f) => ({
            ...f,
            status: "success" as const,
            progress: 100,
          }))
          
          if (!isControlled) {
            setFiles(updatedFiles)
          }
          onChange?.(updatedFiles)
        } catch (error) {
          // Update status to error
          const updatedFiles = newFiles.map((f) => ({
            ...f,
            status: "error" as const,
            error: error instanceof Error ? error.message : "Upload failed",
          }))
          
          if (!isControlled) {
            setFiles(updatedFiles)
          }
          onChange?.(updatedFiles)
        } finally {
          setUploading(false)
        }
      }
    },
    [displayFiles, maxFiles, onUpload, onError, isControlled, onChange]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    multiple,
    disabled: disabled || uploading,
  })

  const handleRemove = (file: UploadedFile) => {
    const newFiles = displayFiles.filter((f) => f.id !== file.id)
    
    if (!isControlled) {
      setFiles(newFiles)
    }
    onChange?.(newFiles)
    onRemove?.(file)

    // Revoke preview URL
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
  }

  // Cleanup preview URLs on unmount
  React.useEffect(() => {
    return () => {
      displayFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const getFileIcon = (file: UploadedFile) => {
    const type = file.type
    if (type.startsWith("image/")) return <ImageIcon className="h-8 w-8" />
    if (type.startsWith("video/")) return <Film className="h-8 w-8" />
    if (type.startsWith("audio/")) return <Music className="h-8 w-8" />
    if (type === "application/pdf") return <FileText className="h-8 w-8" />
    if (type.includes("zip") || type.includes("rar")) return <Archive className="h-8 w-8" />
    return <File className="h-8 w-8" />
  }

  if (variant === "compact") {
    return (
      <div className={cn("space-y-4", className)}>
        <div
          {...getRootProps()}
          className={cn(
            "flex items-center gap-4 rounded-lg border-2 border-dashed p-4 transition-colors",
            isDragActive && !isDragReject && "border-primary bg-primary/5",
            isDragReject && "border-destructive bg-destructive/5",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "cursor-pointer hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isDragActive ? "Drop files here" : uploadText}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <Button type="button" variant="outline" size="sm" disabled={disabled || uploading}>
            {uploading ? "Uploading..." : browseText}
          </Button>
        </div>

        {displayFiles.length > 0 && (
          <FileList
            files={displayFiles}
            onRemove={handleRemove}
            showPreview={showPreview}
            showProgress={showProgress}
            formatFileSize={formatFileSize}
            getFileIcon={getFileIcon}
          />
        )}
      </div>
    )
  }

  if (variant === "minimal") {
    return (
      <div className={cn("space-y-4", className)}>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || uploading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : browseText}
          </Button>
        </div>

        {displayFiles.length > 0 && (
          <FileList
            files={displayFiles}
            onRemove={handleRemove}
            showPreview={false}
            showProgress={showProgress}
            formatFileSize={formatFileSize}
            getFileIcon={getFileIcon}
          />
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4 text-center">
          <div className={cn(
            "rounded-full p-4",
            isDragActive && !isDragReject ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <Upload className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isDragActive
                ? isDragReject
                  ? "File type not accepted"
                  : "Drop files here"
                : uploadText}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {maxSize && <span>Max size: {formatFileSize(maxSize)}</span>}
              {maxFiles > 1 && <span>• Max files: {maxFiles}</span>}
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {browseText}
              </>
            )}
          </Button>
        </div>
      </div>

      {displayFiles.length > 0 && (
        <FileList
          files={displayFiles}
          onRemove={handleRemove}
          showPreview={showPreview}
          showProgress={showProgress}
          formatFileSize={formatFileSize}
          getFileIcon={getFileIcon}
        />
      )}
    </div>
  )
}

/**
 * FileList - Display uploaded files
 */

interface FileListProps {
  files: UploadedFile[]
  onRemove: (file: UploadedFile) => void
  showPreview: boolean
  showProgress: boolean
  formatFileSize: (bytes: number) => string
  getFileIcon: (file: UploadedFile) => React.ReactNode
}

function FileList({
  files,
  onRemove,
  showPreview,
  showProgress,
  formatFileSize,
  getFileIcon,
}: FileListProps) {
  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id || file.name}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          {/* Preview/Icon */}
          <div className="flex-shrink-0">
            {showPreview && file.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={file.preview}
                alt={file.name}
                className="h-12 w-12 rounded object-cover"
              />
            ) : (
              <div className="text-muted-foreground">{getFileIcon(file)}</div>
            )}
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>

            {/* Progress bar */}
            {showProgress && file.status === "uploading" && file.progress !== undefined && (
              <Progress value={file.progress} className="mt-2 h-1" />
            )}

            {/* Error message */}
            {file.status === "error" && file.error && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{file.error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Status icon */}
          {file.status === "success" && (
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          )}
          {file.status === "uploading" && (
            <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
          )}
          {file.status === "error" && (
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          )}

          {/* Remove button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(file)}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      ))}
    </div>
  )
}

/**
 * Common accept configurations
 */

export const ACCEPT_IMAGES: Accept = {
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
}

export const ACCEPT_DOCUMENTS: Accept = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
}

export const ACCEPT_LEGAL_DOCUMENTS: Accept = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
}

export const ACCEPT_MEDIA: Accept = {
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  "video/*": [".mp4", ".mov", ".avi"],
  "audio/*": [".mp3", ".wav", ".ogg"],
}

