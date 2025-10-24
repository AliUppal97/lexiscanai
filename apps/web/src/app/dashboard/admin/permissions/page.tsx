"use client"

import { useState } from "react"
import { 
  Shield, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit,
  Trash2,
  Lock,
  Unlock,
  FileText,
  Users,
  Settings,
  DollarSign,
  Database,
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

// Mock data for demonstration
const mockPermissions = [
  {
    id: "1",
    resource: "documents",
    action: "view",
    name: "View Documents",
    description: "Ability to view all documents in the system",
    category: "Documents",
    isSystem: true,
    rolesCount: 5,
    usersCount: 450,
  },
  {
    id: "2",
    resource: "documents",
    action: "create",
    name: "Create Documents",
    description: "Ability to upload and create new documents",
    category: "Documents",
    isSystem: true,
    rolesCount: 4,
    usersCount: 380,
  },
  {
    id: "3",
    resource: "documents",
    action: "update",
    name: "Update Documents",
    description: "Ability to modify existing documents",
    category: "Documents",
    isSystem: true,
    rolesCount: 3,
    usersCount: 250,
  },
  {
    id: "4",
    resource: "documents",
    action: "delete",
    name: "Delete Documents",
    description: "Ability to permanently delete documents",
    category: "Documents",
    isSystem: true,
    rolesCount: 2,
    usersCount: 50,
  },
  {
    id: "5",
    resource: "users",
    action: "view",
    name: "View Users",
    description: "Ability to view user profiles and information",
    category: "Users",
    isSystem: true,
    rolesCount: 3,
    usersCount: 120,
  },
  {
    id: "6",
    resource: "users",
    action: "create",
    name: "Create Users",
    description: "Ability to create new user accounts",
    category: "Users",
    isSystem: true,
    rolesCount: 2,
    usersCount: 25,
  },
  {
    id: "7",
    resource: "billing",
    action: "manage",
    name: "Manage Billing",
    description: "Full access to billing and subscription management",
    category: "Billing",
    isSystem: true,
    rolesCount: 1,
    usersCount: 5,
  },
  {
    id: "8",
    resource: "settings",
    action: "manage",
    name: "Manage Settings",
    description: "Ability to configure system settings",
    category: "Settings",
    isSystem: true,
    rolesCount: 2,
    usersCount: 15,
  },
  {
    id: "9",
    resource: "analytics",
    action: "view",
    name: "View Analytics",
    description: "Access to analytics and reporting dashboards",
    category: "Analytics",
    isSystem: false,
    rolesCount: 3,
    usersCount: 85,
  },
  {
    id: "10",
    resource: "api",
    action: "access",
    name: "API Access",
    description: "Ability to use API endpoints",
    category: "API",
    isSystem: false,
    rolesCount: 2,
    usersCount: 42,
  },
]

const categories = [
  { value: "all", label: "All Categories" },
  { value: "Documents", label: "Documents", icon: FileText },
  { value: "Users", label: "Users", icon: Users },
  { value: "Settings", label: "Settings", icon: Settings },
  { value: "Billing", label: "Billing", icon: DollarSign },
  { value: "Analytics", label: "Analytics", icon: Database },
  { value: "API", label: "API", icon: Globe },
]

export default function AdminPermissionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredPermissions = mockPermissions.filter(permission => {
    const matchesSearch = 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.resource.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === "all" || permission.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category)
    if (!categoryData || !categoryData.icon) return FileText
    return categoryData.icon
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permission Configuration</h1>
          <p className="text-gray-600">Define and manage granular access permissions.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Permission
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Permission</DialogTitle>
              <DialogDescription>
                Define a new permission that can be assigned to roles.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resource">Resource</Label>
                  <Input id="resource" placeholder="e.g., documents, users" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action">Action</Label>
                  <Input id="action" placeholder="e.g., view, create, delete" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="permissionName">Display Name</Label>
                <Input id="permissionName" placeholder="e.g., View Documents" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue="Documents">
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.value !== "all").map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe what this permission allows users to do"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>System Permission</Label>
                  <p className="text-sm text-gray-500">
                    System permissions cannot be deleted
                  </p>
                </div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Permission
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
                <p className="text-sm font-medium text-gray-500">Total Permissions</p>
                <p className="text-2xl font-bold text-gray-900">{mockPermissions.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">System</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockPermissions.filter(p => p.isSystem).length}
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
                <p className="text-sm font-medium text-gray-500">Custom</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockPermissions.filter(p => !p.isSystem).length}
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
                <p className="text-sm font-medium text-gray-500">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(mockPermissions.map(p => p.category)).size}
                </p>
              </div>
              <Database className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Permissions</CardTitle>
              <CardDescription>
                Manage granular access control and permissions.
              </CardDescription>
            </div>
          </div>
          
          {/* Filters and Search */}
          <div className="flex items-center gap-3 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                <TableHead>Resource.Action</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Users</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermissions.map((permission) => {
                const Icon = getCategoryIcon(permission.category)
                return (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-sm text-gray-500">{permission.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {permission.resource}.{permission.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {permission.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {permission.isSystem ? (
                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                          <Lock className="h-3 w-3 mr-1" />
                          System
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                          <Unlock className="h-3 w-3 mr-1" />
                          Custom
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{permission.rolesCount} roles</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{permission.usersCount} users</Badge>
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
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Permission
                        </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            View Roles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            View Users
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!permission.isSystem && (
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Permission
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {filteredPermissions.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No permissions found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

