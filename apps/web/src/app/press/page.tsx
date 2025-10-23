import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Newspaper,
  Award,
  TrendingUp,
  Calendar,
  Download,
  ExternalLink,
  Mail,
  Quote,
  Image as ImageIcon,
  FileText,
  Video,
  ArrowRight,
  Sparkles,
  Trophy,
  Users,
  DollarSign,
  Building2,
  Rocket,
  CheckCircle,
  Globe,
  Megaphone
} from "lucide-react"

export const metadata: Metadata = {
  title: "Press & Media - Latest News | LexiScan AI",
  description: "Latest press releases, media coverage, and company news from LexiScan AI. Download media kit, logos, and connect with our press team.",
  keywords: "press releases, media coverage, legal tech news, AI news, company announcements, media kit"
}

const featuredPress = [
  {
    title: "LexiScan AI Secures $50M Series A to Transform Legal Document Analysis",
    outlet: "TechCrunch",
    date: "October 15, 2024",
    category: "Funding",
    excerpt: "LexiScan AI, the leading AI-powered legal document analysis platform, announced today a $50 million Series A funding round led by Sequoia Capital and Andreessen Horowitz.",
    image: "📰",
    link: "#"
  },
  {
    title: "How AI is Revolutionizing Legal Document Review for Top Law Firms",
    outlet: "Forbes",
    date: "September 28, 2024",
    category: "Industry Analysis",
    excerpt: "Leading law firms are turning to AI-powered tools like LexiScan to reduce document review time by 70% while improving accuracy.",
    image: "💼",
    link: "#"
  },
  {
    title: "LexiScan AI Achieves SOC 2 Type II Certification",
    outlet: "Business Wire",
    date: "August 12, 2024",
    category: "Security",
    excerpt: "The company's commitment to enterprise-grade security reaches new milestone with independent third-party audit completion.",
    image: "🔒",
    link: "#"
  }
]

const pressReleases = [
  {
    title: "LexiScan AI Announces Partnership with Major Law Firm Association",
    date: "November 5, 2024",
    category: "Partnership",
    excerpt: "Strategic partnership will bring AI-powered document analysis to thousands of law firms nationwide, democratizing access to advanced legal technology.",
    readTime: "3 min read"
  },
  {
    title: "Company Surpasses 500 Law Firm Clients Milestone",
    date: "October 22, 2024",
    category: "Milestone",
    excerpt: "LexiScan AI celebrates serving over 500 law firms globally, with 98% customer satisfaction and 99.8% analysis accuracy rate.",
    readTime: "2 min read"
  },
  {
    title: "LexiScan AI Launches Advanced Contract Risk Detection",
    date: "September 18, 2024",
    category: "Product Launch",
    excerpt: "New AI-powered feature identifies potential risks and liabilities in contracts with unprecedented accuracy, helping legal teams work smarter.",
    readTime: "4 min read"
  },
  {
    title: "Series A Funding Announcement: $50M to Scale Legal AI Platform",
    date: "August 30, 2024",
    category: "Funding",
    excerpt: "Investment from leading VCs will accelerate product development, expand team, and bring AI-powered legal tools to more professionals worldwide.",
    readTime: "5 min read"
  },
  {
    title: "SOC 2 Type II Certification Achieved",
    date: "August 12, 2024",
    category: "Security",
    excerpt: "Independent audit confirms LexiScan AI meets highest standards for security, availability, and confidentiality of client data.",
    readTime: "3 min read"
  },
  {
    title: "LexiScan AI Expands to European Market",
    date: "July 8, 2024",
    category: "Expansion",
    excerpt: "Company opens Dublin office to serve European law firms, ensuring GDPR compliance and local data residency options.",
    readTime: "3 min read"
  }
]

const mediaCoverage = [
  {
    outlet: "Wall Street Journal",
    title: "Legal Tech Startups Attract Record Venture Capital",
    date: "October 2024",
    type: "Article",
    link: "#"
  },
  {
    outlet: "Bloomberg Law",
    title: "AI in Legal: Separating Hype from Reality",
    date: "September 2024",
    type: "Feature",
    link: "#"
  },
  {
    outlet: "The American Lawyer",
    title: "Top Legal Tech Tools of 2024",
    date: "September 2024",
    type: "List",
    link: "#"
  },
  {
    outlet: "VentureBeat",
    title: "How LexiScan AI Uses NLP to Understand Legal Documents",
    date: "August 2024",
    type: "Technical Deep Dive",
    link: "#"
  },
  {
    outlet: "Legal Tech News",
    title: "Interview: LexiScan AI CEO on the Future of Legal AI",
    date: "July 2024",
    type: "Interview",
    link: "#"
  },
  {
    outlet: "Law.com",
    title: "BigLaw Embraces AI for Document Review",
    date: "June 2024",
    type: "Industry Report",
    link: "#"
  }
]

