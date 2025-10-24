"use client"

import { useState } from "react"
import { 
  Shield, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  Globe,
  Settings,
  FileText
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

// Mock data for demonstration
const mockSsoConnections = [
  {
    id: "1",
    name: "Okta Enterprise",
    provider: "SAML 2.0",
    domain: "lawfirm.com",
    status: "active",
    usersCount: 342,
    enabled: true,
    createdAt: new Date(2024, 0, 15),
    lastSync: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    name: "Azure AD",
    provider: "OpenID Connect",
    domain: "legalcorp.com",
    status: "active",
    usersCount: 156,
    enabled: true,
    createdAt: new Date(2024, 1, 10),
    lastSync: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: "3",
    name: "Google Workspace",
    provider: "OAuth 2.0",
    domain: "techlaw.io",
    status: "inactive",
    usersCount: 0,
    enabled: false,
    createdAt: new Date(2024, 2, 1),
    lastSync: null,
  },
]

export default function AdminSsoPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredConnections = mockSsoConnections.filter(conn =>
    conn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.provider.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
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
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SSO Configuration</h1>
          <p className="text-gray-600">Configure single sign-on for your organization.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add SSO Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add SSO Connection</DialogTitle>
              <DialogDescription>
                Configure a new single sign-on connection for your organization.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="saml" className="py-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="saml">SAML 2.0</TabsTrigger>
                <TabsTrigger value="oidc">OpenID Connect</TabsTrigger>
                <TabsTrigger value="oauth">OAuth 2.0</TabsTrigger>
              </TabsList>
              
              <TabsContent value="saml" className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>SAML 2.0 Configuration</AlertTitle>
                  <AlertDescription>
                    Configure your identity provider to use these endpoints.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label htmlFor="samlName">Connection Name</Label>
                  <Input id="samlName" placeholder="e.g., Okta Enterprise" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="samlDomain">Organization Domain</Label>
                  <Input id="samlDomain" placeholder="company.com" />
                </div>
                
                <div className="space-y-2">
                  <Label>SAML Endpoints</Label>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div>
                      <Label className="text-xs text-gray-500">ACS URL</Label>
                      <code className="block px-3 py-2 bg-white border rounded text-xs mt-1">
                        https://app.lexiscan.ai/auth/saml/callback
                      </code>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Entity ID</Label>
                      <code className="block px-3 py-2 bg-white border rounded text-xs mt-1">
                        https://app.lexiscan.ai/auth/saml/metadata
                      </code>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="samlSsoUrl">Identity Provider SSO URL</Label>
                  <Input id="samlSsoUrl" placeholder="https://idp.example.com/sso/saml" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="samlEntityId">Identity Provider Entity ID</Label>
                  <Input id="samlEntityId" placeholder="https://idp.example.com/metadata" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="samlCertificate">X.509 Certificate</Label>
                  <Textarea 
                    id="samlCertificate" 
                    placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                    rows={4}
                    className="font-mono text-xs"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="oidc" className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>OpenID Connect Configuration</AlertTitle>
                  <AlertDescription>
                    Configure your OIDC provider credentials.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label htmlFor="oidcName">Connection Name</Label>
                  <Input id="oidcName" placeholder="e.g., Azure AD" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="oidcDomain">Organization Domain</Label>
                  <Input id="oidcDomain" placeholder="company.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="oidcIssuer">Issuer URL</Label>
                  <Input id="oidcIssuer" placeholder="https://login.microsoftonline.com/tenant-id/v2.0" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="oidcClientId">Client ID</Label>
                  <Input id="oidcClientId" placeholder="application-client-id" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="oidcClientSecret">Client Secret</Label>
                  <Input id="oidcClientSecret" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label>Redirect URI</Label>
                  <code className="block px-3 py-2 bg-gray-50 rounded text-xs">
                    https://app.lexiscan.ai/auth/oidc/callback
                  </code>
                </div>
              </TabsContent>
              
              <TabsContent value="oauth" className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>OAuth 2.0 Configuration</AlertTitle>
                  <AlertDescription>
                    Configure your OAuth provider credentials.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label htmlFor="oauthName">Connection Name</Label>
                  <Input id="oauthName" placeholder="e.g., Google Workspace" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="oauthDomain">Organization Domain</Label>
                  <Input id="oauthDomain" placeholder="company.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="oauthProvider">OAuth Provider</Label>
                  <Select defaultValue="google">
                    <SelectTrigger id="oauthProvider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="github">GitHub</SelectItem>
                      <SelectItem value="gitlab">GitLab</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="oauthClientId">Client ID</Label>
                  <Input id="oauthClientId" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="oauthClientSecret">Client Secret</Label>
                  <Input id="oauthClientSecret" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label>Redirect URI</Label>
                  <code className="block px-3 py-2 bg-gray-50 rounded text-xs">
                    https://app.lexiscan.ai/auth/oauth/callback
                  </code>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Connection
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
                <p className="text-sm font-medium text-gray-500">Total Connections</p>
                <p className="text-2xl font-bold text-gray-900">{mockSsoConnections.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockSsoConnections.filter(c => c.status === "active").length}
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
                <p className="text-sm font-medium text-gray-500">SSO Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockSsoConnections.reduce((sum, c) => sum + c.usersCount, 0)}
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
                <p className="text-sm font-medium text-gray-500">Domains</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(mockSsoConnections.map(c => c.domain)).size}
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SSO Connections Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search connections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredConnections.map((connection) => (
            <Card key={connection.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base mb-1">{connection.name}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{connection.provider}</Badge>
                        {getStatusBadge(connection.status)}
                      </div>
                      <p className="text-sm text-gray-500">{connection.domain}</p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Configuration
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Test Connection
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download Metadata
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Endpoints
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Connection
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">SSO Enabled</span>
                  <Switch checked={connection.enabled} />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Users</span>
                  <Badge variant="outline">{connection.usersCount}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-900">{connection.createdAt.toLocaleDateString()}</span>
                </div>
                
                {connection.lastSync && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Sync</span>
                    <span className="text-gray-900">
                      {new Date(connection.lastSync).toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredConnections.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No SSO connections found.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Configuration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>SSO Setup Guide</CardTitle>
          <CardDescription>
            Follow these steps to configure single sign-on for your organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              1
            </div>
            <div>
              <h4 className="font-semibold mb-1">Choose Your Identity Provider</h4>
              <p className="text-sm text-gray-600">
                Select from SAML 2.0, OpenID Connect, or OAuth 2.0 based on your organization&apos;s identity provider.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              2
            </div>
            <div>
              <h4 className="font-semibold mb-1">Configure Your Identity Provider</h4>
              <p className="text-sm text-gray-600">
                Add LexiScan AI as an application in your identity provider using the provided endpoints.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              3
            </div>
            <div>
              <h4 className="font-semibold mb-1">Add Connection Details</h4>
              <p className="text-sm text-gray-600">
                Enter your identity provider&apos;s configuration details, certificates, and credentials.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              4
            </div>
            <div>
              <h4 className="font-semibold mb-1">Test and Enable</h4>
              <p className="text-sm text-gray-600">
                Test the connection to ensure everything works correctly, then enable SSO for your organization.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

