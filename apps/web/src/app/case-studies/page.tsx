import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  FileCheck,
  ArrowRight,
  Award,
  Target,
  Zap,
  Shield,
  Briefcase,
  Scale,
  FileText,
  CheckCircle2,
  Star,
  Download,
  Play,
  BarChart3,
  Percent,
  Timer,
  Sparkles
} from "lucide-react"

export const metadata: Metadata = {
  title: "Case Studies - Client Success Stories | LexiScan AI",
  description: "Discover how leading law firms and legal departments are achieving 70% faster document review, 60% cost reduction, and enhanced accuracy with LexiScan AI.",
  keywords: "legal AI case studies, law firm success stories, document review ROI, legal tech results, client testimonials"
}

const featuredCaseStudy = {
  client: "Morrison & Clarke LLP",
  industry: "Corporate Law",
  size: "250+ attorneys",
  location: "New York, NY",
  logo: "⚖️",
  challenge: "A leading corporate law firm was struggling with document review inefficiencies during large M&A transactions, spending over 3,000 hours per deal on contract analysis.",
  solution: "Implemented LexiScan AI's comprehensive document analysis platform with custom workflows for due diligence, contract review, and risk assessment.",
  results: [
    { metric: "70%", label: "Faster Review Time", icon: Clock },
    { metric: "60%", label: "Cost Reduction", icon: DollarSign },
    { metric: "95%", label: "Accuracy Rate", icon: Target },
    { metric: "40+", label: "Hours Saved/Week", icon: TrendingUp }
  ],
  quote: "LexiScan AI has transformed how we handle due diligence. What used to take weeks now takes days, and our accuracy has never been better. It's been a game-changer for our M&A practice.",
  author: {
    name: "Jennifer Morrison",
    title: "Managing Partner",
    avatar: "👩‍💼"
  },
  tags: ["M&A", "Contract Review", "Due Diligence"],
  downloadUrl: "/case-studies/morrison-clarke.pdf"
}

