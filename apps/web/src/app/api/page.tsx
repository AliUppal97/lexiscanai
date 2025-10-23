import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Code,
  Key,
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
  Book,
  Terminal,
  FileText,
  Lock,
  Rocket,
  Globe,
  Cloud,
  Database,
  Sparkles,
  Copy,
  ExternalLink,
  Play,
  BarChart3,
  Users,
  Clock,
  DollarSign,
  FileCheck,
  Braces,
  Webhook,
  GitBranch,
  Package,
  Server,
  Activity,
  AlertCircle,
  Download
} from "lucide-react"

export const metadata: Metadata = {
  title: "API Documentation - Developer Resources | LexiScan AI",
  description: "Powerful REST API for document analysis and legal AI. Integrate LexiScan AI into your applications with comprehensive SDKs, detailed documentation, and enterprise support.",
  keywords: "legal AI API, document analysis API, REST API, SDK, developer documentation, API integration, legal tech API"
}

const apiFeatures = [
  {
    title: "RESTful API",
    description: "Simple, predictable REST API following industry best practices with JSON responses",
    icon: Code,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200"
  },
  {
    title: "Enterprise Security",
    description: "OAuth 2.0, API keys, TLS 1.3 encryption, and comprehensive audit logging",
    icon: Shield,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    borderColor: "border-green-200"
  },
  {
    title: "99.9% Uptime SLA",
    description: "Industry-leading reliability with redundant infrastructure and automatic failover",
    icon: Activity,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200"
  },
  {
    title: "Webhooks Support",
    description: "Real-time notifications for document processing events and status updates",
    icon: Webhook,
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    borderColor: "border-orange-200"
  },
  {
    title: "SDKs & Libraries",
    description: "Official SDKs for Python, JavaScript, Java, .NET, Ruby, and Go",
    icon: Package,
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
    borderColor: "border-cyan-200"
  },
  {
    title: "Comprehensive Docs",
    description: "Detailed API reference, code examples, tutorials, and interactive playground",
    icon: Book,
    bgColor: "bg-pink-50",
    iconColor: "text-pink-600",
    borderColor: "border-pink-200"
  }
]

const codeExamples = [
  {
    language: "Python",
    icon: "🐍",
    code: `from lexiscan import LexiScanClient

# Initialize client
client = LexiScanClient(api_key="your_api_key")

# Upload and analyze document
result = client.documents.analyze(
    file="contract.pdf",
    analysis_type="contract_review",
    options={
        "extract_clauses": True,
        "identify_risks": True
    }
)

# Access results
print(f"Analysis ID: {result.id}")
print(f"Risk Score: {result.risk_score}")
print(f"Clauses Found: {len(result.clauses)}")`
  },
  {
    language: "JavaScript",
    icon: "⚡",
    code: `const LexiScan = require('@lexiscan/node-sdk');

// Initialize client
const client = new LexiScan({
  apiKey: process.env.LEXISCAN_API_KEY
});

// Upload and analyze document
const result = await client.documents.analyze({
  file: 'contract.pdf',
  analysisType: 'contract_review',
  options: {
    extractClauses: true,
    identifyRisks: true
  }
});

// Access results
console.log(\`Analysis ID: \${result.id}\`);
console.log(\`Risk Score: \${result.riskScore}\`);`
  },
  {
    language: "cURL",
    icon: "🌐",
    code: `# Upload document
curl -X POST https://api.lexiscan.ai/v1/documents \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@contract.pdf" \\
  -F "analysis_type=contract_review" \\
  -F "options[extract_clauses]=true" \\
  -F "options[identify_risks]=true"

# Response
{
  "id": "doc_abc123",
  "status": "processing",
  "created_at": "2024-11-15T10:30:00Z"
}`
  }
]

