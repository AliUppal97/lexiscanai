"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { 
  Webhook, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit,
  Trash2,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  XCircle,
  Send,
  AlertCircle,
  Globe,
  Copy,
  RefreshCw,
  Eye
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
const mockWebhooks = [
  {
    id: "1",
    name: "Document Processing Webhook",
    url: "https://api.company.com/webhooks/documents",
    events: ["document.created", "document.updated", "document.reviewed"],
    status: "active",
    lastTriggered: new Date(Date.now() - 1000 * 60 * 5),
    createdAt: new Date(2024, 0, 15),
    successRate: 98.5,
    totalDeliveries: 1523,
    failedDeliveries: 23,
    secret: "whsec_*********************xyz",
    headers: {
      "X-Custom-Header": "value",
    },
  },
  {
    id: "2",
    name: "User Events Webhook",
    url: "https://app.example.com/api/webhooks/users",
    events: ["user.created", "user.updated", "user.deleted"],
    status: "active",
    lastTriggered: new Date(Date.now() - 1000 * 60 * 15),
    createdAt: new Date(2024, 1, 10),
    successRate: 95.2,
    totalDeliveries: 892,
    failedDeliveries: 45,
    secret: "whsec_*********************abc",
    headers: {},
  },
  {
    id: "3",
    name: "Analytics Webhook",
    url: "https://analytics.service.io/webhooks/events",
    events: ["analytics.report"],
    status: "paused",
    lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    createdAt: new Date(2024, 2, 1),
    successRate: 100,
    totalDeliveries: 156,
    failedDeliveries: 0,
    secret: "whsec_*********************def",
    headers: {},
  },
  {
    id: "4",
    name: "Legacy Webhook",
    url: "https://old-system.company.com/webhook",
    events: ["document.created"],
    status: "failed",
    lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 24),
    createdAt: new Date(2023, 10, 5),
    successRate: 45.8,
    totalDeliveries: 2341,
    failedDeliveries: 1269,
    secret: "whsec_*********************ghi",
    headers: {},
  },
]

const availableEvents = [
  { category: "Documents", events: [
    { id: "document.created", name: "Document Created" },
    { id: "document.updated", name: "Document Updated" },
    { id: "document.deleted", name: "Document Deleted" },
    { id: "document.reviewed", name: "Document Reviewed" },
  ]},
  { category: "Users", events: [
    { id: "user.created", name: "User Created" },
    { id: "user.updated", name: "User Updated" },
    { id: "user.deleted", name: "User Deleted" },
  ]},
  { category: "Analytics", events: [
    { id: "analytics.report", name: "Analytics Report Generated" },
  ]},
  { category: "Settings", events: [
    { id: "settings.updated", name: "Settings Updated" },
  ]},
]

export default function AdminWebhooksPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<typeof mockWebhooks[0] | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  const filteredWebhooks = mockWebhooks.filter(webhook => {
    const matchesSearch = 
      webhook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webhook.url.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || webhook.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "paused":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200" variant="outline">
            <PauseCircle className="h-3 w-3 mr-1" />
            Paused
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleToggleEvent = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    )
  }

  const handleTest = (webhook: typeof mockWebhooks[0]) => {
    setSelectedWebhook(webhook)
    setIsTestDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhook Configuration</h1>
          <p className="text-gray-600">Configure webhooks to receive real-time event notifications.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>
                Configure a webhook endpoint to receive event notifications.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertTitle>Webhook Requirements</AlertTitle>
                <AlertDescription>
                  Your endpoint must accept POST requests and return a 2xx status code.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="webhookName">Webhook Name</Label>
                <Input id="webhookName" placeholder="e.g., Document Processing Webhook" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Endpoint URL</Label>
                <Input 
                  id="webhookUrl" 
                  type="url"
                  placeholder="https://api.your-domain.com/webhooks" 
                />
              </div>
              
              <div className="space-y-3">
                <Label>Events to Subscribe</Label>
                <div className="border rounded-lg p-4 space-y-4 max-h-[300px] overflow-y-auto">
                  {availableEvents.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="font-medium text-sm text-gray-700">
                        {category.category}
                      </div>
                      <div className="pl-4 space-y-2">
                        {category.events.map((event) => (
                          <div key={event.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={event.id}
                              checked={selectedEvents.includes(event.id)}
                              onCheckedChange={() => handleToggleEvent(event.id)}
                            />
                            <Label 
                              htmlFor={event.id}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {event.name}
                              <code className="ml-2 text-xs text-gray-500">({event.id})</code>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhookSecret">Signing Secret (Optional)</Label>
                <Input 
                  id="webhookSecret" 
                  placeholder="Leave empty to auto-generate"
                  type="password"
                />
                <p className="text-xs text-gray-500">
                  Used to verify webhook authenticity. Will be auto-generated if not provided.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Custom Headers (Optional)</Label>
                <Textarea 
                  placeholder={'{\n  "X-Custom-Header": "value"\n}'}
                  rows={3}
                  className="font-mono text-xs"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Webhook
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
                <p className="text-sm font-medium text-gray-500">Total Webhooks</p>
                <p className="text-2xl font-bold text-gray-900">{mockWebhooks.length}</p>
              </div>
              <Webhook className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockWebhooks.filter(w => w.status === "active").length}
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
                <p className="text-sm font-medium text-gray-500">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockWebhooks.reduce((sum, w) => sum + w.totalDeliveries, 0).toLocaleString()}
                </p>
              </div>
              <Send className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(mockWebhooks.reduce((sum, w) => sum + w.successRate, 0) / mockWebhooks.length).toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configured Webhooks</CardTitle>
              <CardDescription>
                Manage your webhook endpoints and event subscriptions.
              </CardDescription>
            </div>
          </div>
          
          {/* Filters and Search */}
          <div className="flex items-center gap-3 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search webhooks..."
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
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Webhook</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Last Triggered</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWebhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{webhook.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-[300px]">
                        {webhook.url}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(webhook.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.slice(0, 2).map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event.split('.')[1]}
                        </Badge>
                      ))}
                      {webhook.events.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{webhook.events.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              webhook.successRate >= 90 ? 'bg-green-500' :
                              webhook.successRate >= 70 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${webhook.successRate}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {webhook.successRate}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(webhook.lastTriggered, { addSuffix: true })}
                    </span>
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
                        <DropdownMenuItem onClick={() => handleTest(webhook)}>
                          <Send className="h-4 w-4 mr-2" />
                          Test Webhook
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Logs
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Configuration
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Secret
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Rotate Secret
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {webhook.status === "active" ? (
                          <DropdownMenuItem className="text-yellow-600">
                            <PauseCircle className="h-4 w-4 mr-2" />
                            Pause Webhook
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Activate Webhook
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Webhook
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredWebhooks.length === 0 && (
            <div className="text-center py-12">
              <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No webhooks found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Webhook Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Webhook</DialogTitle>
            <DialogDescription>
              Send a test event to verify your webhook configuration.
            </DialogDescription>
          </DialogHeader>
          
          {selectedWebhook && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Endpoint</Label>
                <code className="block px-3 py-2 bg-gray-100 rounded text-xs font-mono break-all">
                  {selectedWebhook.url}
                </code>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="testEvent">Event Type</Label>
                <Select defaultValue={selectedWebhook.events[0]}>
                  <SelectTrigger id="testEvent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedWebhook.events.map((event) => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will send a test payload to your endpoint. Make sure your endpoint is ready to receive it.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsTestDialogOpen(false)}>
              <Send className="h-4 w-4 mr-2" />
              Send Test Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

