import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Code,
  Zap,
  Shield,
  Puzzle,
  FileText,
  Video,
  Search,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Rocket,
  Terminal,
  Database,
  Lock,
  Users,
  Settings,
  Play,
  Download,
  ExternalLink,
  Book,
  GraduationCap,
  Lightbulb,
  Key,
  Webhook
} from "lucide-react"

export const metadata: Metadata = {
  title: "Documentation - Developer Guides & API | LexiScan AI",
  description: "Complete documentation for LexiScan AI platform. API references, integration guides, SDKs, and best practices for legal document analysis.",
  keywords: "API documentation, developer guides, integration, SDK, legal AI API, document analysis API"
}

const quickStartGuides = [
  {
    title: "Getting Started",
    description: "Set up your account and analyze your first document in 5 minutes",
    icon: Rocket,
    href: "#getting-started",
    time: "5 min",
    difficulty: "Beginner"
  },
  {
    title: "API Quickstart",
    description: "Make your first API call and integrate with your application",
    icon: Code,
    href: "#api-quickstart",
    time: "10 min",
    difficulty: "Intermediate"
  },
  {
    title: "Authentication",
    description: "Learn how to authenticate and secure your API requests",
    icon: Key,
    href: "#authentication",
    time: "8 min",
    difficulty: "Intermediate"
  },
  {
    title: "Webhooks",
    description: "Set up real-time notifications for document processing events",
    icon: Webhook,
    href: "#webhooks",
    time: "12 min",
    difficulty: "Advanced"
  }
]

const documentation = [
  {
    category: "Core Concepts",
    icon: BookOpen,
    description: "Understand the fundamentals of LexiScan AI",
    topics: [
      { title: "Document Analysis", href: "#", badge: "Essential" },
      { title: "AI Models & Accuracy", href: "#", badge: null },
      { title: "Data Privacy & Security", href: "#", badge: "Important" },
      { title: "Rate Limits & Quotas", href: "#", badge: null },
      { title: "Error Handling", href: "#", badge: null }
    ]
  },
  {
    category: "API Reference",
    icon: Terminal,
    description: "Complete API endpoints and methods",
    topics: [
      { title: "REST API Overview", href: "#", badge: "Popular" },
      { title: "Documents API", href: "#", badge: "Popular" },
      { title: "Analysis API", href: "#", badge: "Popular" },
      { title: "Users & Teams API", href: "#", badge: null },
      { title: "Webhooks API", href: "#", badge: null }
    ]
  },
  {
    category: "SDKs & Libraries",
    icon: Code,
    description: "Official SDKs for popular languages",
    topics: [
      { title: "Node.js/TypeScript SDK", href: "#", badge: "Popular" },
      { title: "Python SDK", href: "#", badge: "Popular" },
      { title: "Java SDK", href: "#", badge: null },
      { title: ".NET SDK", href: "#", badge: null },
      { title: "Ruby SDK", href: "#", badge: null }
    ]
  },
  {
    category: "Integrations",
    icon: Puzzle,
    description: "Connect with your existing tools",
    topics: [
      { title: "iManage Integration", href: "#", badge: "Popular" },
      { title: "NetDocuments Integration", href: "#", badge: "Popular" },
      { title: "Microsoft Office 365", href: "#", badge: null },
      { title: "Salesforce Integration", href: "#", badge: null },
      { title: "Zapier & Webhooks", href: "#", badge: null }
    ]
  },
  {
    category: "Security & Compliance",
    icon: Shield,
    description: "Enterprise security features",
    topics: [
      { title: "Authentication & Authorization", href: "#", badge: "Essential" },
      { title: "Data Encryption", href: "#", badge: "Essential" },
      { title: "GDPR Compliance", href: "#", badge: "Important" },
      { title: "SOC 2 & ISO 27001", href: "#", badge: "Important" },
      { title: "Audit Logs", href: "#", badge: null }
    ]
  },
  {
    category: "Best Practices",
    icon: Lightbulb,
    description: "Tips for optimal usage",
    topics: [
      { title: "Document Preparation", href: "#", badge: null },
      { title: "Batch Processing", href: "#", badge: "Popular" },
      { title: "Error Handling Patterns", href: "#", badge: null },
      { title: "Performance Optimization", href: "#", badge: null },
      { title: "Cost Management", href: "#", badge: null }
    ]
  }
]