const awards = [
  {
    title: "Best Legal Tech Innovation",
    organization: "Legal Tech Awards 2024",
    year: "2024",
    icon: Trophy
  },
  {
    title: "Top 50 AI Startups to Watch",
    organization: "Forbes",
    year: "2024",
    icon: Award
  },
  {
    title: "Innovation in Legal Services",
    organization: "American Bar Association",
    year: "2024",
    icon: Sparkles
  },
  {
    title: "Best SaaS Product - Legal Category",
    organization: "SaaS Awards",
    year: "2023",
    icon: Trophy
  }
]

const mediaKit = [
  {
    title: "Company Logo Pack",
    description: "High-res logos in PNG, SVG, and EPS formats",
    icon: ImageIcon,
    size: "2.5 MB"
  },
  {
    title: "Brand Guidelines",
    description: "Complete brand identity and usage guidelines",
    icon: FileText,
    size: "1.8 MB"
  },
  {
    title: "Product Screenshots",
    description: "High-quality screenshots of platform interface",
    icon: ImageIcon,
    size: "8.4 MB"
  },
  {
    title: "Executive Headshots",
    description: "Professional photos of leadership team",
    icon: Users,
    size: "3.2 MB"
  },
  {
    title: "Company Fact Sheet",
    description: "Key facts, figures, and company overview",
    icon: FileText,
    size: "450 KB"
  },
  {
    title: "Video Assets",
    description: "Product demos and company videos",
    icon: Video,
    size: "125 MB"
  }
]

const executiveQuotes = [
  {
    quote: "LexiScan AI is democratizing access to sophisticated legal AI technology. What was once available only to the largest law firms is now accessible to legal professionals of all sizes.",
    author: "Sarah Mitchell",
    title: "CEO & Co-Founder",
    context: "On Series A Funding"
  },
  {
    quote: "Our AI doesn't replace lawyers—it empowers them. We're giving legal professionals superpowers to work faster, smarter, and more accurately than ever before.",
    author: "Dr. James Chen",
    title: "CTO & Co-Founder",
    context: "On Product Philosophy"
  },
  {
    quote: "Security and confidentiality are non-negotiable in legal technology. Every decision we make prioritizes the protection of our clients' most sensitive information.",
    author: "Michael Rodriguez",
    title: "Chief Security Officer",
    context: "On SOC 2 Certification"
  }
]

const companyStats = [
  { label: "Law Firms Served", value: "500+", icon: Building2 },
  { label: "Documents Analyzed", value: "10M+", icon: FileText },
  { label: "Analysis Accuracy", value: "99.8%", icon: CheckCircle },
  { label: "Countries", value: "12", icon: Globe },
]

