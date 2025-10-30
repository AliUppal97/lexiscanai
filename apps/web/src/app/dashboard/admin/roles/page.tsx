"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { 
  Shield, 
  Plus, 
  Search, 
  MoreVertical, 
  Users, 
  Edit,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Settings
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

// Mock data for demonstration
const mockRoles = [
  {
    id: "1",
    name: "Super Admin",
    description: "Full system access with all privileges",
    type: "system",
    usersCount: 2,
    permissions: ["users.create", "users.update", "users.delete", "roles.manage", "settings.manage", "billing.manage"],
    isDefault: false,
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Organization Admin",
    description: "Manage organization users and settings",
    type: "custom",
    usersCount: 15,
    permissions: ["users.view", "users.create", "users.update", "documents.manage", "team.manage"],
    isDefault: false,
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    name: "User",
    description: "Standard user with document access",
    type: "system",
    usersCount: 342,
    permissions: ["documents.view", "documents.create", "documents.update", "profile.manage"],
    isDefault: true,
    createdAt: "2024-01-01",
  },
  {
    id: "4",
    name: "Viewer",
    description: "Read-only access to documents",
    type: "system",
    usersCount: 89,
    permissions: ["documents.view", "profile.view"],
    isDefault: false,
    createdAt: "2024-01-01",
  },
  {
    id: "5",
    name: "Document Manager",
    description: "Manage all documents and reviews",
    type: "custom",
    usersCount: 28,
    permissions: ["documents.view", "documents.create", "documents.update", "documents.delete", "documents.review"],
    isDefault: false,
    createdAt: "2024-02-10",
  },
]

const availablePermissions = [
  { category: "Users", permissions: [
    { id: "users.view", name: "View Users" },
    { id: "users.create", name: "Create Users" },
    { id: "users.update", name: "Update Users" },
    { id: "users.delete", name: "Delete Users" },
  ]},
  { category: "Documents", permissions: [
    { id: "documents.view", name: "View Documents" },
    { id: "documents.create", name: "Create Documents" },
    { id: "documents.update", name: "Update Documents" },
    { id: "documents.delete", name: "Delete Documents" },
    { id: "documents.review", name: "Review Documents" },
  ]},
  { category: "Team", permissions: [
    { id: "team.view", name: "View Team" },
    { id: "team.manage", name: "Manage Team" },
  ]},
  { category: "Settings", permissions: [
    { id: "settings.view", name: "View Settings" },
    { id: "settings.manage", name: "Manage Settings" },
  ]},
  { category: "Billing", permissions: [
    { id: "billing.view", name: "View Billing" },
    { id: "billing.manage", name: "Manage Billing" },
  ]},
  { category: "Roles", permissions: [
    { id: "roles.view", name: "View Roles" },
    { id: "roles.manage", name: "Manage Roles" },
  ]},
]

export default function AdminRolesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const filteredRoles = mockRoles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadge = (type: string) => {
    return type === "system" ? (
      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
        System
      </Badge>
    ) : (
      <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
        Custom
      </Badge>
    )
  }

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">Define and manage user roles and permissions.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions and access levels.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input id="roleName" placeholder="e.g., Document Manager" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roleDescription">Description</Label>
                <Textarea 
                  id="roleDescription" 
                  placeholder="Describe the role's purpose and responsibilities"
                  rows={3}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="border rounded-lg p-4 space-y-4 max-h-[400px] overflow-y-auto">
                  {availablePermissions.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="font-medium text-sm text-gray-700 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        {category.category}
                      </div>
                      <div className="pl-6 space-y-2">
                        {category.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={selectedPermissions.includes(permission.id)}
                              onCheckedChange={() => handleTogglePermission(permission.id)}
                            />
                            <Label 
                              htmlFor={permission.id}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="setDefault" />
                <Label htmlFor="setDefault" className="text-sm font-normal cursor-pointer">
                  Set as default role for new users
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Role
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
                <p className="text-sm font-medium text-gray-500">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">{mockRoles.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">System Roles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockRoles.filter(r => r.type === "system").length}
                </p>
              </div>
              <Lock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Custom Roles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockRoles.filter(r => r.type === "custom").length}
                </p>
              </div>
              <Unlock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockRoles.reduce((sum, r) => sum + r.usersCount, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      {role.type === "system" ? (
                        <Lock className="h-5 w-5 text-white" />
                      ) : (
                        <Shield className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base truncate">{role.name}</CardTitle>
                        {role.isDefault && (
                          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      {getRoleBadge(role.type)}
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
                        Edit Role
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="h-4 w-4 mr-2" />
                        View Users
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {role.type === "custom" && (
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Role
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{role.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Assigned Users</span>
                  <Badge variant="secondary">{role.usersCount}</Badge>
                </div>
                
                <div className="space-y-2">
                  <span className="text-xs font-medium text-gray-500">Permissions ({role.permissions.length})</span>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission.split('.')[1]}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRoles.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No roles found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