const codeExamples = [
  {
    title: "Upload and Analyze Document",
    language: "Node.js",
    code: `import { LexiScanClient } from '@lexiscan/sdk';

const client = new LexiScanClient({
  apiKey: process.env.LEXISCAN_API_KEY
});

// Upload document
const document = await client.documents.upload({
  file: './contract.pdf',
  type: 'contract'
});

// Analyze document
const analysis = await client.analyze(document.id, {
  features: ['risk-detection', 'clause-extraction']
});

console.log(analysis.results);`
  },
  {
    title: "Webhook Event Handler",
    language: "Python",
    code: `from flask import Flask, request
from lexiscan import verify_webhook

app = Flask(__name__)

@app.route('/webhooks/lexiscan', methods=['POST'])
def handle_webhook():
    # Verify webhook signature
    signature = request.headers.get('X-LexiScan-Signature')
    payload = request.get_data()
    
    if not verify_webhook(payload, signature):
        return 'Invalid signature', 401
    
    event = request.get_json()
    
    if event['type'] == 'analysis.completed':
        document_id = event['data']['document_id']
        results = event['data']['results']
        # Process results
        
    return 'OK', 200`
  },
  {
    title: "Batch Document Processing",
    language: "TypeScript",
    code: `interface DocumentBatch {
  documents: File[];
  options: AnalysisOptions;
}

async function processBatch(batch: DocumentBatch) {
  const uploads = await Promise.all(
    batch.documents.map(file => 
      client.documents.upload({ file })
    )
  );
  
  const analyses = await Promise.all(
    uploads.map(doc => 
      client.analyze(doc.id, batch.options)
    )
  );
  
  return analyses;
}`
  }
]

const videoTutorials = [
  {
    title: "Getting Started with LexiScan AI",
    duration: "8:30",
    views: "15K",
    level: "Beginner",
    thumbnail: "🎥"
  },
  {
    title: "API Integration Walkthrough",
    duration: "15:45",
    views: "12K",
    level: "Intermediate",
    thumbnail: "🎥"
  },
  {
    title: "Advanced Contract Analysis",
    duration: "12:20",
    views: "8K",
    level: "Advanced",
    thumbnail: "🎥"
  },
  {
    title: "Webhook Setup and Testing",
    duration: "10:15",
    views: "6K",
    level: "Intermediate",
    thumbnail: "🎥"
  }
]

const resources = [
  {
    title: "API Reference",
    description: "Complete API documentation with all endpoints",
    icon: Terminal,
    href: "#",
    type: "Reference"
  },
  {
    title: "SDK Documentation",
    description: "Official SDKs for Node.js, Python, Java, and more",
    icon: Code,
    href: "#",
    type: "Guide"
  },
  {
    title: "Postman Collection",
    description: "Import our API collection for easy testing",
    icon: Download,
    href: "#",
    type: "Download"
  },
  {
    title: "OpenAPI Spec",
    description: "OpenAPI 3.0 specification for the LexiScan API",
    icon: FileText,
    href: "#",
    type: "Download"
  },
  {
    title: "Sample Applications",
    description: "Working examples on GitHub",
    icon: Code,
    href: "#",
    type: "Code"
  },
  {
    title: "Community Forum",
    description: "Ask questions and share knowledge",
    icon: Users,
    href: "#",
    type: "Community"
  }
]

