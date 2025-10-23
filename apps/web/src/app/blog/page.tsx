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
  Calendar,
  Clock,
  User,
  ArrowRight,
  Search,
  TrendingUp,
  Sparkles,
  Shield,
  Zap,
  Users,
  FileText,
  Scale,
  Rocket,
  Brain,
  Code,
  Award,
  Lightbulb,
  Target,
  Tag
} from "lucide-react"

export const metadata: Metadata = {
  title: "Blog - Legal AI Insights & Updates | LexiScan AI",
  description: "Expert insights on legal AI, document analysis, industry trends, and best practices for law firms. Stay updated with the latest in legal technology.",
  keywords: "legal tech blog, AI insights, law firm technology, legal AI trends, document analysis, industry news"
}

const featuredPost = {
  title: "The Future of Legal Document Analysis: How AI is Transforming Law Firms",
  excerpt: "Explore how artificial intelligence is revolutionizing legal document review, reducing costs by 70%, and enabling attorneys to focus on high-value work. Learn from real case studies and industry experts.",
  author: {
    name: "Dr. James Chen",
    role: "CTO & Co-Founder",
    avatar: "👨‍💼"
  },
  date: "November 12, 2024",
  readTime: "8 min read",
  category: "AI & Technology",
  image: "🤖",
  tags: ["AI", "Legal Tech", "Innovation"]
}

const recentPosts = [
  {
    title: "5 Ways AI is Reducing Legal Review Time by 70%",
    excerpt: "Discover the specific AI techniques that are helping law firms complete document reviews faster than ever before.",
    author: {
      name: "Sarah Mitchell",
      role: "CEO & Co-Founder",
      avatar: "👩‍💼"
    },
    date: "November 8, 2024",
    readTime: "6 min read",
    category: "Best Practices",
    image: "⚡",
    tags: ["Productivity", "AI"]
  },
  {
    title: "Understanding SOC 2 Compliance for Legal Technology",
    excerpt: "A comprehensive guide to security certifications and why they matter for law firms choosing legal tech solutions.",
    author: {
      name: "Michael Rodriguez",
      role: "Chief Security Officer",
      avatar: "🔒"
    },
    date: "November 5, 2024",
    readTime: "10 min read",
    category: "Security & Compliance",
    image: "🛡️",
    tags: ["Security", "Compliance"]
  },
  {
    title: "Contract Analysis: Best Practices for Law Firms",
    excerpt: "Learn proven strategies for efficient contract review, risk identification, and clause extraction using modern tools.",
    author: {
      name: "Emily Thompson",
      role: "Chief Legal Officer",
      avatar: "⚖️"
    },
    date: "November 1, 2024",
    readTime: "7 min read",
    category: "Legal Practice",
    image: "📄",
    tags: ["Contracts", "Best Practices"]
  },
  {
    title: "The ROI of Legal AI: Real Numbers from 500+ Law Firms",
    excerpt: "Data-driven analysis of how AI adoption impacts law firm profitability, efficiency, and client satisfaction.",
    author: {
      name: "Sarah Mitchell",
      role: "CEO & Co-Founder",
      avatar: "👩‍💼"
    },
    date: "October 28, 2024",
    readTime: "9 min read",
    category: "Industry Analysis",
    image: "📊",
    tags: ["ROI", "Case Studies"]
  },
  {
    title: "API Integration Guide: Connecting LexiScan to Your Workflow",
    excerpt: "Step-by-step technical guide for integrating AI-powered document analysis into your existing legal tech stack.",
    author: {
      name: "Dr. James Chen",
      role: "CTO & Co-Founder",
      avatar: "👨‍💼"
    },
    date: "October 25, 2024",
    readTime: "12 min read",
    category: "Technical Guides",
    image: "💻",
    tags: ["API", "Integration"]
  },
  {
    title: "GDPR and Legal AI: What European Law Firms Need to Know",
    excerpt: "Navigate data protection regulations when using AI tools for legal document analysis in the EU.",
    author: {
      name: "Michael Rodriguez",
      role: "Chief Security Officer",
      avatar: "🔒"
    },
    date: "October 22, 2024",
    readTime: "11 min read",
    category: "Security & Compliance",
    image: "🌍",
    tags: ["GDPR", "Privacy"]
  }
]

const categories = [
  { name: "All Posts", count: 48, icon: BookOpen },
  { name: "AI & Technology", count: 12, icon: Brain },
  { name: "Best Practices", count: 15, icon: Target },
  { name: "Security & Compliance", count: 8, icon: Shield },
  { name: "Legal Practice", count: 10, icon: Scale },
  { name: "Industry Analysis", count: 7, icon: TrendingUp },
  { name: "Technical Guides", count: 6, icon: Code }
]

