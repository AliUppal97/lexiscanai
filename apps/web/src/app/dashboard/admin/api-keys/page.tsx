"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { 
  Key, 
  Plus, 
  Search, 
  MoreVertical, 
  Copy, 
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Shield,
  Globe
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

// Mock data for demonstration
const mockApiKeys = [
  {
    id: "1",
    name: "Production API Key",
    key: "sk_live_51H8...xYz2",
    fullKey: "sk_live_51H8AbCdEfGhIjKlMnOpQrStUvWxYz12345678901234567890xYz2",
    description: "Main production API key for document processing",
    status: "active",
    lastUsed: new Date(Date.now() - 1000 * 60 * 15),
    createdAt: new Date(2024, 0, 15),
    expiresAt: null,
    permissions: ["documents.read", "documents.write", "analytics.read"],
    requestCount: 15234,
    rateLimit: "1000/hour",
  },
  {
    id: "2",
    name: "Development API Key",
    key: "sk_test_51H8...aB3",
    fullKey: "sk_test_51H8AbCdEfGhIjKlMnOpQrStUvWxYz12345678901234567890aB3",
    description: "Development and testing purposes",
    status: "active",
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
    createdAt: new Date(2024, 1, 10),
    expiresAt: null,
    permissions: ["documents.read", "documents.write"],
    requestCount: 892,
    rateLimit: "100/hour",
  },
  {
    id: "3",
    name: "Webhook Integration",
    key: "sk_live_51J2...kL4",
    fullKey: "sk_live_51J2AbCdEfGhIjKlMnOpQrStUvWxYz12345678901234567890kL4",
    description: "API key for webhook event processing",
    status: "active",
    lastUsed: new Date(Date.now() - 1000 * 60 * 5),
    createdAt: new Date(2024, 2, 1),
    expiresAt: null,
    permissions: ["webhooks.manage"],
    requestCount: 5621,
    rateLimit: "500/hour",
  },
  {
    id: "4",
    name: "Legacy API Key",
    key: "sk_live_41G7...mN5",
    fullKey: "sk_live_41G7AbCdEfGhIjKlMnOpQrStUvWxYz12345678901234567890mN5",
    description: "Old API key - scheduled for deprecation",
    status: "inactive",
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    createdAt: new Date(2023, 10, 5),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    permissions: ["documents.read"],
    requestCount: 42156,
    rateLimit: "500/hour",
  },
]

export default function AdminApiKeysPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState<typeof mockApiKeys[0] | null>(null)
  const [showFullKeys, setShowFullKeys] = useState<Record<string, boolean>>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const filteredKeys = mockApiKeys.filter(key => {
    const matchesSearch = 
      key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || key.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string, expiresAt: Date | null) => {
    if (expiresAt && expiresAt < new Date()) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">
          <AlertCircle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      )
    }
    
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200" variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleViewDetails = (key: typeof mockApiKeys[0]) => {
    setSelectedKey(key)
    setIsViewDialogOpen(true)
  }

  const toggleKeyVisibility = (keyId: string) => {
    setShowFullKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Key Management</h1>
          <p className="text-gray-600">Manage API keys for programmatic access.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for programmatic access to LexiScan AI.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Security Notice</AlertTitle>
                <AlertDescription>
                  Keep your API key secure. Never share it publicly or commit it to version control.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input id="keyName" placeholder="e.g., Production API Key" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keyDescription">Description</Label>
                <Textarea 
                  id="keyDescription" 
                  placeholder="Describe the purpose of this API key"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rateLimit">Rate Limit</Label>
                <Select defaultValue="1000">
                  <SelectTrigger id="rateLimit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 requests/hour</SelectItem>
                    <SelectItem value="500">500 requests/hour</SelectItem>
                    <SelectItem value="1000">1,000 requests/hour</SelectItem>
                    <SelectItem value="5000">5,000 requests/hour</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  {[
                    { id: "documents.read", label: "Read Documents" },
                    { id: "documents.write", label: "Write Documents" },
                    { id: "analytics.read", label: "Read Analytics" },
                    { id: "webhooks.manage", label: "Manage Webhooks" },
                    { id: "users.read", label: "Read Users" },
                  ].map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox id={permission.id} />
                      <Label htmlFor={permission.id} className="text-sm font-normal cursor-pointer">
                        {permission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiration">Expiration (Optional)</Label>
                <Select defaultValue="never">
                  <SelectTrigger id="expiration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Generate Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Keys</p>
                <p className="text-2xl font-bold text-gray-900">{mockApiKeys.length}</p>
              </div>
              <Key className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Keys</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockApiKeys.filter(k => k.status === "active").length}
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
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockApiKeys.reduce((sum, k) => sum + k.requestCount, 0).toLocaleString()}
                </p>
              </div>
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockApiKeys.filter(k => k.expiresAt && k.expiresAt < new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for programmatic access.
              </CardDescription>
            </div>
          </div>
          
          {/* Filters and Search */}
          <div className="flex items-center gap-3 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search keys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Requests</TableHead>
                <TableHead>Rate Limit</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{key.name}</div>
                      <div className="text-sm text-gray-500">{key.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                        {showFullKeys[key.id] ? key.fullKey : key.key}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleKeyVisibility(key.id)}
                      >
                        {showFullKeys[key.id] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopyKey(key.fullKey)}
                      >
                        {copiedKey === key.fullKey ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(key.status, key.expiresAt)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(key.lastUsed, { addSuffix: true })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{key.requestCount.toLocaleString()}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{key.rateLimit}</span>
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
                        <DropdownMenuItem onClick={() => handleViewDetails(key)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyKey(key.fullKey)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Key
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Revoke Key
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredKeys.length === 0 && (
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No API keys found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>API Key Details</DialogTitle>
            <DialogDescription>
              Complete information and usage statistics for this API key.
            </DialogDescription>
          </DialogHeader>
          
          {selectedKey && (
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Key Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Name</Label>
                    <p className="text-sm font-medium">{selectedKey.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Status</Label>
                    <div>{getStatusBadge(selectedKey.status, selectedKey.expiresAt)}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Created</Label>
                    <p className="text-sm">{selectedKey.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Expires</Label>
                    <p className="text-sm">
                      {selectedKey.expiresAt ? selectedKey.expiresAt.toLocaleDateString() : "Never"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-500">API Key</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-xs font-mono break-all">
                    {selectedKey.fullKey}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyKey(selectedKey.fullKey)}
                  >
                    {copiedKey === selectedKey.fullKey ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Usage Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Total Requests</Label>
                    <p className="text-2xl font-bold">{selectedKey.requestCount.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Rate Limit</Label>
                    <p className="text-2xl font-bold">{selectedKey.rateLimit.split('/')[0]}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Last Used</Label>
                    <p className="text-sm">{formatDistanceToNow(selectedKey.lastUsed, { addSuffix: true })}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Permissions</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedKey.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

