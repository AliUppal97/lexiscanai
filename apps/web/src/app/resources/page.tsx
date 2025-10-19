"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { 
  BookOpen, 
  FileText, 
  Video, 
  Download, 
  ExternalLink, 
  Search, 
  Filter, 
  Calendar,
  User,
  Tag,
  Clock,
  Star,
  TrendingUp,
  Award,
  Lightbulb,
  Globe,
  MessageCircle,
  Play,
  ArrowRight,
  CheckCircle,
  Eye,
  ThumbsUp,
  Share2
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const resourceCategories = [
  {
    id: "documentation",
    title: "Documentation",
    description: "Comprehensive guides and API references",
    icon: BookOpen,
    color: "blue",
    count: 24
  },
  {
    id: "tutorials",
    title: "Tutorials",
    description: "Step-by-step guides and walkthroughs",
    icon: Video,
    color: "green",
    count: 18
  },
  {
    id: "whitepapers",
    title: "Whitepapers",
    description: "In-depth research and analysis",
    icon: FileText,
    color: "purple",
    count: 12
  },
  {
    id: "case-studies",
    title: "Case Studies",
    description: "Real-world success stories",
    icon: TrendingUp,
    color: "orange",
    count: 8
  }
]

const featuredResources = [
  {
    id: 1,
    title: "Getting Started with LexiScan AI",
    type: "tutorial",
    category: "Tutorials",
    description: "Learn the basics of document analysis and how to get the most out of LexiScan AI",
    author: "Sarah Johnson",
    authorRole: "Product Manager",
    publishDate: "2024-01-15",
    readTime: "15 min read",
    views: 1250,
    likes: 89,
    featured: true,
    tags: ["getting-started", "tutorial", "basics"],
    thumbnail: "/placeholder-tutorial.jpg"
  },
  {
    id: 2,
    title: "AI-Powered Contract Analysis: A Complete Guide",
    type: "whitepaper",
    category: "Whitepapers",
    description: "Deep dive into how AI is transforming contract analysis and legal document review",
    author: "Dr. Michael Chen",
    authorRole: "AI Research Lead",
    publishDate: "2024-01-10",
    readTime: "25 min read",
    views: 890,
    likes: 67,
    featured: true,
    tags: ["ai", "contracts", "analysis", "research"],
    thumbnail: "/placeholder-whitepaper.jpg"
  },
  {
    id: 3,
    title: "API Integration Best Practices",
    type: "documentation",
    category: "Documentation",
    description: "Learn how to integrate LexiScan AI into your existing workflow with our REST API",
    author: "Alex Rodriguez",
    authorRole: "Senior Developer",
    publishDate: "2024-01-08",
    readTime: "20 min read",
    views: 756,
    likes: 45,
    featured: true,
    tags: ["api", "integration", "development"],
    thumbnail: "/placeholder-docs.jpg"
  }
]

const allResources = [
  ...featuredResources,
  {
    id: 4,
    title: "Legal Tech Trends 2024",
    type: "whitepaper",
    category: "Whitepapers",
    description: "Explore the latest trends in legal technology and their impact on the industry",
    author: "Emily Watson",
    authorRole: "Legal Tech Analyst",
    publishDate: "2024-01-05",
    readTime: "18 min read",
    views: 634,
    likes: 32,
    featured: false,
    tags: ["trends", "legal-tech", "industry"],
    thumbnail: "/placeholder-trends.jpg"
  },
  {
    id: 5,
    title: "Advanced Document Processing Techniques",
    type: "tutorial",
    category: "Tutorials",
    description: "Master advanced techniques for processing complex legal documents",
    author: "David Kim",
    authorRole: "Solutions Architect",
    publishDate: "2024-01-03",
    readTime: "22 min read",
    views: 542,
    likes: 28,
    featured: false,
    tags: ["advanced", "processing", "techniques"],
    thumbnail: "/placeholder-advanced.jpg"
  },
  {
    id: 6,
    title: "How TechCorp Reduced Contract Review Time by 80%",
    type: "case-study",
    category: "Case Studies",
    description: "Learn how TechCorp implemented LexiScan AI and transformed their contract review process",
    author: "Lisa Thompson",
    authorRole: "Customer Success Manager",
    publishDate: "2024-01-01",
    readTime: "12 min read",
    views: 445,
    likes: 23,
    featured: false,
    tags: ["case-study", "success", "efficiency"],
    thumbnail: "/placeholder-case-study.jpg"
  },
  {
    id: 7,
    title: "Security and Compliance in Legal AI",
    type: "whitepaper",
    category: "Whitepapers",
    description: "Understanding security requirements and compliance considerations for AI in legal applications",
    author: "James Wilson",
    authorRole: "Security Engineer",
    publishDate: "2023-12-28",
    readTime: "30 min read",
    views: 389,
    likes: 19,
    featured: false,
    tags: ["security", "compliance", "ai"],
    thumbnail: "/placeholder-security.jpg"
  },
  {
    id: 8,
    title: "Building Custom Analysis Templates",
    type: "tutorial",
    category: "Tutorials",
    description: "Create custom analysis templates tailored to your specific document types",
    author: "Maria Garcia",
    authorRole: "Product Specialist",
    publishDate: "2023-12-25",
    readTime: "16 min read",
    views: 321,
    likes: 15,
    featured: false,
    tags: ["templates", "customization", "analysis"],
    thumbnail: "/placeholder-templates.jpg"
  }
]

