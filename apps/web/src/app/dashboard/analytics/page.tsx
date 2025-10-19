"use client"

import { useState } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  FileText, 
  Users, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Brain,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

const analyticsData = {
  overview: {
    totalDocuments: 1247,
    documentsProcessed: 1189,
    averageProcessingTime: "2.3 minutes",
    accuracyRate: 98.7,
    timeSaved: 342,
    activeUsers: 12
  },
  trends: [
    { period: "Jan", documents: 45, accuracy: 97.2, timeSaved: 28 },
    { period: "Feb", documents: 52, accuracy: 98.1, timeSaved: 32 },
    { period: "Mar", documents: 48, accuracy: 97.8, timeSaved: 29 },
    { period: "Apr", documents: 61, accuracy: 98.5, timeSaved: 37 },
    { period: "May", documents: 55, accuracy: 98.9, timeSaved: 33 },
    { period: "Jun", documents: 67, accuracy: 98.7, timeSaved: 41 }
  ],
  documentTypes: [
    { type: "Contracts", count: 456, percentage: 36.6, trend: "up" },
    { type: "Legal Documents", count: 234, percentage: 18.8, trend: "up" },
    { type: "Policies", count: 189, percentage: 15.2, trend: "down" },
    { type: "Agreements", count: 156, percentage: 12.5, trend: "up" },
    { type: "Other", count: 212, percentage: 17.0, trend: "stable" }
  ],
  performance: [
    { metric: "Processing Speed", value: 95, target: 90, status: "excellent" },
    { metric: "Accuracy Rate", value: 98.7, target: 95, status: "excellent" },
    { metric: "User Satisfaction", value: 92, target: 85, status: "excellent" },
    { metric: "System Uptime", value: 99.9, target: 99.5, status: "excellent" }
  ],
  recentActivity: [
    { action: "Document processed", user: "John Doe", document: "Service Agreement - TechCorp.pdf", time: "2 minutes ago", status: "success" },
    { action: "Analysis completed", user: "Jane Smith", document: "NDA Template - Client ABC.docx", time: "5 minutes ago", status: "success" },
    { action: "Processing failed", user: "Mike Johnson", document: "Partnership Agreement - StartupXYZ.pdf", time: "8 minutes ago", status: "error" },
    { action: "Document uploaded", user: "Sarah Wilson", document: "Privacy Policy - Updated.pdf", time: "12 minutes ago", status: "success" },
    { action: "Analysis completed", user: "Alex Brown", document: "Employment Contract - John Smith.pdf", time: "15 minutes ago", status: "success" }
  ]
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-500" />
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-500" />
    default:
      return <div className="h-4 w-4 bg-gray-300 rounded-full" />
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "error":
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-blue-500" />
  }
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Insights and performance metrics for your document analysis</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Documents
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {analyticsData.overview.totalDocuments.toLocaleString()}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +12%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Accuracy Rate
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {analyticsData.overview.accuracyRate}%
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +2.1%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Time Saved
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {analyticsData.overview.timeSaved}h
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +18%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Users
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {analyticsData.overview.activeUsers}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +2
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Document Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Document Types Distribution</CardTitle>
              <CardDescription>
                Breakdown of documents by type over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.documentTypes.map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(item.trend)}
                        <span className="font-medium">{item.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32">
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                      <div className="text-sm text-gray-500 w-16 text-right">
                        {item.count} ({item.percentage}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trends Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Trends</CardTitle>
              <CardDescription>
                Document processing volume and accuracy over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chart visualization would go here</p>
                  <p className="text-sm text-gray-400">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Key performance indicators and targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analyticsData.performance.map((metric) => (
                  <div key={metric.metric} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{metric.metric}</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Current: {metric.value}%</span>
                        <span>Target: {metric.target}%</span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest document processing activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                    <div className="flex-shrink-0">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.document} by {activity.user}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-sm text-gray-500">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

