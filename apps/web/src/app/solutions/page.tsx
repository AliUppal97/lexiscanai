"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { 
  Building, 
  Scale, 
  Briefcase, 
  Users, 
  Shield, 
  Zap, 
  Target, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Award,
  Clock,
  FileText,
  Brain,
  BarChart3,
  MessageCircle,
  Play,
  Download,
  ExternalLink,
  Globe,
  Lock,
  Smartphone,
  Cloud,
  Database,
  Settings,
  Headphones
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const solutions = [
  {
    id: "legal-firms",
    title: "Legal Firms",
    description: "Streamline contract review and legal document analysis for law firms of all sizes",
    icon: Scale,
    color: "blue",
    features: [
      "Contract review automation",
      "Risk assessment and scoring",
      "Client collaboration tools",
      "Compliance monitoring",
      "Document version control",
      "Billing integration"
    ],
    benefits: [
      "Reduce review time by 80%",
      "Improve accuracy and consistency",
      "Enhance client satisfaction",
      "Increase billable hours efficiency"
    ],
    stats: {
      timeSaved: "80%",
      accuracy: "98.7%",
      clients: "500+",
      documents: "1M+"
    }
  },
  {
    id: "enterprise",
    title: "Enterprise",
    description: "Comprehensive document analysis solutions for large organizations",
    icon: Building,
    color: "purple",
    features: [
      "Enterprise-grade security",
      "Custom AI models",
      "API integrations",
      "Advanced analytics",
      "Dedicated support",
      "On-premise deployment"
    ],
    benefits: [
      "Scale to millions of documents",
      "Customize for your industry",
      "Integrate with existing systems",
      "Meet compliance requirements"
    ],
    stats: {
      timeSaved: "75%",
      accuracy: "99.2%",
      clients: "100+",
      documents: "10M+"
    }
  },
  {
    id: "startups",
    title: "Startups & SMBs",
    description: "Affordable document analysis tools for growing businesses",
    icon: Briefcase,
    color: "green",
    features: [
      "Quick setup and onboarding",
      "Essential analysis features",
      "Team collaboration",
      "Basic integrations",
      "Email support",
      "Scalable pricing"
    ],
    benefits: [
      "Get started in minutes",
      "No technical expertise required",
      "Grow with your business",
      "Cost-effective solution"
    ],
    stats: {
      timeSaved: "70%",
      accuracy: "97.5%",
      clients: "1000+",
      documents: "100K+"
    }
  },
  {
    id: "compliance",
    title: "Compliance Teams",
    description: "Automated compliance monitoring and regulatory document analysis",
    icon: Shield,
    color: "orange",
    features: [
      "Regulatory compliance checking",
      "Policy analysis",
      "Audit trail generation",
      "Risk monitoring",
      "Reporting dashboards",
      "Alert systems"
    ],
    benefits: [
      "Stay compliant automatically",
      "Reduce audit preparation time",
      "Identify risks proactively",
      "Generate compliance reports"
    ],
    stats: {
      timeSaved: "85%",
      accuracy: "99.1%",
      clients: "200+",
      documents: "500K+"
    }
  }
]

const industries = [
  {
    name: "Financial Services",
    description: "Banking, insurance, and investment firms",
    icon: TrendingUp,
    useCases: [
      "Loan agreement analysis",
      "Insurance policy review",
      "Regulatory compliance",
      "Risk assessment"
    ]
  },
  {
    name: "Healthcare",
    description: "Hospitals, clinics, and healthcare providers",
    icon: Shield,
    useCases: [
      "Medical contract review",
      "HIPAA compliance",
      "Insurance verification",
      "Provider agreements"
    ]
  },
  {
    name: "Technology",
    description: "Software companies and tech startups",
    icon: Zap,
    useCases: [
      "Software licensing",
      "Employment contracts",
      "NDA analysis",
      "Partnership agreements"
    ]
  },
  {
    name: "Real Estate",
    description: "Property management and development",
    icon: Building,
    useCases: [
      "Lease agreement review",
      "Property contracts",
      "Zoning compliance",
      "Vendor agreements"
    ]
  },
  {
    name: "Manufacturing",
    description: "Production and supply chain companies",
    icon: Target,
    useCases: [
      "Supplier contracts",
      "Quality agreements",
      "Safety compliance",
      "Distribution agreements"
    ]
  },
  {
    name: "Government",
    description: "Public sector organizations",
    icon: Globe,
    useCases: [
      "Procurement contracts",
      "Policy analysis",
      "Regulatory compliance",
      "Public records management"
    ]
  }
]

