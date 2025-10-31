"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  Trash2, 
  MoreVertical,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Grid,
  List
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const documents = [
  {
    id: "1",
    name: "Service Agreement - TechCorp.pdf",
    type: "Contract",
    status: "completed",
    uploadedBy: "John Doe",
    uploadedAt: "2024-01-15",
    size: "2.4 MB",
    confidence: 96,
    tags: ["contract", "service", "techcorp"],
    analysis: "Contract reviewed, 3 risks identified"
  },
  {
    id: "2",
    name: "NDA Template - Client ABC.docx",
    type: "Legal Document",
    status: "processing",
    uploadedBy: "Jane Smith",
    uploadedAt: "2024-01-14",
    size: "1.8 MB",
    confidence: null,
    tags: ["nda", "template", "confidential"],
    analysis: "Analyzing clauses and terms..."
  },
  {
    id: "3",
    name: "Employment Contract - John Smith.pdf",
    type: "Contract",
    status: "completed",
    uploadedBy: "Mike Johnson",
    uploadedAt: "2024-01-13",
    size: "3.1 MB",
    confidence: 94,
    tags: ["employment", "contract", "hr"],
    analysis: "Contract reviewed, 1 recommendation"
  },
  {
    id: "4",
    name: "Partnership Agreement - StartupXYZ.pdf",
    type: "Contract",
    status: "error",
    uploadedBy: "Sarah Wilson",
    uploadedAt: "2024-01-12",
    size: "2.9 MB",
    confidence: null,
    tags: ["partnership", "agreement", "startup"],
    analysis: "Failed to process - corrupted file"
  },
  {
    id: "5",
    name: "Privacy Policy - Updated.pdf",
    type: "Policy",
    status: "completed",
    uploadedBy: "Alex Brown",
    uploadedAt: "2024-01-11",
    size: "1.2 MB",
    confidence: 98,
    tags: ["privacy", "policy", "compliance"],
    analysis: "Policy reviewed, fully compliant"
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "processing":
      return <Clock className="h-4 w-4 text-blue-500" />
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>
    case "processing":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing</Badge>
    case "error":
      return <Badge variant="destructive">Error</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export default function DocumentsPage() {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    const matchesType = typeFilter === "all" || doc.type.toLowerCase().includes(typeFilter.toLowerCase())
    
    return matchesSearch && matchesStatus && matchesType
  })

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    )
  }

  const handleSelectAll = () => {
    setSelectedDocuments(
      selectedDocuments.length === filteredDocuments.length 
        ? [] 
        : filteredDocuments.map(doc => doc.id)
    )
  }

  const handleExport = (selectedOnly = false) => {
    // Determine which documents to export
    const documentsToExport = selectedOnly 
      ? filteredDocuments.filter(doc => selectedDocuments.includes(doc.id))
      : filteredDocuments

    // Check if there are documents to export
    if (documentsToExport.length === 0) {
      return
    }

    // Prepare CSV data
    const headers = ["Name", "Type", "Status", "Uploaded By", "Date", "Size", "Confidence", "Tags", "Analysis"]
    const csvRows = [headers.join(",")]

    documentsToExport.forEach(doc => {
      const row = [
        `"${doc.name.replace(/"/g, '""')}"`,
        `"${doc.type}"`,
        `"${doc.status}"`,
        `"${doc.uploadedBy}"`,
        `"${doc.uploadedAt}"`,
        `"${doc.size}"`,
        doc.confidence ? doc.confidence.toString() : "-",
        `"${doc.tags.join("; ")}"`,
        `"${(doc.analysis || "").replace(/"/g, '""')}"`
      ]
      csvRows.push(row.join(","))
    })

    // Create CSV content
    const csvContent = csvRows.join("\n")
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0]
    const filePrefix = selectedOnly ? "selected-documents" : "documents-export"
    link.download = `${filePrefix}-${timestamp}.csv`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage and analyze your uploaded documents</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => handleExport(false)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/upload">
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents, tags, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="legal">Legal Document</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-l-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
              <CardDescription>
                {selectedDocuments.length > 0 && `${selectedDocuments.length} selected`}
              </CardDescription>
            </div>
            {selectedDocuments.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleExport(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Selected
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "list" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedDocuments.includes(doc.id)}
                        onCheckedChange={() => handleSelectDocument(doc.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{doc.name}</div>
                          <div className="text-sm text-gray-500">{doc.analysis}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {doc.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(doc.status)}
                        {getStatusBadge(doc.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{doc.uploadedBy}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{doc.uploadedAt}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{doc.size}</TableCell>
                    <TableCell>
                      {doc.confidence ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {doc.confidence}%
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">
                    {selectedDocuments.length > 0 
                      ? `${selectedDocuments.length} selected` 
                      : "Select all"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className={`hover:shadow-md transition-shadow ${selectedDocuments.includes(doc.id) ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedDocuments.includes(doc.id)}
                            onCheckedChange={() => handleSelectDocument(doc.id)}
                          />
                          <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{doc.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{doc.analysis}</p>
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(doc.status)}
                            {getStatusBadge(doc.status)}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span className="truncate">{doc.uploadedBy}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{doc.uploadedAt}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-gray-500">{doc.size}</span>
                          {doc.confidence ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              {doc.confidence}% confidence
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

