"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { 
  TrendingUp, 
  Shield, 
  FileText, 
  BarChart3, 
  CheckCircle,
  ArrowRight,
  Play,
  MessageCircle,
  Star,
  Clock,
  Target,
  Zap,
  Lock,
  Eye,
  Database,
  AlertTriangle,
  Users,
  DollarSign,
  PieChart
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const features = [
  {
    icon: TrendingUp,
    title: "Financial Document Analysis",
    description: "AI-powered analysis of financial statements, reports, and regulatory filings",
    benefits: ["Risk assessment", "Compliance checking", "Trend analysis", "Automated insights"]
  },
  {
    icon: Shield,
    title: "Regulatory Compliance",
    description: "Automated compliance with financial regulations and reporting requirements",
    benefits: ["SOX compliance", "Basel III", "MiFID II", "GDPR compliance"]
  },
  {
    icon: BarChart3,
    title: "Risk Management",
    description: "Advanced risk assessment and monitoring for financial institutions",
    benefits: ["Credit risk", "Market risk", "Operational risk", "Liquidity risk"]
  },
  {
    icon: FileText,
    title: "Audit Support",
    description: "Comprehensive audit trail and documentation for financial audits",
    benefits: ["Audit trails", "Documentation", "Evidence collection", "Compliance reporting"]
  }
]

const regulations = [
  {
    name: "SOX",
    description: "Sarbanes-Oxley Act compliance for financial reporting",
    icon: Shield,
    requirements: ["Internal controls", "Financial reporting", "Audit trails", "Risk assessment"]
  },
  {
    name: "Basel III",
    description: "International banking regulations and capital requirements",
    icon: TrendingUp,
    requirements: ["Capital adequacy", "Liquidity ratios", "Risk management", "Stress testing"]
  },
  {
    name: "MiFID II",
    description: "Markets in Financial Instruments Directive",
    icon: BarChart3,
    requirements: ["Transaction reporting", "Best execution", "Client protection", "Market transparency"]
  },
  {
    name: "GDPR",
    description: "General Data Protection Regulation for financial data",
    icon: Lock,
    requirements: ["Data protection", "Consent management", "Breach notification", "Privacy by design"]
  }
]

const useCases = [
  {
    title: "Credit Risk Assessment",
    description: "Automated analysis of loan applications and creditworthiness",
    icon: Target,
    benefits: ["Faster processing", "Risk scoring", "Fraud detection", "Compliance tracking"]
  },
  {
    title: "Regulatory Reporting",
    description: "Automated generation of regulatory reports and filings",
    icon: FileText,
    benefits: ["Automated reports", "Error reduction", "Timely submissions", "Audit trails"]
  },
  {
    title: "Anti-Money Laundering",
    description: "AML monitoring and suspicious activity detection",
    icon: Eye,
    benefits: ["Transaction monitoring", "Pattern detection", "Alert generation", "Case management"]
  },
  {
    title: "Investment Analysis",
    description: "AI-powered analysis of investment opportunities and market data",
    icon: PieChart,
    benefits: ["Market analysis", "Portfolio optimization", "Risk assessment", "Performance tracking"]
  }
]

const testimonials = [
  {
    name: "David Kim",
    role: "Chief Risk Officer",
    company: "GlobalBank International",
    content: "LexiScan AI has revolutionized our risk assessment process. We've reduced analysis time by 60% while improving accuracy.",
    rating: 5,
    avatar: "/placeholder-avatar.jpg"
  },
  {
    name: "Sarah Williams",
    role: "Compliance Director",
    company: "FinanceMax Capital",
    content: "The regulatory compliance features are exceptional. We can now track multiple regulations simultaneously with ease.",
    rating: 5,
    avatar: "/placeholder-avatar.jpg"
  },
  {
    name: "Michael Chen",
    role: "Head of Operations",
    company: "Investment Partners",
    content: "The audit support capabilities have streamlined our audit preparation process significantly.",
    rating: 5,
    avatar: "/placeholder-avatar.jpg"
  }
]

const financialMetrics = [
  {
    metric: "99.7%",
    description: "Accuracy Rate",
    icon: CheckCircle,
    color: "text-green-600"
  },
  {
    metric: "60%",
    description: "Faster Analysis",
    icon: Clock,
    color: "text-blue-600"
  },
  {
    metric: "50+",
    description: "Regulations Tracked",
    icon: Shield,
    color: "text-purple-600"
  },
  {
    metric: "24/7",
    description: "Monitoring",
    icon: Eye,
    color: "text-orange-600"
  }
]

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800">
              <DollarSign className="h-3 w-3 mr-1" />
              Financial Services
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Financial
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Intelligence</span>
              <br />Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform financial operations with AI-powered document analysis, risk assessment, 
              and regulatory compliance for banks, investment firms, and financial institutions.
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
                SOX Compliant
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Basel III Ready
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Bank-Grade Security
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Financial Services AI Platform</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Built for financial institutions that need to navigate complex regulations, 
                    manage risk, and maintain the highest standards of security and compliance.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {features.map((feature, index) => (
                    <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="mx-auto p-3 bg-blue-100 rounded-lg w-fit mb-4">
                          <feature.icon className="h-8 w-8 text-blue-600" />
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

              {/* Financial Metrics */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Proven Financial Results</h3>
                  <p className="text-gray-600">Trusted by leading financial institutions</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                  {financialMetrics.map((metric, index) => (
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Financial Regulations</h2>
                <p className="text-lg text-gray-600">
                  Comprehensive coverage of major financial regulatory frameworks
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {regulations.map((regulation, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <regulation.icon className="h-8 w-8 text-green-600" />
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Financial Applications</h2>
                <p className="text-lg text-gray-600">
                  Real-world applications across financial services
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Financial-Specific Features</h2>
                <p className="text-lg text-gray-600">
                  Advanced features designed for financial services workflows
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <feature.icon className="h-8 w-8 text-blue-600" />
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Financial Leaders</h2>
              <p className="text-lg text-gray-600">
                See what financial professionals are saying about LexiScan AI
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
            <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
              <CardContent className="py-16">
                <h2 className="text-3xl font-bold mb-4">Ready to Transform Financial Operations?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join financial institutions worldwide who trust LexiScan AI for secure, compliant document analysis.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button size="lg" variant="secondary">
                    <Play className="h-4 w-4 mr-2" />
                    Watch Demo
                  </Button>
                  <Button size="lg" variant="outline" className="!bg-transparent !text-white !border-white hover:!bg-white hover:!text-gray-900">
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