export default function PressPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-24 sm:pt-24 sm:pb-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="secondary" className="mb-4">
                <Newspaper className="h-3 w-3 mr-1" />
                Press & Media Center
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                Latest News &{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Media Coverage
                </span>
              </h1>
              <p className="text-lg leading-8 text-gray-600 mb-8">
                Stay updated with the latest announcements, press releases, and media coverage 
                about LexiScan AI's mission to transform legal document analysis.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="#press-releases">
                  <Button size="lg" className="group">
                    View Press Releases
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#media-kit">
                  <Button size="lg" variant="outline">
                    Download Media Kit
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

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {companyStats.map((stat) => {
                const StatIcon = stat.icon
                return (
                  <Card key={stat.label} className="text-center border-none shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-3">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <StatIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Featured Press */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Megaphone className="h-3 w-3 mr-1" />
                Featured Coverage
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                In the News
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Recent media coverage highlighting our impact on the legal industry
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredPress.map((item) => (
                <Card key={item.title} className="border-none shadow-lg hover:shadow-xl transition-shadow group">
                  <CardContent className="pt-6">
                    <div className="text-6xl mb-4">{item.image}</div>
                    <Badge variant="secondary" className="mb-3">
                      {item.category}
                    </Badge>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span className="font-medium">{item.outlet}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {item.excerpt}
                    </p>
                    <Link href={item.link}>
                      <Button variant="outline" size="sm" className="w-full group/btn">
                        Read Article
                        <ExternalLink className="ml-2 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Press Releases */}
        <section id="press-releases" className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <FileText className="h-3 w-3 mr-1" />
                Press Releases
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Official Announcements
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Latest company news, product launches, and major milestones
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {pressReleases.map((release) => (
                <Card key={release.title} className="border-2 hover:border-blue-500 transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {release.category}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {release.date}
                          </span>
                          <span className="text-sm text-gray-500">
                            {release.readTime}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                          {release.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {release.excerpt}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                View All Press Releases
              </Button>
            </div>
          </div>
        </section>

        {/* Media Coverage */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Newspaper className="h-3 w-3 mr-1" />
                Media Coverage
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured In
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                What leading media outlets are saying about LexiScan AI
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaCoverage.map((coverage) => (
                <Card key={coverage.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {coverage.type}
                      </Badge>
                      <span className="text-xs text-gray-500">{coverage.date}</span>
                    </div>
                    <h3 className="font-bold text-blue-600 mb-2 text-lg">
                      {coverage.outlet}
                    </h3>
                    <p className="text-gray-900 mb-3 line-clamp-2">
                      {coverage.title}
                    </p>
                    <Link href={coverage.link}>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        Read Article
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Awards & Recognition */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Award className="h-3 w-3 mr-1" />
                Awards & Recognition
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Industry Recognition
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Honored to be recognized by leading organizations and publications
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {awards.map((award) => {
                const AwardIcon = award.icon
                return (
                  <Card key={award.title} className="border-none shadow-lg text-center">
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                          <AwardIcon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        {award.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {award.organization}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {award.year}
                      </Badge>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Executive Quotes */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Quote className="h-3 w-3 mr-1" />
                Leadership Insights
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                From Our Executives
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Thoughts and perspectives from our leadership team
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {executiveQuotes.map((item) => (
                <Card key={item.author} className="border-l-4 border-l-blue-600">
                  <CardContent className="pt-6">
                    <Quote className="h-8 w-8 text-blue-600 mb-4 opacity-50" />
                    <p className="text-gray-700 italic mb-4">
                      "{item.quote}"
                    </p>
                    <div className="border-t pt-4">
                      <p className="font-bold text-gray-900">{item.author}</p>
                      <p className="text-sm text-gray-600 mb-1">{item.title}</p>
                      <Badge variant="secondary" className="text-xs">
                        {item.context}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Media Kit */}
        <section id="media-kit" className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Download className="h-3 w-3 mr-1" />
                Media Resources
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Download Media Kit
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                High-quality assets for media coverage, including logos, screenshots, and brand guidelines
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaKit.map((item) => {
                const ItemIcon = item.icon
                return (
                  <Card key={item.title} className="border-2 hover:border-blue-500 transition-colors cursor-pointer group">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                          <ItemIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.description}
                          </p>
                          <span className="text-xs text-gray-500">{item.size}</span>
                        </div>
                        <Download className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" className="group">
                <Download className="mr-2 h-4 w-4" />
                Download Complete Media Kit
                <span className="ml-2 text-sm">(25 MB)</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Press Contact */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none shadow-xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Media Inquiries
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    For press inquiries, interview requests, or additional information, 
                    please contact our media relations team.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Press Contact</p>
                      <a href="mailto:press@lexiscan.ai" className="text-blue-600 hover:text-blue-700 font-medium">
                        press@lexiscan.ai
                      </a>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Media Phone</p>
                      <a href="tel:+18551394722" className="text-blue-600 hover:text-blue-700 font-medium">
                        +1 (855) LEXISCAN
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link href="mailto:press@lexiscan.ai">
                      <Button size="lg" className="group">
                        Contact Press Team
                        <Mail className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="#media-kit">
                      <Button size="lg" variant="outline">
                        Download Media Kit
                      </Button>
                    </Link>
                  </div>

                  <p className="text-sm text-gray-500 mt-6">
                    Response time: Within 24 hours for all media inquiries
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Stay Updated
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Subscribe to receive our latest press releases and company news directly in your inbox.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 min-w-[200px] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Button size="lg" variant="secondary" className="bg-white hover:bg-gray-100">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-blue-200 mt-4">
                <CheckCircle className="inline h-4 w-4 mr-1" />
                Join 5,000+ subscribers • Unsubscribe anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

