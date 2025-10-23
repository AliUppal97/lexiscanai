import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  HelpCircle,
  BookOpen,
  Video,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Zap,
  Shield,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Search,
  Download,
  Sparkles,
  PlayCircle,
  Calendar,
  Headphones,
  Globe,
  Lock
} from "lucide-react"

export const metadata: Metadata = {
  title: "Help Center - Support & Resources | LexiScan AI",
  description: "Get help with LexiScan AI. Access guides, tutorials, FAQs, and 24/7 support for legal professionals. Enterprise support available.",
  keywords: "help center, support, legal AI help, documentation, tutorials, customer support, FAQs"
}

const quickLinks = [
  {
    title: "Getting Started",
    description: "New to LexiScan? Start here with our quick start guide",
    icon: Sparkles,
    href: "#getting-started",
    color: "bg-blue-500"
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step video guides and walkthroughs",
    icon: PlayCircle,
    href: "#tutorials",
    color: "bg-purple-500"
  },
  {
    title: "Documentation",
    description: "Comprehensive guides and API documentation",
    icon: BookOpen,
    href: "#documentation",
    color: "bg-green-500"
  },
  {
    title: "Contact Support",
    description: "Get help from our expert support team 24/7",
    icon: Headphones,
    href: "#support",
    color: "bg-orange-500"
  }
]

const popularTopics = [
  {
    category: "Getting Started",
    icon: Sparkles,
    topics: [
      { title: "How to upload your first document", href: "#" },
      { title: "Understanding AI analysis results", href: "#" },
      { title: "Setting up your law firm account", href: "#" },
      { title: "Inviting team members", href: "#" }
    ]
  },
  {
    category: "Features & Tools",
    icon: Zap,
    topics: [
      { title: "Contract analysis and risk detection", href: "#" },
      { title: "Clause extraction and comparison", href: "#" },
      { title: "Custom templates for legal documents", href: "#" },
      { title: "Batch processing multiple documents", href: "#" }
    ]
  },
  {
    category: "Security & Compliance",
    icon: Shield,
    topics: [
      { title: "Data encryption and privacy", href: "#" },
      { title: "GDPR and compliance certifications", href: "#" },
      { title: "Access controls and permissions", href: "#" },
      { title: "Audit logs and compliance reporting", href: "#" }
    ]
  },
  {
    category: "Billing & Plans",
    icon: FileText,
    topics: [
      { title: "Understanding pricing plans", href: "#" },
      { title: "Upgrading to enterprise", href: "#" },
      { title: "Managing subscriptions", href: "#" },
      { title: "Invoice and payment methods", href: "#" }
    ]
  }
]

const faqs = [
  {
    question: "How does LexiScan AI protect attorney-client privilege?",
    answer: "LexiScan AI is built with legal confidentiality as our top priority. All data is encrypted end-to-end with bank-level 256-bit AES encryption. We operate on a zero-knowledge architecture, meaning your documents are never used to train our AI models. We're SOC 2 Type II certified and maintain strict access controls. Your data remains exclusively yours, and we never share it with third parties."
  },
  {
    question: "Can I use LexiScan AI for confidential client documents?",
    answer: "Yes, absolutely. LexiScan AI is designed specifically for law firms handling sensitive client information. We maintain compliance with GDPR, HIPAA, and other regulatory standards. Our infrastructure includes secure data centers, complete audit trails, and chain of custody tracking. Many top law firms trust us with their most confidential matters."
  },
  {
    question: "How accurate is the AI analysis?",
    answer: "Our AI achieves 99.8% accuracy in document analysis, trained on millions of legal documents. However, LexiScan AI is designed to augment, not replace, attorney expertise. Our system highlights potential issues, extracts key clauses, and provides insights, but final legal judgment should always come from qualified attorneys. We provide confidence scores with all AI-generated insights."
  },
  {
    question: "What file formats are supported?",
    answer: "LexiScan AI supports all major document formats including PDF, DOCX, DOC, TXT, RTF, and scanned documents (with OCR). We can process both digital documents and scanned paper documents. For best results, we recommend uploading searchable PDFs or Word documents. Our OCR technology can handle handwritten notes and poor-quality scans."
  },
  {
    question: "How long does document analysis take?",
    answer: "Most documents are analyzed within 30-60 seconds. Complex contracts or large documents (100+ pages) may take 2-5 minutes. Enterprise customers with high-volume needs can access our batch processing features that handle hundreds of documents simultaneously. Real-time progress tracking is available in your dashboard."
  },
  {
    question: "Can I integrate LexiScan AI with my existing tools?",
    answer: "Yes! We offer comprehensive API access and pre-built integrations with popular legal tech tools including document management systems (iManage, NetDocuments), case management software (Clio, MyCase), and Microsoft Office 365. Our enterprise plans include custom integration support and dedicated technical assistance."
  },
  {
    question: "What kind of support do you offer?",
    answer: "We provide 24/7 email support for all customers. Professional and Enterprise plans include priority phone and chat support with guaranteed response times. Enterprise customers also receive a dedicated account manager, custom onboarding, and direct access to our legal tech specialists. We also offer comprehensive documentation, video tutorials, and webinar training sessions."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! We offer a 14-day free trial with full access to all features (no credit card required). During the trial, you can analyze up to 50 documents and explore all platform capabilities. If you need more time or volume for evaluation, contact our sales team for an extended trial tailored to your firm's needs."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time with no cancellation fees. Your access will continue until the end of your current billing period. Before cancellation, you'll have the option to export all your data and analysis results. We also offer the ability to pause your subscription if you need temporary access reduction."
  },
  {
    question: "How do I export my data?",
    answer: "You can export your documents and analysis results at any time in multiple formats (PDF, JSON, CSV, DOCX). Bulk export tools are available for downloading all your data. Enterprise customers have access to automated backup solutions and direct database access for compliance archiving. All exports maintain full audit trail information."
  }
]