const features = [
  {
    category: "AI Analysis",
    icon: Brain,
    features: [
      {
        title: "Document Processing",
        description: "Extract and analyze text from any document format",
        benefits: ["PDF, Word, Excel support", "OCR for scanned documents", "Multi-language processing"]
      },
      {
        title: "Risk Assessment",
        description: "Identify potential risks and compliance issues",
        benefits: ["Automated risk scoring", "Issue flagging", "Recommendation engine"]
      },
      {
        title: "Clause Analysis",
        description: "Analyze contract clauses and terms",
        benefits: ["24+ clause types", "Custom templates", "Compliance checking"]
      }
    ]
  },
  {
    category: "Collaboration",
    icon: Users,
    features: [
      {
        title: "Team Workspace",
        description: "Collaborate with your team on document analysis",
        benefits: ["Real-time collaboration", "Comment system", "Version control"]
      },
      {
        title: "Client Portal",
        description: "Share insights with clients securely",
        benefits: ["Secure sharing", "Client dashboards", "Progress tracking"]
      },
      {
        title: "Workflow Automation",
        description: "Automate repetitive tasks and processes",
        benefits: ["Custom workflows", "Approval processes", "Notification system"]
      }
    ]
  },
  {
    category: "Integration",
    icon: Settings,
    features: [
      {
        title: "API Access",
        description: "Integrate with your existing systems",
        benefits: ["RESTful API", "Webhooks", "SDK libraries"]
      },
      {
        title: "Third-party Apps",
        description: "Connect with popular business tools",
        benefits: ["Slack integration", "Microsoft Teams", "Salesforce CRM"]
      },
      {
        title: "Document Management",
        description: "Sync with your document storage",
        benefits: ["SharePoint", "Google Drive", "Dropbox", "Box"]
      }
    ]
  }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "General Counsel",
    company: "TechCorp",
    industry: "Technology",
    avatar: "/placeholder-avatar.jpg",
    content: "LexiScan AI has transformed our contract review process. What used to take our legal team days now takes hours, and the accuracy is remarkable.",
    metrics: {
      timeSaved: "75%",
      accuracy: "98%",
      satisfaction: "9.5/10"
    }
  },
  {
    name: "Michael Chen",
    role: "Legal Director",
    company: "GlobalBank",
    industry: "Financial Services",
    avatar: "/placeholder-avatar.jpg",
    content: "The compliance monitoring features have been invaluable. We can now identify potential issues before they become problems.",
    metrics: {
      timeSaved: "80%",
      accuracy: "99%",
      satisfaction: "9.8/10"
    }
  },
  {
    name: "Emily Rodriguez",
    role: "Senior Legal Counsel",
    company: "HealthFirst",
    industry: "Healthcare",
    avatar: "/placeholder-avatar.jpg",
    content: "The HIPAA compliance features give us confidence that we're meeting all regulatory requirements while improving efficiency.",
    metrics: {
      timeSaved: "70%",
      accuracy: "97%",
      satisfaction: "9.2/10"
    }
  }
]

const pricing = [
  {
    name: "Starter",
    price: 99,
    period: "month",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 1,000 documents/month",
      "Basic AI analysis",
      "Email support",
      "Standard processing speed",
      "Basic integrations"
    ],
    popular: false
  },
  {
    name: "Professional",
    price: 299,
    period: "month",
    description: "Ideal for growing businesses",
    features: [
      "Up to 10,000 documents/month",
      "Advanced AI analysis",
      "Priority support",
      "Team collaboration",
      "API access",
      "Custom integrations"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "month",
    description: "For large organizations with custom needs",
    features: [
      "Unlimited documents",
      "Custom AI models",
      "24/7 dedicated support",
      "Advanced analytics",
      "On-premise deployment",
      "SLA guarantee"
    ],
    popular: false
  }
]

