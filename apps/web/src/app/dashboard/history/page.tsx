"use client"

import { useState } from "react"
import { 
  History, 
  Search, 
  Filter, 
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Eye,
  Trash2,
  MoreVertical,
  RefreshCw,
  ChevronLeft,
  ChevronRight
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const historyData = [
  {
    id: "1",
    action: "Document Processed",
    document: "Service Agreement - TechCorp.pdf",
    user: "John Doe",
    timestamp: "2024-01-15T10:30:00Z",
    status: "success",
    details: "Contract reviewed, 3 risks identified",
    duration: "2.3 minutes",
    confidence: 96
  },
  {
    id: "2",
    action: "Analysis Completed",
    document: "NDA Template - Client ABC.docx",
    user: "Jane Smith",
    timestamp: "2024-01-15T09:45:00Z",
    status: "success",
    details: "Analyzing clauses and terms...",
    duration: "1.8 minutes",
    confidence: 94
  },
  {
    id: "3",
    action: "Processing Failed",
    document: "Partnership Agreement - StartupXYZ.pdf",
    user: "Mike Johnson",
    timestamp: "2024-01-15T08:20:00Z",
    status: "error",
    details: "Failed to process - corrupted file",
    duration: "0.5 minutes",
    confidence: null
  },
  {
    id: "4",
    action: "Document Uploaded",
    document: "Privacy Policy - Updated.pdf",
    user: "Sarah Wilson",
    timestamp: "2024-01-14T16:15:00Z",
    status: "success",
    details: "Document uploaded successfully",
    duration: "0.2 minutes",
    confidence: null
  },
  {
    id: "5",
    action: "Analysis Completed",
    document: "Employment Contract - John Smith.pdf",
    user: "Alex Brown",
    timestamp: "2024-01-14T14:30:00Z",
    status: "success",
    details: "Contract reviewed, 1 recommendation",
    duration: "3.1 minutes",
    confidence: 98
  },
  {
    id: "6",
    action: "Document Processed",
    document: "Terms of Service - Updated.pdf",
    user: "Emma Davis",
    timestamp: "2024-01-14T11:45:00Z",
    status: "success",
    details: "Terms reviewed, fully compliant",
    duration: "1.9 minutes",
    confidence: 97
  },
  {
    id: "7",
    action: "Processing Failed",
    document: "Contract Template - Old.docx",
    user: "Tom Wilson",
    timestamp: "2024-01-13T15:20:00Z",
    status: "error",
    details: "Unsupported file format",
    duration: "0.1 minutes",
    confidence: null
  },
  {
    id: "8",
    action: "Analysis Completed",
    document: "License Agreement - Software.pdf",
    user: "Lisa Chen",
    timestamp: "2024-01-13T13:10:00Z",
    status: "success",
    details: "License terms analyzed, 2 clauses flagged",
    duration: "2.7 minutes",
    confidence: 95
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "processing":
      return <Clock className="h-4 w-4 text-blue-500" />
    default:
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Success</Badge>
    case "error":
      return <Badge variant="destructive">Error</Badge>
    case "processing":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

export default function HistoryPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredData = historyData.filter(item => {
    const matchesSearch = item.document.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.action.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesAction = actionFilter === "all" || item.action.toLowerCase().includes(actionFilter.toLowerCase())
    
    return matchesSearch && matchesStatus && matchesAction
  })

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === currentData.length 
        ? [] 
        : currentData.map(item => item.id)
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History</h1>
          <p className="text-gray-600">Complete audit trail of all document processing activities</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents, users, or actions..."
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
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity History ({filteredData.length})</CardTitle>
              <CardDescription>
                {selectedItems.length > 0 && `${selectedItems.length} selected`}
              </CardDescription>
            </div>
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.length === currentData.length && currentData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((item) => {
                const { date, time } = formatTimestamp(item.timestamp)
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => handleSelectItem(item.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.status)}
                        <span className="font-medium">{item.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{item.document}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{item.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div className="text-sm">
                          <div>{date}</div>
                          <div className="text-gray-500">{time}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{item.duration}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.confidence ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {item.confidence}%
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
                            Download Report
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <History className="h-4 w-4 mr-2" />
                            View Timeline
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

