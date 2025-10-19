"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Brain, 
  Shield, 
  Zap, 
  FileText, 
  Search, 
  BarChart3, 
  Users, 
  Lock, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Download,
  Share2,
  Settings,
  Globe,
  Smartphone,
  Monitor,
  Database,
  Cloud,
  Cpu,
  Target,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  MessageSquare,
  Calendar,
  Bell
} from "lucide-react"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

const mainFeatures = [
  {
    icon: Brain,
    title: "AI Document Analysis",
    description: "Advanced NLP algorithms analyze contracts, legal documents, and case files with human-level accuracy and consistency.",
    features: [
      "Contract Review & Risk Assessment",
      "Compliance Checking",
      "Clause Extraction & Analysis",
      "Legal Entity Recognition",
      "Sentiment Analysis",
      "Custom Model Training"
    ],
    demo: {
      title: "Live Document Analysis",
      description: "See how our AI analyzes a contract in real-time",
      status: "processing",
      progress: 75,
      insights: [
        "3 potential risks identified",
        "2 clauses need attention",
        "Compliance score: 87%"
      ]
    }
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security with end-to-end encryption, audit trails, and compliance with legal industry standards.",
    features: [
      "SOC 2 Type II Compliance",
      "End-to-End Encryption",
      "Role-Based Access Control",
      "Audit Trails & Logging",
      "Data Residency Controls",
      "Penetration Testing"
    ],
    demo: {
      title: "Security Dashboard",
      description: "Monitor your organization's security posture",
      status: "secure",
      progress: 100,
      insights: [
        "All systems secure",
        "Last audit: 2 days ago",
        "Zero security incidents"
      ]
    }
  },
  {
    icon: Zap,
    title: "Lightning Fast Processing",
    description: "Process hundreds of documents in minutes, not hours. Get instant insights and recommendations.",
    features: [
      "Real-time Processing",
      "Batch Analysis",
      "Instant Results",
      "Scalable Infrastructure",
      "Auto-scaling",
      "Global CDN"
    ],
    demo: {
      title: "Processing Speed Test",
      description: "Watch documents get processed in real-time",
      status: "processing",
      progress: 60,
      insights: [
        "Processing 50 documents/min",
        "Average response: 2.3s",
        "99.9% uptime"
      ]
    }
  }
]

const additionalFeatures = [
  {
    icon: Search,
    title: "Advanced Search",
    description: "Find any clause, term, or concept across your entire document library with semantic search.",
    category: "Productivity"
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description: "Comprehensive analytics and custom reports to track document trends and insights.",
    category: "Analytics"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together with your team on document reviews with real-time collaboration tools.",
    category: "Collaboration"
  },
  {
    icon: Lock,
    title: "Access Control",
    description: "Granular permissions and role-based access control for enterprise security.",
    category: "Security"
  },
  {
    icon: Clock,
    title: "Version Control",
    description: "Track document changes and maintain complete version history with audit trails.",
    category: "Productivity"
  },
  {
    icon: CheckCircle,
    title: "Compliance Monitoring",
    description: "Automated compliance checking against regulatory requirements and standards.",
    category: "Compliance"
  }
]

const integrations = [
  { name: "Microsoft Word", icon: FileText, status: "available" },
  { name: "Google Docs", icon: FileText, status: "available" },
  { name: "Salesforce", icon: Database, status: "available" },
  { name: "Slack", icon: MessageSquare, status: "available" },
  { name: "Microsoft Teams", icon: Users, status: "available" },
  { name: "Box", icon: Cloud, status: "available" },
  { name: "Dropbox", icon: Cloud, status: "available" },
  { name: "OneDrive", icon: Cloud, status: "available" },
  { name: "SharePoint", icon: Globe, status: "available" },
  { name: "DocuSign", icon: FileCheck, status: "available" },
  { name: "Adobe Sign", icon: FileCheck, status: "available" },
  { name: "Clio", icon: Database, status: "coming-soon" },
]

const platforms = [
  { name: "Web App", icon: Monitor, description: "Full-featured web application" },
  { name: "Mobile App", icon: Smartphone, description: "iOS and Android apps" },
  { name: "API", icon: Cpu, description: "RESTful API for integrations" },
  { name: "Desktop", icon: Monitor, description: "Native desktop applications" },
]

export default function FeaturesPage() {
  const [activeDemo, setActiveDemo] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const toggleDemo = () => {
    setIsPlaying(!isPlaying)
  }

  const resetDemo = () => {
    setIsPlaying(false)
    setActiveDemo(0)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Powerful features for legal professionals
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Discover how LexiScan AI transforms document analysis with cutting-edge AI technology and enterprise-grade security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/pricing">
                    View Pricing
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Features with Interactive Demos */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Core Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the power of AI-driven document analysis with our interactive demos.
              </p>
            </div>

            <div className="space-y-20">
              {mainFeatures.map((feature, index) => (
                <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <feature.icon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                    </div>
                    <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {feature.features.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    <Card className="relative overflow-hidden">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{feature.demo.title}</CardTitle>
                            <CardDescription>{feature.demo.description}</CardDescription>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={toggleDemo}
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={resetDemo}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Processing Status</span>
                            <Badge variant={feature.demo.status === "secure" ? "default" : "secondary"}>
                              {feature.demo.status === "secure" ? "Secure" : "Processing"}
                            </Badge>
                          </div>
                          
                          <Progress value={feature.demo.progress} className="h-2" />
                          
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Key Insights:</h4>
                            {feature.demo.insights.map((insight, insightIndex) => (
                              <div key={insightIndex} className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                <span className="text-gray-600">{insight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Additional Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to streamline your legal document workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {additionalFeatures.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <feature.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {feature.category}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Integrations & Platforms
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Connect with your existing tools and access LexiScan AI from any device.
              </p>
            </div>

            <Tabs defaultValue="integrations" className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="platforms">Platforms</TabsTrigger>
              </TabsList>
              
              <TabsContent value="integrations" className="mt-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {integrations.map((integration, index) => (
                    <Card key={index} className="text-center hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center">
                          <div className="bg-gray-100 p-3 rounded-lg mb-3">
                            <integration.icon className="h-6 w-6 text-gray-600" />
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {integration.name}
                          </h3>
                          <Badge 
                            variant={integration.status === "available" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {integration.status === "available" ? "Available" : "Coming Soon"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="platforms" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {platforms.map((platform, index) => (
                    <Card key={index} className="text-center hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center">
                          <div className="bg-blue-100 p-3 rounded-lg mb-3">
                            <platform.icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <h3 className="font-medium text-gray-900 mb-2">
                            {platform.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {platform.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-blue-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to experience these features?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start your free trial today and see how LexiScan AI can transform your document analysis workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">
                  Start Free Trial
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent" asChild>
                <Link href="/contact">
                  Schedule Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