const popularDocs = [
  {
    title: "How to authenticate API requests",
    category: "Authentication",
    views: "25K views"
  },
  {
    title: "Document upload best practices",
    category: "Best Practices",
    views: "18K views"
  },
  {
    title: "Understanding analysis results",
    category: "Core Concepts",
    views: "16K views"
  },
  {
    title: "Setting up webhooks for real-time updates",
    category: "Webhooks",
    views: "14K views"
  },
  {
    title: "Rate limits and error handling",
    category: "API Reference",
    views: "12K views"
  }
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-24 sm:pt-24 sm:pb-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="secondary" className="mb-4">
                <BookOpen className="h-3 w-3 mr-1" />
                Developer Documentation
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                Build with{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LexiScan AI
                </span>
              </h1>
              <p className="text-lg leading-8 text-gray-600 mb-8">
                Everything you need to integrate AI-powered legal document analysis into your 
                applications. Complete guides, API references, and code examples.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search documentation..."
                    className="pl-12 pr-4 py-6 text-base border-gray-300 rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="#getting-started">
                  <Button size="lg" className="group">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#api-reference">
                  <Button size="lg" variant="outline">
                    API Reference
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
            <div className="relative aspect-[1155/678] w-[36.125rem] bg-gradient-to-tr from-blue-200 to-purple-200 opacity-30" />
          </div>
        </section>

        {/* Quick Start Guides */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Zap className="h-3 w-3 mr-1" />
                Quick Start
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Get Up and Running Fast
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Follow these guides to start analyzing documents in minutes
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStartGuides.map((guide) => {
                const GuideIcon = guide.icon
                return (
                  <Link key={guide.title} href={guide.href}>
                    <Card className="h-full border-2 hover:border-blue-500 transition-all duration-300 cursor-pointer group">
                      <CardContent className="pt-6">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <GuideIcon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {guide.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {guide.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="secondary">{guide.time}</Badge>
                          <Badge variant="outline">{guide.difficulty}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Documentation Categories */}
        <section id="documentation" className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Book className="h-3 w-3 mr-1" />
                Complete Documentation
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Explore by Category
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Comprehensive guides covering every aspect of the platform
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {documentation.map((category) => {
                const CategoryIcon = category.icon
                return (
                  <Card key={category.category} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <CategoryIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">{category.category}</CardTitle>
                      </div>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.topics.map((topic) => (
                          <li key={topic.title}>
                            <Link
                              href={topic.href}
                              className="flex items-center justify-between text-gray-700 hover:text-blue-600 transition-colors group py-1"
                            >
                              <span className="flex items-center">
                                <ArrowRight className="h-4 w-4 mr-2 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                {topic.title}
                              </span>
                              {topic.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {topic.badge}
                                </Badge>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Terminal className="h-3 w-3 mr-1" />
                Code Examples
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Learn by Example
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Copy and paste these examples to get started quickly
              </p>
            </div>

            <div className="max-w-5xl mx-auto space-y-6">
              {codeExamples.map((example) => (
                <Card key={example.title} className="border-2 hover:border-blue-500 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {example.title}
                      </h3>
                      <Badge variant="secondary">{example.language}</Badge>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                      <pre className="text-sm text-gray-100 font-mono">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Code className="mr-2 h-4 w-4" />
                        Copy Code
                      </Button>
                      <Button variant="ghost" size="sm">
                        View Full Example
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Video className="h-3 w-3 mr-1" />
                Video Tutorials
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Watch and Learn
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Step-by-step video guides for visual learners
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {videoTutorials.map((video) => (
                <Card key={video.title} className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                  <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors rounded-t-lg" />
                    <div className="relative z-10">
                      <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-blue-600 ml-1" />
                      </div>
                    </div>
                    <Badge className="absolute top-3 right-3 bg-black/70 text-white border-none">
                      {video.duration}
                    </Badge>
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{video.views} views</span>
                      <Badge variant="outline" className="text-xs">
                        {video.level}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Documentation */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Accessed Docs
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The most helpful articles based on community usage
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {popularDocs.map((doc) => (
                <Card key={doc.title} className="border-2 hover:border-blue-500 transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                          {doc.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <Badge variant="secondary" className="text-xs">
                            {doc.category}
                          </Badge>
                          <span>{doc.views}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Download className="h-3 w-3 mr-1" />
                Developer Resources
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Additional Resources
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Tools, downloads, and community support for developers
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => {
                const ResourceIcon = resource.icon
                return (
                  <Card key={resource.title} className="border-2 hover:border-blue-500 transition-colors cursor-pointer group">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                          <ResourceIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {resource.title}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {resource.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {resource.description}
                          </p>
                          <Button variant="ghost" size="sm" className="p-0 h-auto">
                            Learn More
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Support CTA */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none shadow-xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Need Help Getting Started?
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Our developer success team is here to help you integrate LexiScan AI 
                    into your application. Get personalized support and best practices.
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link href="/contact">
                      <Button size="lg" className="group">
                        Contact Developer Support
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/help">
                      <Button size="lg" variant="outline">
                        Visit Help Center
                      </Button>
                    </Link>
                  </div>

                  <p className="text-sm text-gray-500 mt-6">
                    <CheckCircle className="inline h-4 w-4 mr-1 text-green-600" />
                    Response time: &lt;4 hours • Technical support available
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Building?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Get your API key and start analyzing legal documents in minutes.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="group bg-white hover:bg-gray-100">
                    Get API Key Free
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 bg-white/5">
                    Schedule Demo
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-blue-200 mt-6">
                <CheckCircle className="inline h-4 w-4 mr-1" />
                Free tier available • No credit card required • Full API access
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

