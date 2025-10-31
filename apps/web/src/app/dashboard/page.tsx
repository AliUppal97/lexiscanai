"use client"

import Link from "next/link"
import { 
  FileText, 
  Upload, 
  Brain, 
  Users, 
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Activity,
  Zap,
  Shield
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const stats = [
  {
    name: "Documents Processed",
    value: "1,247",
    change: "+12%",
    changeType: "positive",
    icon: FileText,
  },
  {
    name: "Analysis Accuracy",
    value: "98.7%",
    change: "+2.1%",
    changeType: "positive",
    icon: Brain,
  },
  {
    name: "Time Saved",
    value: "342h",
    change: "+18%",
    changeType: "positive",
    icon: Clock,
  },
  {
    name: "Team Members",
    value: "12",
    change: "+2",
    changeType: "positive",
    icon: Users,
  },
]

const recentDocuments = [
  {
    id: 1,
    name: "Service Agreement - TechCorp.pdf",
    status: "completed",
    uploadedAt: "2 hours ago",
    analysis: "Contract reviewed, 3 risks identified",
    confidence: 96,
  },
  {
    id: 2,
    name: "NDA Template - Client ABC.docx",
    status: "processing",
    uploadedAt: "4 hours ago",
    analysis: "Analyzing clauses and terms...",
    confidence: null,
  },
  {
    id: 3,
    name: "Employment Contract - John Smith.pdf",
    status: "completed",
    uploadedAt: "1 day ago",
    analysis: "Contract reviewed, 1 recommendation",
    confidence: 94,
  },
  {
    id: 4,
    name: "Partnership Agreement - StartupXYZ.pdf",
    status: "error",
    uploadedAt: "2 days ago",
    analysis: "Failed to process - corrupted file",
    confidence: null,
  },
]

const quickActions = [
  {
    name: "Upload Document",
    description: "Upload and analyze a new document",
    icon: Upload,
    href: "/dashboard/upload",
    iconBgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    name: "View Analytics",
    description: "Check detailed analysis reports",
    icon: BarChart3,
    href: "/dashboard/analytics",
    iconBgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    name: "Manage Team",
    description: "Invite and manage team members",
    icon: Users,
    href: "/dashboard/team",
    iconBgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    name: "View History",
    description: "Browse all processed documents",
    icon: Activity,
    href: "/dashboard/history",
    iconBgColor: "bg-orange-100",
    iconColor: "text-orange-600",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your documents.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.name} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 p-3 rounded-lg ${action.iconBgColor}`}>
                      <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">{action.name}</h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>
              Your latest document uploads and their analysis status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {doc.status === "completed" && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {doc.status === "processing" && (
                      <Clock className="h-5 w-5 text-blue-500" />
                    )}
                    {doc.status === "error" && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.name}
                    </p>
                    <p className="text-sm text-gray-500">{doc.analysis}</p>
                    <p className="text-xs text-gray-400">{doc.uploadedAt}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {doc.confidence && (
                      <Badge variant="secondary">
                        {doc.confidence}% confidence
                      </Badge>
                    )}
                    {doc.status === "processing" && (
                      <Badge variant="outline">Processing</Badge>
                    )}
                    {doc.status === "error" && (
                      <Badge variant="destructive">Error</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/documents">
                  View All Documents
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current system performance and health metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Processing Speed</span>
                  <span className="text-sm text-gray-500">Excellent</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">API Response Time</span>
                  <span className="text-sm text-gray-500">142ms</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Uptime</span>
                  <span className="text-sm text-gray-500">99.9%</span>
                </div>
                <Progress value={99} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">All systems operational</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-700">AI models updated</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