const endpoints = [
  {
    method: "POST",
    path: "/v1/documents",
    description: "Upload and analyze a document",
    category: "Documents"
  },
  {
    method: "GET",
    path: "/v1/documents/{id}",
    description: "Retrieve document analysis results",
    category: "Documents"
  },
  {
    method: "POST",
    path: "/v1/documents/{id}/extract",
    description: "Extract specific information from document",
    category: "Analysis"
  },
  {
    method: "POST",
    path: "/v1/contracts/compare",
    description: "Compare two or more contracts",
    category: "Contracts"
  },
  {
    method: "POST",
    path: "/v1/compliance/check",
    description: "Check document for regulatory compliance",
    category: "Compliance"
  },
  {
    method: "POST",
    path: "/v1/search",
    description: "Search across analyzed documents",
    category: "Search"
  },
  {
    method: "GET",
    path: "/v1/webhooks",
    description: "List configured webhooks",
    category: "Webhooks"
  },
  {
    method: "POST",
    path: "/v1/webhooks",
    description: "Create new webhook subscription",
    category: "Webhooks"
  }
]

const sdks = [
  {
    name: "Python SDK",
    version: "v2.3.1",
    icon: "🐍",
    description: "Official Python library with async support",
    install: "pip install lexiscan",
    docs: "https://docs.lexiscan.ai/python",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    name: "Node.js SDK",
    version: "v2.1.0",
    icon: "⚡",
    description: "JavaScript/TypeScript library for Node.js",
    install: "npm install @lexiscan/node-sdk",
    docs: "https://docs.lexiscan.ai/nodejs",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    name: "Java SDK",
    version: "v1.8.2",
    icon: "☕",
    description: "Enterprise Java SDK with Spring Boot support",
    install: "maven: com.lexiscan:lexiscan-java:1.8.2",
    docs: "https://docs.lexiscan.ai/java",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  {
    name: ".NET SDK",
    version: "v1.7.0",
    icon: "🔷",
    description: "C# library for .NET Core and Framework",
    install: "dotnet add package LexiScan.Client",
    docs: "https://docs.lexiscan.ai/dotnet",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    name: "Ruby SDK",
    version: "v1.5.1",
    icon: "💎",
    description: "Idiomatic Ruby gem with Rails integration",
    install: "gem install lexiscan",
    docs: "https://docs.lexiscan.ai/ruby",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200"
  },
  {
    name: "Go SDK",
    version: "v1.4.0",
    icon: "🔵",
    description: "High-performance Go client library",
    install: "go get github.com/lexiscan/go-sdk",
    docs: "https://docs.lexiscan.ai/go",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200"
  }
]

const useCases = [
  {
    title: "Contract Management",
    description: "Automate contract review, extraction, and compliance checking",
    features: [
      "Clause extraction and classification",
      "Risk identification and scoring",
      "Obligation tracking",
      "Renewal date detection"
    ],
    icon: FileCheck,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600"
  },
  {
    title: "Legal Research",
    description: "Build AI-powered legal research and analysis tools",
    features: [
      "Document similarity search",
      "Case law analysis",
      "Citation extraction",
      "Legal entity recognition"
    ],
    icon: Book,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600"
  },
  {
    title: "Due Diligence",
    description: "Accelerate M&A and investment due diligence processes",
    features: [
      "Bulk document processing",
      "Risk assessment",
      "Data room analysis",
      "Compliance verification"
    ],
    icon: Shield,
    bgColor: "bg-green-50",
    iconColor: "text-green-600"
  },
  {
    title: "Workflow Automation",
    description: "Integrate AI into existing legal workflows and systems",
    features: [
      "Document intake automation",
      "Intelligent routing",
      "Status tracking",
      "Notification triggers"
    ],
    icon: Zap,
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  }
]

const pricingTiers = [
  {
    name: "Developer",
    price: "Free",
    description: "For testing and development",
    features: [
      "100 API calls/month",
      "5 MB file size limit",
      "Community support",
      "All SDKs included",
      "Basic documentation"
    ],
    cta: "Get API Key",
    popular: false
  },
  {
    name: "Professional",
    price: "$299",
    period: "/month",
    description: "For production applications",
    features: [
      "10,000 API calls/month",
      "100 MB file size limit",
      "Email support (48h)",
      "Webhooks included",
      "Advanced analytics",
      "Custom rate limits"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale deployments",
    features: [
      "Unlimited API calls",
      "No file size limits",
      "24/7 priority support",
      "Custom SLA",
      "Dedicated infrastructure",
      "On-premise deployment"
    ],
    cta: "Contact Sales",
    popular: false
  }
]

const metrics = [
  {
    value: "< 2s",
    label: "Average Response Time",
    description: "Fast document processing",
    icon: Clock,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600"
  },
  {
    value: "99.9%",
    label: "API Uptime",
    description: "Reliable infrastructure",
    icon: Activity,
    bgColor: "bg-green-50",
    iconColor: "text-green-600"
  },
  {
    value: "50M+",
    label: "Documents Processed",
    description: "Proven at scale",
    icon: FileText,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600"
  },
  {
    value: "5000+",
    label: "Active Developers",
    description: "Growing community",
    icon: Users,
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  }
]

export default function APIPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 pt-20 pb-24 sm:pt-24 sm:pb-32 text-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
                <Code className="h-3 w-3 mr-1" />
                API & Developer Platform
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                Build with{" "}
                <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Legal AI
                </span>
              </h1>
              <p className="text-lg leading-8 text-blue-100 mb-8">
                Powerful REST API and SDKs to integrate advanced document analysis and legal AI 
                into your applications. Built for developers, trusted by enterprises.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="group bg-white hover:bg-gray-100 text-gray-900">
                    Get API Key
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Book className="mr-2 h-4 w-4" />
                    View Documentation
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Play className="mr-2 h-4 w-4" />
                  Try API Playground
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-200">
                <span className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Free Developer Tier
                </span>
                <span className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  6 Official SDKs
                </span>
                <span className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  99.9% Uptime SLA
                </span>
                <span className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  SOC 2 Compliant
                </span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
            <div className="relative aspect-[1155/678] w-[36.125rem] bg-gradient-to-tr from-blue-400 to-purple-400 opacity-20" />
          </div>
        </section>

        {/* Metrics */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric) => {
                const MetricIcon = metric.icon
                return (
                  <Card key={metric.label} className="border-none shadow-lg text-center">
                    <CardContent className="pt-6">
                      <div className={`h-14 w-14 rounded-full ${metric.bgColor} flex items-center justify-center mx-auto mb-3`}>
                        <MetricIcon className={`h-7 w-7 ${metric.iconColor}`} />
                      </div>
                      <div className={`text-3xl font-bold ${metric.iconColor} mb-1`}>
                        {metric.value}
                      </div>
                      <div className="font-semibold text-gray-900 mb-1 text-sm">
                        {metric.label}
                      </div>
                      <p className="text-xs text-gray-600">
                        {metric.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* API Features */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                API Features
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything You Need to Build
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Enterprise-grade API with developer-friendly tools and comprehensive documentation
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiFeatures.map((feature) => {
                const FeatureIcon = feature.icon
                return (
                  <Card key={feature.title} className={`border-2 ${feature.borderColor} hover:shadow-lg transition-shadow`}>
                    <CardHeader className={feature.bgColor}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white shadow-md flex items-center justify-center flex-shrink-0">
                          <FeatureIcon className={`h-5 w-5 ${feature.iconColor}`} />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Terminal className="h-3 w-3 mr-1" />
                Code Examples
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Get Started in Minutes
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Simple, intuitive API design with comprehensive examples in your favorite language
              </p>
            </div>

            <div className="space-y-6">
              {codeExamples.map((example) => (
                <Card key={example.language} className="border-2 border-gray-200">
                  <CardHeader className="bg-gray-900 text-white rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{example.icon}</span>
                        <CardTitle className="text-white">{example.language}</CardTitle>
                      </div>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <pre className="bg-gray-50 p-6 rounded-b-lg overflow-x-auto">
                      <code className="text-sm text-gray-900 font-mono">{example.code}</code>
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/docs">
                <Button size="lg" className="group">
                  View All Code Examples
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* API Endpoints */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Braces className="h-3 w-3 mr-1" />
                API Reference
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Core API Endpoints
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                RESTful API with predictable resource-oriented URLs and JSON responses
              </p>
            </div>

            <Card className="border-2 border-gray-200">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {endpoints.map((endpoint, idx) => (
                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <Badge 
                            variant={endpoint.method === "POST" ? "default" : "secondary"}
                            className="font-mono text-xs"
                          >
                            {endpoint.method}
                          </Badge>
                          <div className="flex-1">
                            <code className="text-sm font-mono text-gray-900 font-semibold">
                              {endpoint.path}
                            </code>
                            <p className="text-sm text-gray-600 mt-1">
                              {endpoint.description}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs w-fit">
                          {endpoint.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <Link href="/docs">
                <Button variant="outline" size="lg" className="group">
                  <Book className="mr-2 h-4 w-4" />
                  View Complete API Reference
                  <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SDKs */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Package className="h-3 w-3 mr-1" />
                Official SDKs
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Client Libraries for Every Platform
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Production-ready SDKs with type safety, error handling, and automatic retries
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sdks.map((sdk) => (
                <Card key={sdk.name} className={`border-2 ${sdk.borderColor} hover:shadow-lg transition-shadow`}>
                  <CardHeader className={sdk.bgColor}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{sdk.icon}</span>
                      <Badge variant="outline" className="text-xs">
                        {sdk.version}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{sdk.name}</CardTitle>
                    <CardDescription>{sdk.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-2">Installation:</p>
                      <code className="text-xs bg-gray-100 p-2 rounded block font-mono text-gray-900">
                        {sdk.install}
                      </code>
                    </div>
                    <Link href={sdk.docs}>
                      <Button variant="outline" size="sm" className="w-full group">
                        <Book className="mr-2 h-3 w-3" />
                        Documentation
                        <ExternalLink className="ml-auto h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Rocket className="h-3 w-3 mr-1" />
                Use Cases
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What You Can Build
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Empower your applications with AI-powered document intelligence
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {useCases.map((useCase) => {
                const UseCaseIcon = useCase.icon
                return (
                  <Card key={useCase.title} className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
                    <CardHeader className={useCase.bgColor}>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-white shadow-md flex items-center justify-center">
                          <UseCaseIcon className={`h-6 w-6 ${useCase.iconColor}`} />
                        </div>
                        <div>
                          <CardTitle>{useCase.title}</CardTitle>
                          <CardDescription className="text-gray-700">
                            {useCase.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Capabilities:</h4>
                      <ul className="space-y-2">
                        {useCase.features.map((feature) => (
                          <li key={feature} className="flex items-start text-sm text-gray-600">
                            <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                            <span>{feature}</span>
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

        {/* Pricing */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <DollarSign className="h-3 w-3 mr-1" />
                API Pricing
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Start free, scale as you grow. No hidden fees or surprise charges.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingTiers.map((tier) => (
                <Card 
                  key={tier.name} 
                  className={`border-2 ${tier.popular ? 'border-blue-500 shadow-xl' : 'border-gray-200'} relative`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                      {tier.period && (
                        <span className="text-gray-600">{tier.period}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start text-sm">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={tier.popular ? "default" : "outline"}
                    >
                      {tier.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-sm text-gray-600 mb-4">
                All plans include: SSL encryption • Webhook support • Community access • Regular updates
              </p>
              <Link href="/pricing">
                <Button variant="outline">
                  View Detailed Pricing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Book className="h-3 w-3 mr-1" />
                Developer Resources
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive documentation, tutorials, and support for developers
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow text-center">
                <CardContent className="pt-6">
                  <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Book className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Documentation</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Comprehensive API reference and guides
                  </p>
                  <Link href="/docs">
                    <Button variant="outline" size="sm" className="w-full">
                      Read Docs
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 hover:shadow-lg transition-shadow text-center">
                <CardContent className="pt-6">
                  <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <GitBranch className="h-7 w-7 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Code Samples</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Real-world examples and templates
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Browse GitHub
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:shadow-lg transition-shadow text-center">
                <CardContent className="pt-6">
                  <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-7 w-7 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Community</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Join 5,000+ developers worldwide
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Join Discord
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200 hover:shadow-lg transition-shadow text-center">
                <CardContent className="pt-6">
                  <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-7 w-7 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Support</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get help from our expert team
                  </p>
                  <Link href="/help">
                    <Button variant="outline" size="sm" className="w-full">
                      Get Support
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Building?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Get your API key in minutes and start integrating legal AI into your applications today.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="group bg-white hover:bg-gray-100 text-gray-900">
                    Get Free API Key
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Book className="mr-2 h-4 w-4" />
                    Read Documentation
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Talk to Sales
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-blue-200 mt-6">
                Free tier available • No credit card required • Production-ready in minutes
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

