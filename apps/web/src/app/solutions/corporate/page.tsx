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
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Play,
  MessageCircle,
  Star,
  Clock,
  Target,
  Zap,
  Globe,
  Lock,
  BarChart3
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const features = [
  {
    icon: Scale,
    title: "Contract Analysis",
    description: "AI-powered contract review and risk assessment for enterprise agreements",
    benefits: ["Risk identification", "Compliance checking", "Term extraction", "Automated summaries"]
  },
  {
    icon: Shield,
    title: "Compliance Management",
    description: "Ensure regulatory compliance across all corporate documents and policies",
    benefits: ["Regulatory tracking", "Policy alignment", "Audit preparation", "Risk mitigation"]
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Enable seamless collaboration across legal, compliance, and business teams",
    benefits: ["Role-based access", "Workflow automation", "Comment system", "Version control"]
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description: "Comprehensive insights and reporting for corporate legal operations",
    benefits: ["Performance metrics", "Cost analysis", "Trend identification", "Executive dashboards"]
  }
]

const useCases = [
  {
    title: "M&A Due Diligence",
    description: "Accelerate merger and acquisition due diligence with AI-powered document analysis",
    icon: TrendingUp,
    benefits: ["50% faster review", "Risk identification", "Automated summaries", "Stakeholder reports"]
  },
  {
    title: "Contract Lifecycle Management",
    description: "Streamline contract creation, negotiation, and renewal processes",
    icon: Briefcase,
    benefits: ["Template automation", "Negotiation tracking", "Renewal alerts", "Performance monitoring"]
  },
  {
    title: "Regulatory Compliance",
    description: "Stay compliant with evolving regulations across multiple jurisdictions",
    icon: Globe,
    benefits: ["Multi-jurisdiction support", "Regulatory updates", "Compliance scoring", "Audit trails"]
  },
  {
    title: "Litigation Support",
    description: "Prepare for litigation with comprehensive document discovery and analysis",
    icon: Target,
    benefits: ["Document discovery", "Evidence analysis", "Timeline creation", "Expert reports"]
  }
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "General Counsel",
    company: "TechCorp Global",
    content: "LexiScan AI has transformed our contract review process. We've reduced review time by 60% while improving accuracy.",
    rating: 5,
    avatar: "/placeholder-avatar.jpg"
  },
  {
    name: "Michael Rodriguez",
    role: "Chief Legal Officer",
    company: "FinanceMax",
    content: "The compliance management features are exceptional. We can now track regulatory changes across 15 countries seamlessly.",
    rating: 5,
    avatar: "/placeholder-avatar.jpg"
  },
  {
    name: "Jennifer Park",
    role: "Legal Operations Director",
    company: "HealthTech Solutions",
    content: "The analytics dashboard gives us insights we never had before. Our legal spend is down 30% this quarter.",
    rating: 5,
    avatar: "/placeholder-avatar.jpg"
  }
]

const pricing = [
  {
    name: "Corporate Starter",
    price: "$299",
    period: "per month",
    description: "Perfect for mid-size corporations",
    features: [
      "Up to 1,000 documents/month",
      "5 team members",
      "Basic contract analysis",
      "Standard compliance tracking",
      "Email support"
    ],
    popular: false
  },
  {
    name: "Corporate Professional",
    price: "$599",
    period: "per month",
    description: "Ideal for growing enterprises",
    features: [
      "Up to 5,000 documents/month",
      "25 team members",
      "Advanced AI analysis",
      "Multi-jurisdiction compliance",
      "Priority support",
      "Custom integrations"
    ],
    popular: true
  },
  {
    name: "Corporate Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large organizations",
    features: [
      "Unlimited documents",
      "Unlimited team members",
      "Custom AI models",
      "Dedicated support",
      "On-premise deployment",
      "Custom training"
    ],
    popular: false
  }
]

export default function CorporatePage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800">
              <Building className="h-3 w-3 mr-1" />
              Corporate Solutions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Enterprise Legal
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Intelligence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your corporate legal operations with AI-powered document analysis, 
              compliance management, and intelligent automation for enterprise-scale organizations.
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
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                14-day free trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Enterprise security
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
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-16">
              {/* Key Features */}
              <div>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Enterprise-Grade Legal Intelligence</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Built for corporate legal teams that need to scale efficiently while maintaining 
                    the highest standards of accuracy and security.
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

              {/* Stats */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">60%</div>
                    <div className="text-gray-600">Faster Review</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                    <div className="text-gray-600">Accuracy Rate</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                    <div className="text-gray-600">Enterprise Clients</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                    <div className="text-gray-600">Support</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Feature Set</h2>
                <p className="text-lg text-gray-600">
                  Everything you need to modernize your corporate legal operations
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

            <TabsContent value="use-cases" className="space-y-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Real-World Applications</h2>
                <p className="text-lg text-gray-600">
                  See how leading corporations use LexiScan AI to transform their legal operations
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

            <TabsContent value="pricing" className="space-y-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Enterprise Pricing</h2>
                <p className="text-lg text-gray-600">
                  Flexible pricing options designed for corporate legal teams
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pricing.map((plan, index) => (
                  <Card key={index} className={`relative hover:shadow-lg transition-shadow ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-gray-600 ml-2">{plan.period}</span>
                      </div>
                      <CardDescription className="mt-2">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                        {plan.name === "Corporate Enterprise" ? "Contact Sales" : "Get Started"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Testimonials */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Leading Corporations</h2>
              <p className="text-lg text-gray-600">
                See what legal professionals are saying about LexiScan AI
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
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="py-16">
                <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Legal Operations?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join hundreds of corporations already using LexiScan AI to streamline their legal processes.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button size="lg" variant="secondary">
                    <Play className="h-4 w-4 mr-2" />
                    Watch Demo
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
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