const supportChannels = [
  {
    name: "Email Support",
    description: "Get detailed help via email",
    icon: Mail,
    contact: "support@lexiscan.ai",
    availability: "24/7",
    responseTime: "< 4 hours",
    color: "blue"
  },
  {
    name: "Live Chat",
    description: "Instant answers from our team",
    icon: MessageCircle,
    contact: "chat.lexiscan.ai",
    availability: "24/7",
    responseTime: "< 5 minutes",
    color: "green"
  },
  {
    name: "Phone Support",
    description: "Speak with our experts directly",
    icon: Phone,
    contact: "+1 (855) LEXISCAN",
    availability: "Mon-Fri 8AM-8PM ET",
    responseTime: "Immediate",
    color: "purple"
  },
  {
    name: "Schedule Consultation",
    description: "Book a personalized session",
    icon: Calendar,
    contact: "Book online",
    availability: "Flexible",
    responseTime: "Same day",
    color: "orange"
  }
]

const resources = [
  {
    title: "Quick Start Guide",
    description: "Get up and running in 5 minutes",
    icon: Zap,
    type: "Guide",
    duration: "5 min read"
  },
  {
    title: "Video Training Series",
    description: "Complete video walkthrough of all features",
    icon: Video,
    type: "Video",
    duration: "45 min"
  },
  {
    title: "API Documentation",
    description: "Technical documentation for developers",
    icon: FileText,
    type: "Docs",
    duration: "Reference"
  },
  {
    title: "Security Whitepaper",
    description: "Detailed security and compliance information",
    icon: Shield,
    type: "PDF",
    duration: "20 min read"
  },
  {
    title: "Best Practices Guide",
    description: "Optimize your workflow with expert tips",
    icon: BookOpen,
    type: "Guide",
    duration: "15 min read"
  },
  {
    title: "Integration Guide",
    description: "Connect with your existing tools",
    icon: Globe,
    type: "Guide",
    duration: "10 min read"
  }
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-24 sm:pt-24 sm:pb-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="secondary" className="mb-4">
                <HelpCircle className="h-3 w-3 mr-1" />
                24/7 Support Available
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                How can we{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  help you?
                </span>
              </h1>
              <p className="text-lg leading-8 text-gray-600 mb-8">
                Find answers, tutorials, and resources to get the most out of LexiScan AI. 
                Our support team is here to help you succeed.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search for help articles, guides, tutorials..."
                    className="pl-12 pr-4 py-6 text-base border-gray-300 rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Popular searches: upload document, API access, pricing, security, integrations
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickLinks.map((link) => {
                const LinkIcon = link.icon
                return (
                  <Link key={link.title} href={link.href}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500 cursor-pointer group">
                      <CardContent className="pt-6">
                        <div className={`h-12 w-12 rounded-lg ${link.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <LinkIcon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-blue-600 transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {link.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Popular Topics */}
        <section id="getting-started" className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <BookOpen className="h-3 w-3 mr-1" />
                Popular Topics
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Browse by Category
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find the answers you need organized by topic
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {popularTopics.map((category) => {
                const CategoryIcon = category.icon
                return (
                  <Card key={category.category} className="border-none shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <CategoryIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-xl">{category.category}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {category.topics.map((topic) => (
                          <li key={topic.title}>
                            <Link
                              href={topic.href}
                              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors group"
                            >
                              <ArrowRight className="h-4 w-4 mr-2 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                              {topic.title}
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

        {/* FAQs */}
        <section id="faqs" className="py-24 bg-white">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <HelpCircle className="h-3 w-3 mr-1" />
                Frequently Asked Questions
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Common Questions Answered
              </h2>
              <p className="text-lg text-gray-600">
                Quick answers to the most common questions about LexiScan AI
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
                  <AccordionTrigger className="text-left hover:text-blue-600 transition-colors py-6">
                    <span className="font-semibold text-lg pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Resources */}
        <section id="documentation" className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Download className="h-3 w-3 mr-1" />
                Resources & Guides
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Documentation & Training Materials
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Comprehensive guides, tutorials, and technical documentation
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => {
                const ResourceIcon = resource.icon
                return (
                  <Card key={resource.title} className="border-none shadow-lg hover:shadow-xl transition-shadow group cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ResourceIcon className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {resource.type}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {resource.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {resource.duration}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Support Channels */}
        <section id="support" className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Headphones className="h-3 w-3 mr-1" />
                Contact Support
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Get Expert Help When You Need It
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our support team is available 24/7 to help you with any questions or issues
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {supportChannels.map((channel) => {
                const ChannelIcon = channel.icon
                return (
                  <Card key={channel.name} className="border-2 hover:border-blue-500 transition-colors">
                    <CardContent className="pt-6 text-center">
                      <div className="flex justify-center mb-4">
                        <div className={`h-14 w-14 rounded-full bg-${channel.color}-100 flex items-center justify-center`}>
                          <ChannelIcon className={`h-7 w-7 text-${channel.color}-600`} />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        {channel.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {channel.description}
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Contact:</span>
                          <p className="text-blue-600">{channel.contact}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          <p>{channel.availability}</p>
                          <p className="font-medium text-green-600">{channel.responseTime} response</p>
                        </div>
                      </div>
                      <Button className="w-full" variant="outline">
                        Get Help
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Enterprise Support CTA */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none">
              <CardContent className="pt-8 pb-8">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Need Enterprise Support?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get priority support, dedicated account management, custom SLAs, and direct access 
                    to our legal tech specialists.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link href="/contact">
                      <Button size="lg" className="group">
                        Contact Enterprise Sales
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button size="lg" variant="outline">
                        View Enterprise Plans
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Video Tutorials */}
        <section id="tutorials" className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Video className="h-3 w-3 mr-1" />
                Video Tutorials
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Learn by Watching
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Step-by-step video guides to help you master LexiScan AI
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Getting Started with LexiScan AI", duration: "5:30", views: "12K" },
                { title: "Advanced Contract Analysis", duration: "8:45", views: "8.5K" },
                { title: "Team Collaboration Features", duration: "6:20", views: "6.2K" },
                { title: "API Integration Tutorial", duration: "12:15", views: "5.1K" },
                { title: "Security & Compliance Overview", duration: "7:40", views: "9.3K" },
                { title: "Batch Processing Documents", duration: "4:50", views: "7.8K" }
              ].map((video) => (
                <Card key={video.title} className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors rounded-t-lg" />
                    <div className="relative z-10">
                      <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PlayCircle className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <Badge className="absolute top-3 right-3 bg-black/70 text-white border-none">
                      {video.duration}
                    </Badge>
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {video.views} views
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Still Have Questions?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Our support team is ready to help you. Get in touch and we'll respond right away.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/contact">
                  <Button size="lg" variant="secondary" className="group bg-white hover:bg-gray-100">
                    Contact Support Team
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 bg-white/5">
                    Schedule a Demo
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-blue-200 mt-6">
                <CheckCircle className="inline h-4 w-4 mr-1" />
                Average response time: 4 hours • 24/7 support • 99.8% satisfaction rating
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}