export default function SolutionsPage() {
  const [selectedSolution, setSelectedSolution] = useState("legal-firms")

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Solutions for Every Industry
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover how LexiScan AI can transform document analysis for your specific industry and use case. 
              From legal firms to enterprise organizations, we have solutions tailored to your needs.
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg">
                <MessageCircle className="h-4 w-4 mr-2" />
                Get Custom Demo
              </Button>
              <Button variant="outline" size="lg">
                <Download className="h-4 w-4 mr-2" />
                Download Solutions Guide
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <Tabs value={selectedSolution} onValueChange={setSelectedSolution} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="legal-firms">Legal Firms</TabsTrigger>
              <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
              <TabsTrigger value="startups">Startups & SMBs</TabsTrigger>
              <TabsTrigger value="compliance">Compliance Teams</TabsTrigger>
            </TabsList>

            {solutions.map((solution) => (
              <TabsContent key={solution.id} value={solution.id} className="space-y-8">
                {/* Solution Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 bg-${solution.color}-100 rounded-lg`}>
                          <solution.icon className={`h-8 w-8 text-${solution.color}-600`} />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{solution.title}</CardTitle>
                          <CardDescription className="text-lg">{solution.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Key Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {solution.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Impact Metrics</CardTitle>
                      <CardDescription>Real results from {solution.title} customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            {solution.stats.timeSaved}
                          </div>
                          <div className="text-sm text-gray-500">Time Saved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">
                            {solution.stats.accuracy}
                          </div>
                          <div className="text-sm text-gray-500">Accuracy Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600 mb-1">
                            {solution.stats.clients}
                          </div>
                          <div className="text-sm text-gray-500">Happy Clients</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-orange-600 mb-1">
                            {solution.stats.documents}
                          </div>
                          <div className="text-sm text-gray-500">Documents Processed</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Benefits */}
                <Card>
                  <CardHeader>
                    <CardTitle>Why Choose LexiScan AI for {solution.title}?</CardTitle>
                    <CardDescription>Key benefits and outcomes you can expect</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {solution.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{benefit}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Industries */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Industries We Serve</h2>
              <p className="text-lg text-gray-600">
                LexiScan AI is trusted by organizations across various industries
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {industries.map((industry, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <industry.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{industry.name}</CardTitle>
                        <CardDescription>{industry.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-900">Common Use Cases:</h4>
                      <ul className="space-y-1">
                        {industry.useCases.map((useCase, useCaseIndex) => (
                          <li key={useCaseIndex} className="text-sm text-gray-600 flex items-center space-x-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>{useCase}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Features by Category */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Features</h2>
              <p className="text-lg text-gray-600">
                Everything you need for document analysis and legal workflow automation
              </p>
            </div>

            <div className="space-y-12">
              {features.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <category.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{category.category}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {category.features.map((feature, featureIndex) => (
                      <Card key={featureIndex}>
                        <CardHeader>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {feature.benefits.map((benefit, benefitIndex) => (
                              <div key={benefitIndex} className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-gray-600">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Customer Success Stories</h2>
              <p className="text-lg text-gray-600">
                See how organizations are transforming their legal workflows
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                        <div className="text-sm text-gray-500">{testimonial.company}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {testimonial.industry}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 italic mb-4">"{testimonial.content}"</p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-600">{testimonial.metrics.timeSaved}</div>
                        <div className="text-xs text-gray-500">Time Saved</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{testimonial.metrics.accuracy}</div>
                        <div className="text-xs text-gray-500">Accuracy</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">{testimonial.metrics.satisfaction}</div>
                        <div className="text-xs text-gray-500">Satisfaction</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Flexible Pricing</h2>
              <p className="text-lg text-gray-600">
                Choose the plan that fits your organization's needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricing.map((plan, index) => (
                <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                      {typeof plan.price === 'number' && (
                        <span className="text-lg font-normal text-gray-500">/{plan.period}</span>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-6" variant={plan.popular ? "default" : "outline"}>
                      {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="py-16">
                <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Legal Workflow?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of organizations already using LexiScan AI to streamline their document analysis
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
