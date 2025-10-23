import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Zap,
  CheckCircle2,
  ArrowRight,
  Search,
  Sparkles,
  Cloud,
  Database,
  FileText,
  Lock,
  Users,
  Briefcase,
  Globe,
  Code,
  Workflow,
  Mail,
  MessageSquare,
  Calendar,
  FolderOpen,
  Shield,
  Clock,
  BarChart3,
  FileCheck,
  GitBranch,
  Webhook,
  Package,
  Server,
  Boxes,
  Link2,
  Play,
  Settings
} from "lucide-react"

export const metadata: Metadata = {
  title: "Integrations - Connect Your Workflow | LexiScan AI",
  description: "Seamlessly integrate LexiScan AI with your favorite legal tech, business, and productivity tools. Connect with 100+ platforms including Salesforce, Microsoft, Slack, and more.",
  keywords: "legal AI integrations, API integrations, workflow automation, legal tech ecosystem, business tools integration"
}

const featuredIntegrations = [
  {
    name: "Salesforce",
    category: "CRM",
    logo: "☁️",
    description: "Automatically analyze contracts and legal documents within Salesforce workflows",
    features: [
      "Auto-sync contract data",
      "Real-time risk alerts",
      "Custom field mapping",
      "Workflow automation"
    ],
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    popular: true
  },
  {
    name: "Microsoft 365",
    category: "Productivity",
    logo: "🪟",
    description: "Integrate with Word, Excel, SharePoint, and Teams for seamless document analysis",
    features: [
      "One-click document review",
      "Teams notifications",
      "SharePoint auto-sync",
      "Outlook integration"
    ],
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    popular: true
  },
  {
    name: "Slack",
    category: "Communication",
    logo: "💬",
    description: "Get instant notifications and manage documents directly from Slack",
    features: [
      "Real-time alerts",
      "Slash commands",
      "Interactive messages",
      "Team collaboration"
    ],
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    popular: true
  },
  {
    name: "DocuSign",
    category: "E-Signature",
    logo: "✍️",
    description: "Analyze documents before signing and track contract obligations",
    features: [
      "Pre-signature analysis",
      "Automated routing",
      "Compliance checking",
      "Audit trail sync"
    ],
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    popular: true
  }
]

const integrationCategories = [
  {
    name: "Legal Tech",
    icon: Scale,
    count: 24,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    integrations: [
      { name: "Clio", logo: "⚖️", description: "Practice management" },
      { name: "MyCase", logo: "📁", description: "Case management" },
      { name: "Thomson Reuters", logo: "📚", description: "Legal research" },
      { name: "Westlaw", logo: "🔍", description: "Legal database" },
      { name: "LexisNexis", logo: "📖", description: "Legal research" },
      { name: "NetDocuments", logo: "📄", description: "Document management" }
    ]
  },
  {
    name: "CRM & Sales",
    icon: Users,
    count: 18,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    integrations: [
      { name: "Salesforce", logo: "☁️", description: "CRM platform" },
      { name: "HubSpot", logo: "🔶", description: "Marketing & CRM" },
      { name: "Pipedrive", logo: "📊", description: "Sales CRM" },
      { name: "Zoho CRM", logo: "🎯", description: "Business CRM" },
      { name: "Microsoft Dynamics", logo: "🔷", description: "Enterprise CRM" },
      { name: "Copper", logo: "🔸", description: "Google Workspace CRM" }
    ]
  },
  {
    name: "Cloud Storage",
    icon: Cloud,
    count: 15,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    integrations: [
      { name: "Google Drive", logo: "📁", description: "Cloud storage" },
      { name: "Dropbox", logo: "📦", description: "File sharing" },
      { name: "OneDrive", logo: "☁️", description: "Microsoft storage" },
      { name: "Box", logo: "📦", description: "Enterprise content" },
      { name: "AWS S3", logo: "🗄️", description: "Object storage" },
      { name: "Azure Blob", logo: "🔷", description: "Cloud storage" }
    ]
  },
  {
    name: "Communication",
    icon: MessageSquare,
    count: 12,
    bgColor: "bg-pink-50",
    iconColor: "text-pink-600",
    integrations: [
      { name: "Slack", logo: "💬", description: "Team messaging" },
      { name: "Microsoft Teams", logo: "👥", description: "Collaboration" },
      { name: "Zoom", logo: "📹", description: "Video meetings" },
      { name: "Google Chat", logo: "💭", description: "Team chat" },
      { name: "Discord", logo: "🎮", description: "Community chat" },
      { name: "Webex", logo: "🎥", description: "Cisco meetings" }
    ]
  },
  {
    name: "Project Management",
    icon: Briefcase,
    count: 16,
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    integrations: [
      { name: "Asana", logo: "🎯", description: "Task management" },
      { name: "Monday.com", logo: "📅", description: "Work OS" },
      { name: "Jira", logo: "🔷", description: "Issue tracking" },
      { name: "Trello", logo: "📋", description: "Kanban boards" },
      { name: "ClickUp", logo: "⚡", description: "All-in-one" },
      { name: "Notion", logo: "📝", description: "Workspace" }
    ]
  },
  {
    name: "E-Signature",
    icon: FileCheck,
    count: 8,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    integrations: [
      { name: "DocuSign", logo: "✍️", description: "E-signature" },
      { name: "Adobe Sign", logo: "🖊️", description: "Document signing" },
      { name: "HelloSign", logo: "✏️", description: "Simple signing" },
      { name: "PandaDoc", logo: "🐼", description: "Documents & eSign" },
      { name: "SignNow", logo: "📝", description: "Digital signatures" },
      { name: "Docsketch", logo: "✍️", description: "Proposal signing" }
    ]
  },
  {
    name: "Developer Tools",
    icon: Code,
    count: 20,
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
    integrations: [
      { name: "GitHub", logo: "🐱", description: "Code hosting" },
      { name: "GitLab", logo: "🦊", description: "DevOps platform" },
      { name: "Bitbucket", logo: "🪣", description: "Git solution" },
      { name: "Jenkins", logo: "👨‍🔧", description: "CI/CD automation" },
      { name: "CircleCI", logo: "⭕", description: "Continuous integration" },
      { name: "Travis CI", logo: "🔶", description: "CI service" }
    ]
  },
  {
    name: "Business Intelligence",
    icon: BarChart3,
    count: 10,
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-600",
    integrations: [
      { name: "Tableau", logo: "📊", description: "Data visualization" },
      { name: "Power BI", logo: "📈", description: "Microsoft BI" },
      { name: "Looker", logo: "👀", description: "Data analytics" },
      { name: "Qlik", logo: "🔵", description: "Analytics platform" },
      { name: "Domo", logo: "📊", description: "Business cloud" },
      { name: "Metabase", logo: "📉", description: "Open analytics" }
    ]
  }
]

