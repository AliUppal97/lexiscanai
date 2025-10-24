"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { 
  FileText, 
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Monitor,
  Globe,
  Shield,
  Edit,
  Trash2,
  Settings,
  LogIn,
  LogOut,
  UserPlus
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock data for demonstration
const mockAuditLogs = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    user: {
      id: "u1",
      name: "John Anderson",
      email: "john@lawfirm.com",
      avatar: undefined,
    },
    action: "document.create",
    resource: "Document",
    resourceId: "doc_123",
    resourceName: "Contract_2024.pdf",
    status: "success",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0",
    location: "New York, US",
    details: {
      fileSize: "2.4 MB",
      fileType: "PDF",
    },
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    user: {
      id: "u2",
      name: "Sarah Mitchell",
      email: "sarah@legalcorp.com",
      avatar: undefined,
    },
    action: "user.login",
    resource: "Authentication",
    status: "success",
    ipAddress: "10.0.0.45",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
    location: "San Francisco, US",
    details: {
      method: "Password",
      mfaEnabled: true,
    },
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    user: {
      id: "u3",
      name: "Michael Chen",
      email: "m.chen@techlaw.io",
      avatar: undefined,
    },
    action: "settings.update",
    resource: "OrganizationSettings",
    resourceId: "org_456",
    resourceName: "TechLaw Associates",
    status: "success",
    ipAddress: "172.16.0.10",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) Firefox/123.0",
    location: "Seattle, US",
    details: {
      changed: ["email_notifications", "retention_policy"],
    },
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    user: {
      id: "u4",
      name: "Emily Rodriguez",
      email: "e.rodriguez@justicefirm.com",
      avatar: undefined,
    },
    action: "user.login",
    resource: "Authentication",
    status: "failed",
    ipAddress: "203.0.113.42",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148",
    location: "Los Angeles, US",
    details: {
      method: "Password",
      reason: "Invalid credentials",
      attempts: 3,
    },
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    user: {
      id: "u5",
      name: "David Thompson",
      email: "david.t@corporatelaw.net",
      avatar: undefined,
    },
    action: "document.delete",
    resource: "Document",
    resourceId: "doc_789",
    resourceName: "Draft_Agreement.docx",
    status: "success",
    ipAddress: "192.0.2.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/122.0.0.0",
    location: "Boston, US",
    details: {
      fileSize: "1.2 MB",
      deletedBy: "Admin action",
    },
  },
]

export default function AdminAuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedLog, setSelectedLog] = useState<typeof mockAuditLogs[0] | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = 
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.resourceName && log.resourceName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesAction = actionFilter === "all" || log.action.startsWith(actionFilter)
    const matchesStatus = statusFilter === "all" || log.status === statusFilter
    
    return matchesSearch && matchesAction && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case "warning":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200" variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes("login")) return <LogIn className="h-4 w-4" />
    if (action.includes("logout")) return <LogOut className="h-4 w-4" />
    if (action.includes("create")) return <UserPlus className="h-4 w-4" />
    if (action.includes("update")) return <Edit className="h-4 w-4" />
    if (action.includes("delete")) return <Trash2 className="h-4 w-4" />
    if (action.includes("settings")) return <Settings className="h-4 w-4" />
    if (action.includes("document")) return <FileText className="h-4 w-4" />
    if (action.includes("user")) return <Users className="h-4 w-4" />
    return <Shield className="h-4 w-4" />
  }

  const handleViewDetails = (log: typeof mockAuditLogs[0]) => {
    setSelectedLog(log)
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Complete audit trail of all system activities.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{mockAuditLogs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Success</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockAuditLogs.filter(l => l.status === "success").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockAuditLogs.filter(l => l.status === "failed").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Last 24h</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockAuditLogs.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Detailed timeline of all user actions and system events.
              </CardDescription>
            </div>
          </div>
          
          {/* Filters and Search */}
          <div className="flex items-center gap-3 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="user">User Actions</SelectItem>
                <SelectItem value="document">Document Actions</SelectItem>
                <SelectItem value="settings">Settings Actions</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{formatDistanceToNow(log.timestamp, { addSuffix: true })}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={log.user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                          {log.user.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{log.user.name}</div>
                        <div className="text-xs text-gray-500 truncate">{log.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        {getActionIcon(log.action)}
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {log.action}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{log.resource}</div>
                      {log.resourceName && (
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                          {log.resourceName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(log.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{log.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No audit logs found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete information about this audit event.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6 py-4">
              {/* Event Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Event Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Timestamp</Label>
                    <p className="text-sm font-medium">
                      {selectedLog.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Status</Label>
                    <div>{getStatusBadge(selectedLog.status)}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Action</Label>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {selectedLog.action}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Resource</Label>
                    <p className="text-sm font-medium">{selectedLog.resource}</p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">User Information</h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedLog.user.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {selectedLog.user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedLog.user.name}</div>
                    <div className="text-sm text-gray-500">{selectedLog.user.email}</div>
                  </div>
                </div>
              </div>

              {/* Technical Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Technical Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500">IP Address</div>
                      <div className="font-mono">{selectedLog.ipAddress}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500">Location</div>
                      <div>{selectedLog.location}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Monitor className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500">User Agent</div>
                      <div className="text-xs break-all">{selectedLog.userAgent}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {Object.keys(selectedLog.details).length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Additional Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {Object.entries(selectedLog.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-medium">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

