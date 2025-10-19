"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  BarChart3,
  Download,
  Share2,
  Star,
  ArrowRight,
  Zap,
  Shield,
  Target,
  Users,
  TrendingUp,
  Award,
  Lightbulb,
  BookOpen,
  Video,
  MessageCircle
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const demoSteps = [
  {
    id: 1,
    title: "Upload Document",
    description: "Drag and drop your legal document or click to browse",
    icon: Upload,
    duration: "30 seconds",
    status: "completed"
  },
  {
    id: 2,
    title: "AI Analysis",
    description: "Our AI analyzes the document for risks, clauses, and insights",
    icon: Brain,
    duration: "2-3 minutes",
    status: "completed"
  },
  {
    id: 3,
    title: "Review Results",
    description: "Get detailed analysis with recommendations and risk scores",
    icon: CheckCircle,
    duration: "1 minute",
    status: "in-progress"
  },
  {
    id: 4,
    title: "Export & Share",
    description: "Download reports or share insights with your team",
    icon: Download,
    duration: "30 seconds",
    status: "pending"
  }
]

const analysisResults = {
  document: {
    name: "Service Agreement - TechCorp.pdf",
    type: "Service Agreement",
    pages: 12,
    size: "2.4 MB",
    uploadedAt: "2 minutes ago"
  },
  summary: {
    riskScore: 7.2,
    totalClauses: 24,
    flaggedIssues: 3,
    recommendations: 5,
    confidence: 96
  },
  risks: [
    {
      id: 1,
      title: "Unlimited Liability Clause",
      severity: "high",
      description: "The contract contains an unlimited liability clause that could expose your company to significant financial risk.",
      recommendation: "Consider adding liability caps or insurance requirements.",
      clause: "Section 8.2 - Liability and Indemnification"
    },
    {
      id: 2,
      title: "Termination Without Cause",
      severity: "medium",
      description: "Either party can terminate with only 30 days notice, which may not provide adequate protection.",
      recommendation: "Negotiate for longer notice periods or specific termination conditions.",
      clause: "Section 12.1 - Termination Rights"
    },
    {
      id: 3,
      title: "Intellectual Property Assignment",
      severity: "medium",
      description: "Broad IP assignment clause may claim ownership of work done outside the contract scope.",
      recommendation: "Clarify IP ownership boundaries and exclude pre-existing IP.",
      clause: "Section 6.3 - Intellectual Property Rights"
    }
  ],
  insights: [
    {
      category: "Payment Terms",
      insight: "Payment terms are standard with 30-day net payment",
      impact: "neutral",
      confidence: 94
    },
    {
      category: "Force Majeure",
      insight: "Force majeure clause is comprehensive and well-defined",
      impact: "positive",
      confidence: 98
    },
    {
      category: "Confidentiality",
      insight: "Confidentiality obligations are mutual and properly scoped",
      impact: "positive",
      confidence: 92
    }
  ]
}

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning models trained on millions of legal documents",
    benefits: ["98.7% accuracy", "Real-time processing", "Continuous learning"]
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Comprehensive risk analysis with severity scoring and recommendations",
    benefits: ["Risk scoring", "Issue flagging", "Actionable insights"]
  },
  {
    icon: Target,
    title: "Clause Detection",
    description: "Automatically identify and analyze key contract clauses and terms",
    benefits: ["24 clause types", "Custom templates", "Compliance checking"]
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share insights and collaborate with your legal team seamlessly",
    benefits: ["Real-time sharing", "Comment system", "Version control"]
  }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "General Counsel",
    company: "TechCorp",
    avatar: "/placeholder-avatar.jpg",
    content: "LexiScan AI has revolutionized our contract review process. What used to take hours now takes minutes, and the accuracy is remarkable.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Legal Director",
    company: "StartupXYZ",
    avatar: "/placeholder-avatar.jpg",
    content: "The risk assessment feature has helped us catch potential issues we would have missed. It's like having an expert legal analyst on our team.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Senior Legal Counsel",
    company: "GlobalCorp",
    avatar: "/placeholder-avatar.jpg",
    content: "The time savings alone justify the investment. We can now focus on strategic legal work instead of routine document review.",
    rating: 5
  }
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "bg-red-100 text-red-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "low":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "positive":
      return "text-green-600"
    case "negative":
      return "text-red-600"
    case "neutral":
      return "text-gray-600"
    default:
      return "text-gray-600"
  }
}

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(2)
  const [showResults, setShowResults] = useState(true)

  const toggleDemo = () => {
    setIsPlaying(!isPlaying)
  }

  const resetDemo = () => {
    setIsPlaying(false)
    setCurrentStep(1)
    setShowResults(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800">
              <Zap className="h-3 w-3 mr-1" />
              Interactive Demo
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              See LexiScan AI in Action
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Experience how our AI-powered document analysis can transform your legal workflow. 
              Watch as we analyze a real contract in real-time.
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" onClick={toggleDemo}>
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Demo
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Demo
                  </>
                )}
              </Button>
              <Button variant="outline" size="lg" onClick={resetDemo}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="demo" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="demo">Live Demo</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            </TabsList>

            <TabsContent value="demo" className="space-y-8">
              {/* Demo Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Demo Progress</CardTitle>
                  <CardDescription>
                    Follow along as we demonstrate the complete document analysis workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {demoSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          step.status === "completed" ? "bg-green-100 text-green-600" :
                          step.status === "in-progress" ? "bg-blue-100 text-blue-600" :
                          "bg-gray-100 text-gray-400"
                        }`}>
                          {step.status === "completed" ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : step.status === "in-progress" ? (
                            <Clock className="h-5 w-5" />
                          ) : (
                            <step.icon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{step.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {step.duration}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{step.description}</p>
                          {step.status === "in-progress" && (
                            <Progress value={75} className="h-2 mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              {showResults && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Document Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Document Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <div className="font-medium">{analysisResults.document.name}</div>
                          <div className="text-sm text-gray-500">{analysisResults.document.type}</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Pages:</span>
                          <span>{analysisResults.document.pages}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Size:</span>
                          <span>{analysisResults.document.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Uploaded:</span>
                          <span>{analysisResults.document.uploadedAt}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Analysis Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600 mb-1">
                            {analysisResults.summary.riskScore}/10
                          </div>
                          <div className="text-sm text-gray-500">Risk Score</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold">{analysisResults.summary.totalClauses}</div>
                            <div className="text-gray-500">Clauses</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-red-600">{analysisResults.summary.flaggedIssues}</div>
                            <div className="text-gray-500">Issues</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">{analysisResults.summary.recommendations}</div>
                            <div className="text-gray-500">Recommendations</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{analysisResults.summary.confidence}%</div>
                            <div className="text-gray-500">Confidence</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Analysis
                      </Button>
                      <Button variant="outline" className="w-full">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Get Expert Review
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Risk Analysis */}
              {showResults && (
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Analysis</CardTitle>
                    <CardDescription>
                      Identified risks and recommendations for your document
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {analysisResults.risks.map((risk) => (
                        <div key={risk.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              <h3 className="font-medium text-gray-900">{risk.title}</h3>
                            </div>
                            <Badge className={getSeverityColor(risk.severity)}>
                              {risk.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{risk.description}</p>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-blue-900 mb-1">Recommendation:</div>
                            <div className="text-sm text-blue-800">{risk.recommendation}</div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">{risk.clause}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Key Insights */}
              {showResults && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Insights</CardTitle>
                    <CardDescription>
                      AI-generated insights about your document
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {analysisResults.insights.map((insight, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{insight.category}</h4>
                            <Badge variant="outline" className="text-xs">
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                          <p className={`text-sm ${getImpactColor(insight.impact)}`}>
                            {insight.insight}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="features" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
                <p className="text-lg text-gray-600">
                  Discover what makes LexiScan AI the leading document analysis platform
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <feature.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                        </div>
                      </div>
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
            </TabsContent>

            <TabsContent value="testimonials" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
                <p className="text-lg text-gray-600">
                  Join thousands of legal professionals who trust LexiScan AI
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
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-600 italic">"{testimonial.content}"</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="py-16">
                <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Legal Workflow?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Start your free trial today and experience the power of AI-driven document analysis
                </p>
                <div className="flex justify-center space-x-4">
                  <Button size="lg" variant="secondary">
                    <Play className="h-4 w-4 mr-2" />
                    Start Free Trial
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Schedule Demo
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