const integrationMethods = [
  {
    title: "Pre-built Integrations",
    description: "One-click setup with popular platforms. No coding required.",
    icon: Boxes,
    features: [
      "OAuth authentication",
      "Automatic updates",
      "Guided setup wizard",
      "Pre-configured workflows"
    ],
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600"
  },
  {
    title: "REST API",
    description: "Full API access for custom integrations and automation.",
    icon: Code,
    features: [
      "Comprehensive endpoints",
      "SDKs in 6 languages",
      "Detailed documentation",
      "Interactive playground"
    ],
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600"
  },
  {
    title: "Webhooks",
    description: "Real-time event notifications for your applications.",
    icon: Webhook,
    features: [
      "Event subscriptions",
      "Retry logic",
      "Signature verification",
      "Delivery tracking"
    ],
    bgColor: "bg-green-50",
    iconColor: "text-green-600"
  },
  {
    title: "Zapier & Make",
    description: "Connect with 5,000+ apps using no-code platforms.",
    icon: Zap,
    features: [
      "Trigger-based automation",
      "Multi-step workflows",
      "No coding needed",
      "1000+ pre-built zaps"
    ],
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  }
]

const benefits = [
  {
    title: "Unified Workflow",
    description: "Work seamlessly across all your tools without switching contexts",
    icon: Workflow,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600"
  },
  {
    title: "Automated Processes",
    description: "Eliminate manual data entry and repetitive tasks",
    icon: Zap,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600"
  },
  {
    title: "Real-time Sync",
    description: "Keep data up-to-date across all connected systems",
    icon: Clock,
    bgColor: "bg-green-50",
    iconColor: "text-green-600"
  },
  {
    title: "Enhanced Security",
    description: "Enterprise-grade encryption and access controls",
    icon: Shield,
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  }
]

const useCaseExamples = [
  {
    title: "Salesforce + DocuSign + LexiScan",
    description: "Automated contract review and approval workflow",
    steps: [
      "New contract uploaded to Salesforce",
      "LexiScan analyzes for risks and compliance",
      "Alerts sent via Slack if issues found",
      "Approved contracts sent to DocuSign",
      "Signed documents stored in SharePoint"
    ],
    icon: "🔄",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    title: "Microsoft 365 + Teams + LexiScan",
    description: "Enterprise document processing pipeline",
    steps: [
      "Documents uploaded to SharePoint",
      "LexiScan automatically extracts key data",
      "Summary posted to Teams channel",
      "Structured data synced to Excel",
      "Compliance reports generated in Power BI"
    ],
    icon: "🏢",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    title: "Clio + Box + LexiScan",
    description: "Law firm case management automation",
    steps: [
      "Client documents uploaded to Clio",
      "LexiScan reviews for case relevance",
      "Key evidence flagged and categorized",
      "Documents organized in Box folders",
      "Case timeline updated automatically"
    ],
    icon: "⚖️",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  }
]

