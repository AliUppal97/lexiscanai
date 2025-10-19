"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { 
  Shield, 
  Heart, 
  Users, 
  FileText, 
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
  BarChart3,
  AlertTriangle,
  TrendingUp
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const features = [
  {
    icon: Shield,
    title: "HIPAA Compliance",
    description: "Fully HIPAA-compliant document analysis with end-to-end encryption",
    benefits: ["PHI protection", "Audit trails", "Access controls", "Breach prevention"]
  },
  {
    icon: Heart,
    title: "Medical Records Analysis",
    description: "AI-powered analysis of medical records, reports, and clinical documents",
    benefits: ["Clinical insights", "Risk assessment", "Treatment optimization", "Outcome prediction"]
  },
  {
    icon: Users,
    title: "Provider Collaboration",
    description: "Secure collaboration tools for healthcare teams and providers",
    benefits: ["Multi-provider access", "Real-time sharing", "Consent management", "Workflow automation"]
  },
  {
    icon: FileText,
    title: "Regulatory Documentation",
    description: "Automated compliance with healthcare regulations and standards",
    benefits: ["FDA compliance", "CMS requirements", "Quality measures", "Reporting automation"]
  }
]

const useCases = [
  {
    title: "Clinical Documentation",
    description: "Streamline clinical documentation and improve patient care quality",
    icon: FileText,
    benefits: ["Faster documentation", "Improved accuracy", "Better patient outcomes", "Reduced errors"]
  },
  {
    title: "Insurance Claims",
    description: "Automated processing and analysis of insurance claims and authorizations",
    icon: Target,
    benefits: ["Faster processing", "Reduced denials", "Cost optimization", "Compliance tracking"]
  },
  {
    title: "Research & Analytics",
    description: "Advanced analytics for medical research and population health management",
    icon: BarChart3,
    benefits: ["Data insights", "Trend analysis", "Population health", "Research acceleration"]
  },
  {
    title: "Quality Assurance",
    description: "Automated quality checks and compliance monitoring for healthcare operations",
    icon: CheckCircle,
    benefits: ["Quality metrics", "Compliance monitoring", "Risk identification", "Performance tracking"]
  }
]

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Chief Medical Officer",
    company: "MedCenter Health",
    content: "LexiScan AI has transformed our clinical documentation process. We've reduced documentation time by 40% while improving accuracy.",
    rating: 5,
    avatar: "/placeholder-avatar.jpg"
  },
  {
    name: "Michael Chen",
    role: "Health Information Director",
    company: "Regional Medical Group",
    content: "The HIPAA compliance features give us peace of mind. Our audit preparation time has been cut in half.",
    rating: 5,
    avatar: "/placeholder-avatar.jpg"
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Quality Assurance Director",
    company: "Healthcare Excellence",
    content: "The analytics capabilities have helped us identify quality improvement opportunities we never saw before.",
    rating: 5,
    avatar: "/placeholder-avatar.jpg"
  }
]

const complianceStandards = [
  {
    name: "HIPAA",
    description: "Health Insurance Portability and Accountability Act",
    icon: Shield,
    requirements: ["PHI protection", "Access controls", "Audit logs", "Breach notification"]
  },
  {
    name: "HITECH",
    description: "Health Information Technology for Economic and Clinical Health",
    icon: Database,
    requirements: ["Electronic health records", "Data security", "Privacy protection", "Compliance reporting"]
  },
  {
    name: "FDA 21 CFR Part 11",
    description: "Electronic Records and Electronic Signatures",
    icon: Lock,
    requirements: ["Electronic signatures", "Audit trails", "Data integrity", "System validation"]
  },
  {
    name: "SOC 2",
    description: "Service Organization Control 2",
    icon: Eye,
    requirements: ["Security controls", "Availability", "Processing integrity", "Confidentiality"]
  }
]

export default function HealthcarePage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-green-100 text-green-800">
              <Heart className="h-3 w-3 mr-1" />
              Healthcare Solutions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              HIPAA-Compliant
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Healthcare</span>
              <br />AI Solutions
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform healthcare operations with AI-powered document analysis that meets the highest 
              standards of patient privacy, security, and regulatory compliance.
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
                HIPAA Compliant
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                SOC 2 Certified
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                End-to-End Encryption
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
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-16">
              {/* Key Features */}
              <div>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Healthcare-Focused AI Solutions</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Built specifically for healthcare organizations that need to balance innovation 
                    with the highest standards of patient privacy and regulatory compliance.
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

              {/* Healthcare Stats */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Trusted by Healthcare Organizations</h3>
                  <p className="text-gray-600">Proven results in healthcare environments</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
                    <div className="text-gray-600">Uptime</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">40%</div>
                    <div className="text-gray-600">Faster Documentation</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">200+</div>
                    <div className="text-gray-600">Healthcare Clients</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                    <div className="text-gray-600">Support</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Healthcare Compliance Standards</h2>
                <p className="text-lg text-gray-600">
                  Full compliance with healthcare regulations and security standards
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {complianceStandards.map((standard, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <standard.icon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{standard.name}</CardTitle>
                          <CardDescription className="text-base">{standard.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Requirements:</h4>
                      <ul className="space-y-2">
                        {standard.requirements.map((requirement, idx) => (
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Healthcare Applications</h2>
                <p className="text-lg text-gray-600">
                  Real-world applications across healthcare organizations
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Healthcare-Specific Features</h2>
                <p className="text-lg text-gray-600">
                  Advanced features designed for healthcare workflows and requirements
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Healthcare Leaders</h2>
              <p className="text-lg text-gray-600">
                See what healthcare professionals are saying about LexiScan AI
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
                <h2 className="text-3xl font-bold mb-4">Ready to Transform Healthcare Operations?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join healthcare organizations worldwide who trust LexiScan AI for secure, compliant document analysis.
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