const videoTutorials = [
  {
    id: 1,
    title: "Quick Start Guide",
    duration: "5:32",
    views: 2150,
    thumbnail: "/placeholder-video-1.jpg",
    description: "Get up and running with LexiScan AI in under 6 minutes"
  },
  {
    id: 2,
    title: "Advanced Risk Analysis",
    duration: "12:45",
    views: 1890,
    thumbnail: "/placeholder-video-2.jpg",
    description: "Learn how to perform comprehensive risk analysis on complex contracts"
  },
  {
    id: 3,
    title: "API Integration Walkthrough",
    duration: "18:20",
    views: 1567,
    thumbnail: "/placeholder-video-3.jpg",
    description: "Step-by-step guide to integrating LexiScan AI with your existing systems"
  },
  {
    id: 4,
    title: "Team Collaboration Features",
    duration: "8:15",
    views: 1234,
    thumbnail: "/placeholder-video-4.jpg",
    description: "Discover how to collaborate effectively with your legal team"
  }
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case "tutorial":
      return Video
    case "whitepaper":
      return FileText
    case "documentation":
      return BookOpen
    case "case-study":
      return TrendingUp
    default:
      return FileText
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "tutorial":
      return "bg-green-100 text-green-800"
    case "whitepaper":
      return "bg-purple-100 text-purple-800"
    case "documentation":
      return "bg-blue-100 text-blue-800"
    case "case-study":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  const filteredResources = allResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || resource.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesType = selectedType === "all" || resource.type === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Resources & Documentation
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything you need to master LexiScan AI. From quick start guides to advanced tutorials, 
              find the resources that will help you succeed.
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search resources, tutorials, and documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="all" className="space-y-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Resources</TabsTrigger>
              <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
              <TabsTrigger value="whitepapers">Whitepapers</TabsTrigger>
              <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {/* Resource Categories */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {resourceCategories.map((category) => (
                  <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="text-center">
                      <div className={`mx-auto p-3 bg-${category.color}-100 rounded-lg w-fit mb-4`}>
                        <category.icon className={`h-8 w-8 text-${category.color}-600`} />
                      </div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Badge variant="outline">{category.count} resources</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Featured Resources */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredResources.map((resource) => (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-gray-200 rounded-t-lg relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          {(() => {
                            const IconComponent = getTypeIcon(resource.type)
                            return <IconComponent className="h-12 w-12 text-gray-400" />
                          })()}
                        </div>
                        <Badge className={`absolute top-3 left-3 ${getTypeColor(resource.type)}`}>
                          {resource.category}
                        </Badge>
                        {resource.featured && (
                          <Badge className="absolute top-3 right-3 bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <User className="h-4 w-4" />
                            <span>{resource.author}</span>
                            <span>•</span>
                            <span>{resource.authorRole}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{resource.publishDate}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{resource.readTime}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Eye className="h-4 w-4" />
                                <span>{resource.views}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{resource.likes}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {resource.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" className="flex-1">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Read
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* All Resources */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">All Resources</h2>
                  <div className="flex items-center space-x-3">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="tutorials">Tutorials</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                        <SelectItem value="whitepapers">Whitepapers</SelectItem>
                        <SelectItem value="case-studies">Case Studies</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                        <SelectItem value="whitepaper">Whitepaper</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                        <SelectItem value="case-study">Case Study</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-gray-200 rounded-t-lg relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          {(() => {
                            const IconComponent = getTypeIcon(resource.type)
                            return <IconComponent className="h-12 w-12 text-gray-400" />
                          })()}
                        </div>
                        <Badge className={`absolute top-3 left-3 ${getTypeColor(resource.type)}`}>
                          {resource.category}
                        </Badge>
                        {resource.featured && (
                          <Badge className="absolute top-3 right-3 bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <User className="h-4 w-4" />
                            <span>{resource.author}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{resource.publishDate}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{resource.readTime}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{resource.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{resource.likes}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {resource.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button size="sm" className="w-full">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Read More
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tutorials" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Video Tutorials</h2>
                <p className="text-lg text-gray-600">
                  Watch step-by-step tutorials to master LexiScan AI
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videoTutorials.map((video) => (
                  <Card key={video.id} className="hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-gray-200 rounded-t-lg relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-16 w-16 text-white bg-black bg-opacity-50 rounded-full p-4" />
                      </div>
                      <Badge className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white">
                        {video.duration}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <CardDescription>{video.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{video.views} views</span>
                        </div>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Watch
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="documentation" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Documentation</h2>
                <p className="text-lg text-gray-600">
                  Comprehensive guides and API references
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allResources.filter(r => r.type === "documentation").map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription>{resource.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{resource.readTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{resource.views}</span>
                          </div>
                        </div>
                        <Button size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read Documentation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="whitepapers" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Whitepapers</h2>
                <p className="text-lg text-gray-600">
                  In-depth research and analysis on legal AI
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allResources.filter(r => r.type === "whitepaper").map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-purple-600" />
                        <div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription>{resource.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{resource.readTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{resource.views}</span>
                          </div>
                        </div>
                        <Button size="sm" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="case-studies" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Case Studies</h2>
                <p className="text-lg text-gray-600">
                  Real-world success stories from our customers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allResources.filter(r => r.type === "case-study").map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-8 w-8 text-orange-600" />
                        <div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription>{resource.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{resource.readTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{resource.views}</span>
                          </div>
                        </div>
                        <Button size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read Case Study
                        </Button>
                      </div>
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
                <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button size="lg" variant="secondary">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse All Docs
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