const caseStudies = [
  {
    client: "Global Tech Corporation",
    industry: "Technology - Corporate Legal",
    size: "15-person legal department",
    location: "San Francisco, CA",
    logo: "🏢",
    challenge: "Managing 10,000+ vendor contracts with inconsistent terms, renewal dates, and compliance requirements spread across multiple systems.",
    solution: "Deployed LexiScan AI for contract lifecycle management, automated clause extraction, and compliance monitoring.",
    keyResults: [
      "Reduced contract review time by 65%",
      "Identified $2.4M in cost savings opportunities",
      "99% on-time renewal management",
      "Zero compliance violations in 12 months"
    ],
    metrics: {
      timeReduction: "65%",
      costSavings: "$2.4M",
      accuracy: "99%"
    },
    quote: "The ROI was evident within the first quarter. We're now able to manage our entire contract portfolio with confidence.",
    author: {
      name: "David Chen",
      title: "General Counsel",
      avatar: "👨‍💼"
    },
    tags: ["Contract Management", "Compliance", "Cost Savings"],
    industry_icon: Building2,
    bgGradient: "from-blue-500 to-cyan-500"
  },
  {
    client: "Henderson & Associates",
    industry: "Litigation & Disputes",
    size: "120 attorneys",
    location: "Chicago, IL",
    logo: "⚖️",
    challenge: "Facing a multi-million dollar class action lawsuit requiring review of 500,000+ documents within tight deadlines.",
    solution: "Leveraged LexiScan AI's advanced e-discovery capabilities with AI-powered relevance ranking and privilege detection.",
    keyResults: [
      "Processed 500K+ documents in 3 weeks",
      "Identified key evidence 80% faster",
      "Reduced e-discovery costs by 55%",
      "Won favorable settlement"
    ],
    metrics: {
      timeReduction: "80%",
      costSavings: "55%",
      accuracy: "98%"
    },
    quote: "LexiScan AI gave us the speed and accuracy we needed to win. The AI found crucial evidence our team might have missed.",
    author: {
      name: "Robert Henderson",
      title: "Senior Partner - Litigation",
      avatar: "👨‍⚖️"
    },
    tags: ["Litigation", "E-Discovery", "Class Action"],
    industry_icon: Scale,
    bgGradient: "from-purple-500 to-pink-500"
  },
  {
    client: "Westfield Insurance Group",
    industry: "Insurance - Legal Compliance",
    size: "30-person legal team",
    location: "Hartford, CT",
    logo: "🛡️",
    challenge: "Struggling to maintain compliance across 50 states with constantly changing insurance regulations and policy documentation.",
    solution: "Implemented LexiScan AI's regulatory compliance suite with automated policy analysis and real-time regulatory tracking.",
    keyResults: [
      "100% regulatory compliance achieved",
      "Policy review time cut by 70%",
      "Reduced compliance staff overhead by 40%",
      "Avoided $3.2M in potential penalties"
    ],
    metrics: {
      timeReduction: "70%",
      costSavings: "$3.2M",
      accuracy: "100%"
    },
    quote: "We now have complete visibility into our compliance status. The peace of mind alone is worth the investment.",
    author: {
      name: "Maria Rodriguez",
      title: "Chief Compliance Officer",
      avatar: "👩‍💼"
    },
    tags: ["Insurance", "Compliance", "Regulatory"],
    industry_icon: Shield,
    bgGradient: "from-green-500 to-emerald-500"
  },
  {
    client: "Venture Partners Legal Group",
    industry: "Venture Capital & Startups",
    size: "45 attorneys",
    location: "Palo Alto, CA",
    logo: "🚀",
    challenge: "Managing rapid due diligence for 50+ startup investments annually while maintaining quality and speed.",
    solution: "Adopted LexiScan AI for startup due diligence, cap table analysis, and investment documentation review.",
    keyResults: [
      "Due diligence time reduced from 2 weeks to 3 days",
      "Evaluated 2x more deals per quarter",
      "Improved investment decision accuracy",
      "Enhanced founder satisfaction scores"
    ],
    metrics: {
      timeReduction: "75%",
      costSavings: "$1.8M",
      accuracy: "97%"
    },
    quote: "In the fast-paced world of VC, speed is everything. LexiScan AI helps us move faster without sacrificing thoroughness.",
    author: {
      name: "Amanda Foster",
      title: "Managing Director",
      avatar: "👩‍💼"
    },
    tags: ["Venture Capital", "Due Diligence", "Startups"],
    industry_icon: Briefcase,
    bgGradient: "from-orange-500 to-red-500"
  },
  {
    client: "Pacific Healthcare Systems",
    industry: "Healthcare - Legal Affairs",
    size: "25-person legal department",
    location: "Seattle, WA",
    logo: "🏥",
    challenge: "Managing complex HIPAA compliance, patient contracts, and vendor agreements across 40+ healthcare facilities.",
    solution: "Deployed LexiScan AI's HIPAA-compliant platform for contract analysis, compliance monitoring, and risk assessment.",
    keyResults: [
      "Zero HIPAA violations in 18 months",
      "Contract review time reduced by 68%",
      "Identified 15+ high-risk vendor clauses",
      "Saved $1.6M in annual legal costs"
    ],
    metrics: {
      timeReduction: "68%",
      costSavings: "$1.6M",
      accuracy: "99.5%"
    },
    quote: "Patient privacy is our top priority. LexiScan AI ensures we stay compliant while operating efficiently.",
    author: {
      name: "Dr. Michael Chang",
      title: "SVP - Legal & Compliance",
      avatar: "👨‍⚖️"
    },
    tags: ["Healthcare", "HIPAA", "Patient Privacy"],
    industry_icon: Shield,
    bgGradient: "from-teal-500 to-cyan-500"
  },
  {
    client: "Sterling Financial Services",
    industry: "Banking & Financial Services",
    size: "180+ legal professionals",
    location: "Boston, MA",
    logo: "💰",
    challenge: "Navigating complex regulatory requirements across multiple jurisdictions while managing thousands of loan documents.",
    solution: "Integrated LexiScan AI for regulatory compliance, loan document review, and risk assessment automation.",
    keyResults: [
      "Reduced loan review time by 72%",
      "100% regulatory compliance maintained",
      "Prevented $4.5M in potential fines",
      "Improved customer turnaround time"
    ],
    metrics: {
      timeReduction: "72%",
      costSavings: "$4.5M",
      accuracy: "99.8%"
    },
    quote: "The financial services industry demands perfection. LexiScan AI delivers that while dramatically improving our efficiency.",
    author: {
      name: "Patricia Williams",
      title: "Chief Legal Officer",
      avatar: "👩‍💼"
    },
    tags: ["Banking", "Financial Services", "Regulatory"],
    industry_icon: DollarSign,
    bgGradient: "from-indigo-500 to-blue-500"
  }
]

