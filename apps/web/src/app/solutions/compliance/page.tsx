"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Users, 
  BarChart3,
  TrendingUp,
  ArrowRight,
  Play,
  MessageCircle,
  Star,
  Clock,
  Target,
  Zap,
  Globe,
  Lock,
  Eye,
  Settings,
  Bell,
  Database
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const features = [
  {
    icon: Shield,
    title: "Regulatory Monitoring",
    description: "Automated tracking of regulatory changes across multiple jurisdictions",
    benefits: ["Real-time updates", "Multi-jurisdiction support", "Change notifications", "Impact analysis"]
  },
  {
    icon: CheckCircle,
    title: "Compliance Assessment",
    description: "AI-powered compliance checking against current regulations and standards",
    benefits: ["Automated scanning", "Risk scoring", "Gap analysis", "Remediation guidance"]
  },
  {
    icon: FileText,
    title: "Policy Management",
    description: "Centralized policy creation, distribution, and tracking system",
    benefits: ["Version control", "Approval workflows", "Employee attestation", "Audit trails"]
  },
  {
    icon: BarChart3,
    title: "Compliance Reporting",
    description: "Comprehensive reporting and dashboard for compliance oversight",
    benefits: ["Executive dashboards", "Regulatory reports", "Trend analysis", "KPI tracking"]
  }
]

const regulations = [
  {
    name: "GDPR",
    description: "General Data Protection Regulation compliance for EU data handling",
    icon: Globe,
    requirements: ["Data mapping", "Consent management", "Breach notification", "Privacy by design"]
  },
  {
    name: "SOX",
    description: "Sarbanes-Oxley Act compliance for financial reporting and controls",
    icon: BarChart3,
    requirements: ["Internal controls", "Financial reporting", "Audit trails", "Risk assessment"]
  },
  {
    name: "HIPAA",
    description: "Health Insurance Portability and Accountability Act for healthcare data",
    icon: Shield,
    requirements: ["PHI protection", "Access controls", "Breach prevention", "Training programs"]
  },
  {
    name: "CCPA",
    description: "California Consumer Privacy Act for consumer data protection",
    icon: Eye,
    requirements: ["Data inventory", "Consumer rights", "Opt-out mechanisms", "Privacy notices"]
  }
]

const useCases = [
  {
    title: "Financial Services Compliance",
    description: "Navigate complex financial regulations with automated compliance monitoring",
    icon: TrendingUp,
    benefits: ["Basel III compliance", "MiFID II reporting", "AML monitoring", "Risk management"]
  },
  {
    title: "Healthcare Compliance",
    description: "Ensure HIPAA and healthcare regulations compliance across all operations",
    icon: Shield,
    benefits: ["PHI protection", "Audit preparation", "Incident response", "Staff training"]
  },
  {
    title: "Data Privacy Management",
    description: "Comprehensive data privacy compliance across multiple jurisdictions",
    icon: Lock,
    benefits: ["GDPR compliance", "Data mapping", "Consent management", "Breach response"]
  },
  {
    title: "Environmental Compliance",
    description: "Track and ensure compliance with environmental regulations and standards",
    icon: Globe,
    benefits: ["Emission tracking", "Waste management", "Permit compliance", "Reporting"]
  }
]

const testimonials = [
  {
    name: "Dr. Lisa Thompson",
    role: "Chief Compliance Officer",
    company: "MedTech Solutions",
    content: "LexiScan AI has revolutionized our compliance monitoring. We can now track regulatory changes across 20+ countries in real-time.",
    rating: 5,
    avatar: "/placeholder-avatar.jpg"
  },
  {
    name: "James Wilson",
    role: "Head of Risk & Compliance",
    company: "GlobalBank International",
    content: "The automated compliance assessment has reduced our audit preparation time by 70%. The accuracy is remarkable.",
    rating: 5,
    avatar: "/placeholder-avatar.jpg"
  },
  {
    name: "Maria Garcia",
    role: "Privacy Officer",
    company: "DataCorp",
    content: "Managing GDPR compliance across our global operations is now seamless. The policy management features are exceptional.",
    rating: 5,
    avatar: "/placeholder-avatar.jpg"
  }
]

const complianceMetrics = [
  {
    metric: "99.8%",
    description: "Compliance Accuracy",
    icon: CheckCircle,
    color: "text-green-600"
  },
  {
    metric: "75%",
    description: "Faster Audits",
    icon: Clock,
    color: "text-blue-600"
  },
  {
    metric: "50+",
    description: "Regulations Tracked",
    icon: Globe,
    color: "text-purple-600"
  },
  {
    metric: "24/7",
    description: "Monitoring",
    icon: Bell,
    color: "text-orange-600"
  }
]

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-green-100 text-green-800">
              <Shield className="h-3 w-3 mr-1" />
              Compliance Solutions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Automated
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Compliance</span>
              <br />Management
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Stay ahead of regulatory changes with AI-powered compliance monitoring, 
              automated assessments, and comprehensive reporting for enterprise organizations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="group">
                <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                SOC 2 Compliant
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                GDPR Ready
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Enterprise Security
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="regulations">Regulations</TabsTrigger>
              <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-16">
              {/* Key Features */}
              <div>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Compliance Management</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Built for compliance teams that need to monitor, assess, and report on regulatory 
                    compliance across multiple jurisdictions and frameworks.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {features.map((feature, index) => (
                    <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="mx-auto p-3 bg-green-100 rounded-lg w-fit mb-4">
                          <feature.icon className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-gray-600">
                          {feature.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Compliance Metrics */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Proven Compliance Results</h3>
                  <p className="text-gray-600">Trusted by compliance teams worldwide</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                  {complianceMetrics.map((metric, index) => (
                    <div key={index}>
                      <div className={`text-3xl font-bold ${metric.color} mb-2`}>{metric.metric}</div>
                      <div className="text-gray-600">{metric.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="regulations" className="space-y-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Supported Regulations</h2>
                <p className="text-lg text-gray-600">
                  Comprehensive coverage of major regulatory frameworks across industries
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {regulations.map((regulation, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <regulation.icon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{regulation.name}</CardTitle>
                          <CardDescription className="text-base">{regulation.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Requirements:</h4>
                      <ul className="space-y-2">
                        {regulation.requirements.map((requirement, idx) => (
                          <li key={idx} className="flex items-center text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            {requirement}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="use-cases" className="space-y-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Industry Applications</h2>
                <p className="text-lg text-gray-600">
                  Tailored compliance solutions for different industries and regulatory environments
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {useCases.map((useCase, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <useCase.icon className="h-8 w-8 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{useCase.title}</CardTitle>
                          <CardDescription className="text-base">{useCase.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {useCase.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center text-gray-600">
                            <Zap className="h-4 w-4 text-yellow-500 mr-3 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Advanced Compliance Features</h2>
                <p className="text-lg text-gray-600">
                  Everything you need to maintain comprehensive compliance across your organization
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <feature.icon className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{feature.title}</CardTitle>
                          <CardDescription className="text-base">{feature.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Testimonials */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Compliance Professionals</h2>
              <p className="text-lg text-gray-600">
                See what compliance officers are saying about LexiScan AI
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <CardContent className="py-16">
                <h2 className="text-3xl font-bold mb-4">Ready to Automate Your Compliance?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join compliance teams worldwide who trust LexiScan AI to keep them ahead of regulatory changes.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button size="lg" variant="secondary">
                    <Play className="h-4 w-4 mr-2" />
                    Watch Demo
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-green-600">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Talk to Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