const popularTags = [
  "AI", "Legal Tech", "Document Analysis", "Contracts", "Compliance",
  "Security", "ROI", "Best Practices", "Integration", "GDPR",
  "Productivity", "Case Studies", "Innovation", "API"
]

const trendingTopics = [
  {
    title: "AI in Legal Practice",
    posts: 24,
    icon: Brain,
    color: "blue"
  },
  {
    title: "Contract Review Automation",
    posts: 18,
    icon: FileText,
    color: "purple"
  },
  {
    title: "Legal Tech Security",
    posts: 15,
    icon: Shield,
    color: "green"
  },
  {
    title: "Law Firm Efficiency",
    posts: 21,
    icon: Zap,
    color: "orange"
  }
]

export default function BlogPage() {
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
                Legal AI Insights
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                The LexiScan{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Blog
                </span>
              </h1>
              <p className="text-lg leading-8 text-gray-600 mb-8">
                Expert insights on legal AI, industry trends, best practices, and the future of 
                legal technology. Written by industry leaders and practitioners.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search articles..."
                    className="pl-12 pr-4 py-6 text-base border-gray-300 rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Popular: AI in Legal, Contract Analysis, Security, Best Practices
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
            <div className="relative aspect-[1155/678] w-[36.125rem] bg-gradient-to-tr from-blue-200 to-purple-200 opacity-30" />
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured Article
              </Badge>
            </div>

            <Card className="border-none shadow-2xl hover:shadow-3xl transition-shadow overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-9xl">{featuredPost.image}</div>
                </div>
                <CardContent className="pt-8 pb-8 flex flex-col justify-center">
                  <Badge variant="secondary" className="w-fit mb-4">
                    {featuredPost.category}
                  </Badge>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors cursor-pointer">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
                        {featuredPost.author.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{featuredPost.author.name}</p>
                        <p className="text-sm text-gray-600">{featuredPost.author.role}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {featuredPost.date}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredPost.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-fit group">
                    Read Full Article
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Browse by Category
              </h2>
              <p className="text-gray-600">
                Find articles that match your interests
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => {
                const CategoryIcon = category.icon
                return (
                  <Button
                    key={category.name}
                    variant={category.name === "All Posts" ? "default" : "outline"}
                    className="group"
                  >
                    <CategoryIcon className="h-4 w-4 mr-2" />
                    {category.name}
                    <Badge variant="secondary" className="ml-2">
                      {category.count}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Recent Posts */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Recent Articles
              </h2>
              <p className="text-lg text-gray-600">
                Latest insights from our team of experts
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <Card key={post.title} className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-6xl">{post.image}</div>
                    <Badge className="absolute top-3 right-3 bg-white/90 text-gray-900 border-none">
                      {post.category}
                    </Badge>
                  </div>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm">
                        {post.author.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                        <p className="text-xs text-gray-600">{post.author.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {post.date}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {post.readTime}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Articles
              </Button>
            </div>
          </div>
        </section>

        {/* Trending Topics */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending Now
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Popular Topics
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore the most discussed subjects in legal technology
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingTopics.map((topic) => {
                const TopicIcon = topic.icon
                return (
                  <Card key={topic.title} className="border-2 hover:border-blue-500 transition-colors cursor-pointer group text-center">
                    <CardContent className="pt-6">
                      <div className={`h-16 w-16 rounded-full bg-${topic.color}-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <TopicIcon className={`h-8 w-8 text-${topic.color}-600`} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {topic.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {topic.posts} articles
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Tags Cloud */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Tag className="h-3 w-3 mr-1" />
                Topics
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Browse by Tag
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover articles by specific topics and keywords
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {popularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="px-4 py-2 cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none shadow-xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Never Miss an Update
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Subscribe to our newsletter and get the latest legal AI insights, 
                    industry trends, and best practices delivered to your inbox weekly.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-6">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1"
                    />
                    <Button size="lg" className="group">
                      Subscribe
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>

                  <p className="text-sm text-gray-500">
                    Join 10,000+ legal professionals • Weekly newsletter • Unsubscribe anytime
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
                Ready to Transform Your Legal Practice?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                See how LexiScan AI can help you work smarter, faster, and more efficiently.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="group bg-white hover:bg-gray-100">
                    Start Free Trial
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
                14-day free trial • No credit card required • Full access to all features
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