const industries = [
  { name: "All Industries", count: 50, icon: Building2 },
  { name: "Law Firms", count: 18, icon: Scale },
  { name: "Corporate Legal", count: 15, icon: Briefcase },
  { name: "Financial Services", count: 8, icon: DollarSign },
  { name: "Healthcare", count: 6, icon: Shield },
  { name: "Technology", count: 7, icon: Zap }
]

const aggregateMetrics = [
  {
    value: "70%",
    label: "Average Time Savings",
    description: "Reduction in document review time",
    icon: Clock,
    color: "blue"
  },
  {
    value: "$18.5M",
    label: "Total Cost Savings",
    description: "Across all client engagements",
    icon: DollarSign,
    color: "green"
  },
  {
    value: "98.5%",
    label: "Average Accuracy",
    description: "AI-powered analysis precision",
    icon: Target,
    color: "purple"
  },
  {
    value: "500+",
    label: "Firms Served",
    description: "Trusted by legal professionals",
    icon: Users,
    color: "orange"
  }
]

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-24 sm:pt-24 sm:pb-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="secondary" className="mb-4">
                <Award className="h-3 w-3 mr-1" />
                Client Success Stories
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                Real Results from{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Real Law Firms
                </span>
              </h1>
              <p className="text-lg leading-8 text-gray-600 mb-8">
                Discover how leading law firms and legal departments are transforming their 
                operations with LexiScan AI. Proven results, measurable impact.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="group">
                    Start Your Success Story
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline">
                    <Play className="mr-2 h-4 w-4" />
                    Watch Demo
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

        {/* Aggregate Metrics */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Proven Impact Across the Industry
              </h2>
              <p className="text-gray-600">
                Measurable results from our client partnerships
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aggregateMetrics.map((metric) => {
                const MetricIcon = metric.icon
                return (
                  <Card key={metric.label} className="border-none shadow-lg hover:shadow-xl transition-shadow text-center">
                    <CardContent className="pt-6">
                      <div className={`h-16 w-16 rounded-full bg-${metric.color}-100 flex items-center justify-center mx-auto mb-4`}>
                        <MetricIcon className={`h-8 w-8 text-${metric.color}-600`} />
                      </div>
                      <div className={`text-4xl font-bold text-${metric.color}-600 mb-2`}>
                        {metric.value}
                      </div>
                      <div className="font-semibold text-gray-900 mb-1">
                        {metric.label}
                      </div>
                      <p className="text-sm text-gray-600">
                        {metric.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Industry Filter */}
        <section className="py-12 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3">
              {industries.map((industry) => {
                const IndustryIcon = industry.icon
                return (
                  <Button
                    key={industry.name}
                    variant={industry.name === "All Industries" ? "default" : "outline"}
                    className="group"
                  >
                    <IndustryIcon className="h-4 w-4 mr-2" />
                    {industry.name}
                    <Badge variant="secondary" className="ml-2">
                      {industry.count}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Featured Case Study */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-2">
                <Star className="h-3 w-3 mr-1" />
                Featured Case Study
              </Badge>
            </div>

            <Card className="border-none shadow-2xl overflow-hidden">
              <div className="grid lg:grid-cols-5 gap-0">
                <div className="lg:col-span-3 p-8 lg:p-12">
                  {/* Client Info */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl flex-shrink-0">
                      {featuredCaseStudy.logo}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {featuredCaseStudy.client}
                      </h2>
                      <p className="text-gray-600 mb-2">{featuredCaseStudy.industry}</p>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {featuredCaseStudy.size}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          {featuredCaseStudy.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Challenge */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-red-600" />
                      The Challenge
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {featuredCaseStudy.challenge}
                    </p>
                  </div>

                  {/* Solution */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-blue-600" />
                      The Solution
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {featuredCaseStudy.solution}
                    </p>
                  </div>

                  {/* Quote */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                    <div className="text-4xl text-blue-600 mb-2">"</div>
                    <p className="text-gray-900 italic mb-4 text-lg leading-relaxed">
                      {featuredCaseStudy.quote}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
                        {featuredCaseStudy.author.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {featuredCaseStudy.author.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {featuredCaseStudy.author.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredCaseStudy.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Download */}
                  <Button variant="outline" className="group">
                    <Download className="mr-2 h-4 w-4" />
                    Download Full Case Study
                  </Button>
                </div>

                {/* Results Sidebar */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-purple-700 p-8 lg:p-12 text-white">
                  <h3 className="text-2xl font-bold mb-8 flex items-center">
                    <TrendingUp className="h-6 w-6 mr-2" />
                    Key Results
                  </h3>
                  <div className="space-y-8">
                    {featuredCaseStudy.results.map((result) => {
                      const ResultIcon = result.icon
                      return (
                        <div key={result.label}>
                          <div className="flex items-center gap-3 mb-2">
                            <ResultIcon className="h-5 w-5" />
                            <span className="text-sm font-medium opacity-90">
                              {result.label}
                            </span>
                          </div>
                          <div className="text-5xl font-bold">
                            {result.metric}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Separator className="my-8 bg-white/20" />

                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <h4 className="font-bold mb-4 flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Implementation Highlights
                    </h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>2-week implementation timeline</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Seamless integration with existing systems</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Comprehensive team training provided</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Ongoing support and optimization</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Additional Case Studies */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                More Success Stories
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                See how organizations across industries are achieving exceptional results
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {caseStudies.map((study) => {
                const IndustryIcon = study.industry_icon
                return (
                  <Card key={study.client} className="border-none shadow-lg hover:shadow-xl transition-shadow group cursor-pointer">
                    <div className={`relative h-32 bg-gradient-to-br ${study.bgGradient} flex items-center justify-center`}>
                      <div className="text-6xl">{study.logo}</div>
                      <Badge className="absolute top-3 right-3 bg-white/90 text-gray-900 border-none">
                        <IndustryIcon className="h-3 w-3 mr-1" />
                        {study.industry.split(' - ')[0]}
                      </Badge>
                    </div>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {study.client}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {study.industry} • {study.size}
                      </p>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Challenge:</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {study.challenge}
                        </p>
                      </div>

                      <Separator className="my-4" />

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Key Metrics:
                        </h4>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">
                              {study.metrics.timeReduction}
                            </div>
                            <div className="text-xs text-gray-600">Time Saved</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-green-600">
                              {study.metrics.costSavings}
                            </div>
                            <div className="text-xs text-gray-600">Savings</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-purple-600">
                              {study.metrics.accuracy}
                            </div>
                            <div className="text-xs text-gray-600">Accuracy</div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Results:</h4>
                        <ul className="space-y-1">
                          {study.keyResults.slice(0, 3).map((result, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start">
                              <CheckCircle2 className="h-3 w-3 mr-1 mt-0.5 text-green-600 flex-shrink-0" />
                              <span>{result}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator className="my-4" />

                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-gray-900 italic line-clamp-3">
                          "{study.quote}"
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs">
                            {study.author.avatar}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900">
                              {study.author.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {study.author.title}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {study.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <Button variant="outline" size="sm" className="w-full group">
                        Read Full Story
                        <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                View All Case Studies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <BarChart3 className="h-3 w-3 mr-1" />
                By The Numbers
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Impact Across the Legal Industry
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real data from real implementations showing measurable business impact
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="border-2 border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-blue-600" />
                    Time Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Document Review</span>
                        <span className="text-sm font-bold text-blue-600">70% faster</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: "70%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Due Diligence</span>
                        <span className="text-sm font-bold text-purple-600">75% faster</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: "75%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Contract Analysis</span>
                        <span className="text-sm font-bold text-green-600">65% faster</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 rounded-full" style={{ width: "65%" }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Cost Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Operational Costs</span>
                        <span className="text-sm font-bold text-green-600">60% reduction</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 rounded-full" style={{ width: "60%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">E-Discovery</span>
                        <span className="text-sm font-bold text-blue-600">55% reduction</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: "55%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Compliance Overhead</span>
                        <span className="text-sm font-bold text-purple-600">40% reduction</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: "40%" }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                Ready to Write Your Success Story?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join 500+ law firms and legal departments already transforming their operations 
                with LexiScan AI. See results in weeks, not months.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="group bg-white hover:bg-gray-100">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Schedule Demo
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Contact Sales
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-blue-200 mt-6">
                14-day free trial • No credit card required • ROI guarantee
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