const stats = [
  {
    value: "100+",
    label: "Integrations",
    description: "Pre-built connections",
    icon: Link2
  },
  {
    value: "5M+",
    label: "API Calls Daily",
    description: "Powering workflows",
    icon: Zap
  },
  {
    value: "99.9%",
    label: "Uptime",
    description: "Reliable connections",
    icon: CheckCircle2
  },
  {
    value: "< 100ms",
    label: "Response Time",
    description: "Fast processing",
    icon: Clock
  }
]

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-24 sm:pt-24 sm:pb-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4">
                <Link2 className="h-3 w-3 mr-1" />
                Integrations & Connections
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                Connect Your{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Entire Workflow
                </span>
              </h1>
              <p className="text-lg leading-8 text-gray-600 mb-8">
                Seamlessly integrate LexiScan AI with 100+ tools you already use. 
                From CRMs to cloud storage, communication to e-signature - work smarter, not harder.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search integrations..."
                    className="pl-12 pr-4 py-6 text-base border-gray-300 rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="group">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/api">
                  <Button size="lg" variant="outline">
                    <Code className="mr-2 h-4 w-4" />
                    View API Docs
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

        {/* Stats */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const StatIcon = stat.icon
                return (
                  <Card key={stat.label} className="border-none shadow-lg text-center">
                    <CardContent className="pt-6">
                      <StatIcon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {stat.value}
                      </div>
                      <div className="font-semibold text-gray-900 mb-1">
                        {stat.label}
                      </div>
                      <p className="text-sm text-gray-600">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Featured Integrations */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured Integrations
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Most Popular Connections
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                One-click setup with the tools you already love
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {featuredIntegrations.map((integration) => (
                <Card key={integration.name} className={`border-2 ${integration.borderColor} hover:shadow-xl transition-shadow`}>
                  <CardHeader className={integration.bgColor}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-xl bg-white shadow-md flex items-center justify-center text-3xl">
                          {integration.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">{integration.name}</CardTitle>
                            {integration.popular && (
                              <Badge variant="secondary" className="text-xs">Popular</Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {integration.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-3 text-gray-700">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Features:</h4>
                    <ul className="space-y-2 mb-6">
                      {integration.features.map((feature) => (
                        <li key={feature} className="flex items-start text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-3">
                      <Button className="flex-1 group">
                        Connect Now
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <Button variant="outline">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Categories */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Boxes className="h-3 w-3 mr-1" />
                All Integrations
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Browse by Category
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Over 100 integrations across 8+ categories to power your workflows
              </p>
            </div>

            <div className="space-y-8">
              {integrationCategories.map((category) => {
                const CategoryIcon = category.icon
                return (
                  <Card key={category.name} className="border-2 border-gray-200">
                    <CardHeader className={category.bgColor}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-white shadow-md flex items-center justify-center">
                            <CategoryIcon className={`h-6 w-6 ${category.iconColor}`} />
                          </div>
                          <div>
                            <CardTitle>{category.name}</CardTitle>
                            <CardDescription className="text-gray-600">
                              {category.count} integrations available
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {category.integrations.map((integration) => (
                          <div
                            key={integration.name}
                            className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer text-center group"
                          >
                            <div className="text-3xl mb-2">{integration.logo}</div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                              {integration.name}
                            </h4>
                            <p className="text-xs text-gray-600">{integration.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Integration Methods */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Settings className="h-3 w-3 mr-1" />
                Integration Methods
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Connect Your Way
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Multiple ways to integrate - from no-code to full API control
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {integrationMethods.map((method) => {
                const MethodIcon = method.icon
                return (
                  <Card key={method.title} className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
                    <CardHeader className={method.bgColor}>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-white shadow-md flex items-center justify-center">
                          <MethodIcon className={`h-6 w-6 ${method.iconColor}`} />
                        </div>
                        <div>
                          <CardTitle>{method.title}</CardTitle>
                          <CardDescription className="text-gray-700">
                            {method.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-2">
                        {method.features.map((feature) => (
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

        {/* Use Case Examples */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Play className="h-3 w-3 mr-1" />
                Workflow Examples
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                See Integration in Action
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Real-world automation workflows that save time and reduce errors
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {useCaseExamples.map((useCase) => (
                <Card key={useCase.title} className={`border-2 ${useCase.borderColor}`}>
                  <CardHeader className={useCase.bgColor}>
                    <div className="text-4xl mb-3">{useCase.icon}</div>
                    <CardTitle className="text-lg">{useCase.title}</CardTitle>
                    <CardDescription className="text-gray-700">
                      {useCase.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Workflow Steps:</h4>
                    <ol className="space-y-3">
                      {useCase.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600">
                          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Integrate with LexiScan AI?
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Transform how your team works with seamless connections
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit) => {
                const BenefitIcon = benefit.icon
                return (
                  <Card key={benefit.title} className="border-2 border-gray-200 text-center">
                    <CardContent className="pt-6">
                      <div className={`h-14 w-14 rounded-full ${benefit.bgColor} flex items-center justify-center mx-auto mb-4`}>
                        <BenefitIcon className={`h-7 w-7 ${benefit.iconColor}`} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Connect Your Workflow?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Start integrating LexiScan AI with your favorite tools today. 
                Free setup, no credit card required.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="group bg-white hover:bg-gray-100 text-blue-900">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/api">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Code className="mr-2 h-4 w-4" />
                    View API Docs
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Contact Sales
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-blue-200 mt-6">
                100+ integrations • Free developer tier • Enterprise support available
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

