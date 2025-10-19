"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Brain,
  Clock,
  File,
  Image,
  FileSpreadsheet
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UploadedFile {
  id: string
  file: File
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  analysis?: string
  confidence?: number
  error?: string
}

const acceptedFileTypes = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes("pdf")) return FileText
  if (fileType.includes("word") || fileType.includes("document")) return FileText
  if (fileType.includes("excel") || fileType.includes("spreadsheet")) return FileSpreadsheet
  if (fileType.includes("image")) return Image
  return File
}

const getFileTypeColor = (fileType: string) => {
  if (fileType.includes("pdf")) return "bg-red-100 text-red-600"
  if (fileType.includes("word") || fileType.includes("document")) return "bg-blue-100 text-blue-600"
  if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "bg-green-100 text-green-600"
  if (fileType.includes("image")) return "bg-purple-100 text-purple-600"
  return "bg-gray-100 text-gray-600"
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: "uploading",
      progress: 0,
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Simulate file upload and processing
    newFiles.forEach(fileObj => {
      simulateUpload(fileObj.id)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const simulateUpload = async (fileId: string) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setUploadedFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, progress, status: progress === 100 ? "processing" : "uploading" }
            : file
        )
      )
    }

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate completion or error
    const isError = Math.random() < 0.1 // 10% chance of error
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? {
              ...file,
              status: isError ? "error" : "completed",
              analysis: isError 
                ? undefined 
                : "Contract analyzed successfully. 3 potential risks identified.",
              confidence: isError ? undefined : Math.floor(Math.random() * 10) + 90,
              error: isError ? "Failed to process document. Please try again." : undefined,
            }
          : file
      )
    )
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const processAllFiles = async () => {
    setIsProcessing(true)
    // Simulate batch processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsProcessing(false)
  }

  const completedFiles = uploadedFiles.filter(file => file.status === "completed")
  const processingFiles = uploadedFiles.filter(file => file.status === "processing")
  const errorFiles = uploadedFiles.filter(file => file.status === "error")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
        <p className="text-gray-600">Upload and analyze your legal documents with AI-powered insights.</p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Drag and drop your documents here, or click to browse. Supports PDF, DOC, DOCX, TXT, XLS, XLSX files up to 50MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOC, DOCX, TXT, XLS, XLSX files up to 50MB
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Summary */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upload Summary</CardTitle>
                <CardDescription>
                  {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""} uploaded
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Badge variant="secondary">
                  {completedFiles.length} Completed
                </Badge>
                {processingFiles.length > 0 && (
                  <Badge variant="outline">
                    {processingFiles.length} Processing
                  </Badge>
                )}
                {errorFiles.length > 0 && (
                  <Badge variant="destructive">
                    {errorFiles.length} Errors
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((fileObj) => {
                const FileIcon = getFileIcon(fileObj.file.type)
                const fileTypeColor = getFileTypeColor(fileObj.file.type)
                
                return (
                  <div key={fileObj.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${fileTypeColor}`}>
                      <FileIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileObj.file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      
                      {fileObj.status === "uploading" && (
                        <div className="mt-2">
                          <Progress value={fileObj.progress} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">
                            Uploading... {fileObj.progress}%
                          </p>
                        </div>
                      )}
                      
                      {fileObj.status === "processing" && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                          <p className="text-sm text-blue-600">Processing with AI...</p>
                        </div>
                      )}
                      
                      {fileObj.status === "completed" && (
                        <div className="mt-2">
                          <p className="text-sm text-green-600">{fileObj.analysis}</p>
                          {fileObj.confidence && (
                            <Badge variant="secondary" className="mt-1">
                              {fileObj.confidence}% confidence
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {fileObj.status === "error" && (
                        <div className="mt-2">
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{fileObj.error}</AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      {fileObj.status === "completed" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {fileObj.status === "error" && (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      {fileObj.status === "processing" && (
                        <Brain className="h-5 w-5 text-blue-500 animate-pulse" />
                      )}
                      {fileObj.status === "uploading" && (
                        <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileObj.id)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
            
            {completedFiles.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <Button 
                  onClick={processAllFiles} 
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? "Processing..." : "View Analysis Results"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Better Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Document Quality</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use high-resolution scans</li>
                <li>• Ensure text is clearly readable</li>
                <li>• Avoid handwritten documents</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Supported Formats</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• PDF documents (recommended)</li>
                <li>• Microsoft Word documents</li>
                <li>• Excel spreadsheets</li>
                <li>• Plain text files</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

