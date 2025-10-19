"use client"

import { useState } from "react"
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  BookOpen, 
  Video, 
  FileText, 
  ChevronRight,
  ExternalLink,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Plus
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const helpCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of LexiScan AI",
    icon: BookOpen,
    color: "blue",
    articles: [
      {
        title: "How to upload your first document",
        description: "Step-by-step guide to uploading and processing documents",
        readTime: "3 min read",
        helpful: 95
      },
      {
        title: "Understanding analysis results",
        description: "Learn how to interpret AI analysis results and recommendations",
        readTime: "5 min read",
        helpful: 88
      },
      {
        title: "Setting up your team",
        description: "Invite team members and manage permissions",
        readTime: "4 min read",
        helpful: 92
      }
    ]
  },
  {
    id: "document-analysis",
    title: "Document Analysis",
    description: "Advanced features and analysis tools",
    icon: FileText,
    color: "green",
    articles: [
      {
        title: "Supported file formats",
        description: "Complete list of supported document types and formats",
        readTime: "2 min read",
        helpful: 97
      },
      {
        title: "Custom analysis templates",
        description: "Create and use custom analysis templates for your documents",
        readTime: "6 min read",
        helpful: 85
      },
      {
        title: "Batch processing documents",
        description: "Process multiple documents at once efficiently",
        readTime: "4 min read",
        helpful: 90
      }
    ]
  },
  {
    id: "team-management",
    title: "Team Management",
    description: "Collaborate with your team effectively",
    icon: MessageCircle,
    color: "purple",
    articles: [
      {
        title: "User roles and permissions",
        description: "Understand different user roles and what they can access",
        readTime: "3 min read",
        helpful: 93
      },
      {
        title: "Sharing documents with team members",
        description: "How to share documents and collaborate with your team",
        readTime: "4 min read",
        helpful: 89
      },
      {
        title: "Audit logs and activity tracking",
        description: "Monitor team activity and maintain compliance",
        readTime: "5 min read",
        helpful: 87
      }
    ]
  },
  {
    id: "billing-account",
    title: "Billing & Account",
    description: "Manage your subscription and account",
    icon: HelpCircle,
    color: "orange",
    articles: [
      {
        title: "Understanding your usage limits",
        description: "Learn about document limits and how to monitor usage",
        readTime: "3 min read",
        helpful: 91
      },
      {
        title: "Upgrading or downgrading your plan",
        description: "How to change your subscription plan",
        readTime: "2 min read",
        helpful: 94
      },
      {
        title: "Downloading invoices and receipts",
        description: "Access your billing history and download invoices",
        readTime: "2 min read",
        helpful: 96
      }
    ]
  }
]

const faqs = [
  {
    question: "What file formats does LexiScan AI support?",
    answer: "LexiScan AI supports a wide range of document formats including PDF, DOC, DOCX, TXT, RTF, and more. We're constantly adding support for new formats based on user feedback."
  },
  {
    question: "How accurate is the AI analysis?",
    answer: "Our AI analysis achieves 98.7% accuracy on average, with continuous improvements through machine learning. Accuracy may vary depending on document complexity and quality."
  },
  {
    question: "Is my data secure and private?",
    answer: "Yes, we take security seriously. All documents are encrypted in transit and at rest, and we're SOC 2 compliant. Your data is never shared with third parties without your explicit consent."
  },
  {
    question: "Can I integrate LexiScan AI with other tools?",
    answer: "Yes, we offer API access and integrations with popular tools like Slack, Microsoft Teams, and various document management systems. Contact our support team for custom integrations."
  },
  {
    question: "What happens if I exceed my document limit?",
    answer: "If you exceed your monthly document limit, you'll be notified and can either upgrade your plan or wait until the next billing cycle. We also offer pay-per-use options for occasional overages."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period, and you can reactivate anytime."
  }
]

const supportTickets = [
  {
    id: "TICKET-001",
    subject: "Document processing failed",
    status: "open",
    priority: "high",
    createdAt: "2024-01-15T10:30:00Z",
    lastUpdated: "2024-01-15T14:20:00Z"
  },
  {
    id: "TICKET-002",
    subject: "Team invitation not working",
    status: "in-progress",
    priority: "medium",
    createdAt: "2024-01-14T16:45:00Z",
    lastUpdated: "2024-01-15T09:15:00Z"
  },
  {
    id: "TICKET-003",
    subject: "Billing question about usage",
    status: "resolved",
    priority: "low",
    createdAt: "2024-01-13T11:20:00Z",
    lastUpdated: "2024-01-14T08:30:00Z"
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "open":
      return <Badge variant="destructive">Open</Badge>
    case "in-progress":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>
    case "resolved":
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Resolved</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return <Badge variant="destructive">High</Badge>
    case "medium":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>
    case "low":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Low</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false)
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    description: "",
    priority: "medium"
  })

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingTicket(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmittingTicket(false)
    setTicketForm({ subject: "", description: "", priority: "medium" })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600">Find answers, get help, and contact our support team</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            Live Chat
          </Button>
          <Button size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search help articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="help-center" className="space-y-6">
        <TabsList>
          <TabsTrigger value="help-center">Help Center</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="support">Support Tickets</TabsTrigger>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
        </TabsList>

        <TabsContent value="help-center" className="space-y-6">
          {/* Help Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-${category.color}-100 rounded-lg`}>
                      <category.icon className={`h-5 w-5 text-${category.color}-600`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.articles.map((article, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{article.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{article.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs text-gray-400">{article.readTime}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-400">{article.helpful}% helpful</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Popular resources and guides</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="flex items-center space-x-3">
                    <Video className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">Video Tutorials</div>
                      <div className="text-sm text-gray-500">Watch step-by-step guides</div>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">API Documentation</div>
                      <div className="text-sm text-gray-500">Developer resources</div>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="flex items-center space-x-3">
                    <ExternalLink className="h-5 w-5 text-purple-600" />
                    <div className="text-left">
                      <div className="font-medium">Community Forum</div>
                      <div className="text-sm text-gray-500">Connect with other users</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          {/* Support Tickets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>Track your support requests and get updates</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-medium">{ticket.subject}</div>
                        <div className="text-sm text-gray-500">Ticket #{ticket.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          {/* Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Ticket</CardTitle>
                <CardDescription>Describe your issue and we'll get back to you</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Please provide detailed information about your issue..."
                      className="min-h-[120px]"
                    />
                  </div>
                  <Button type="submit" disabled={isSubmittingTicket} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmittingTicket ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Get in touch with our support team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Email Support</div>
                      <div className="text-sm text-gray-500">support@lexiscan.ai</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Phone Support</div>
                      <div className="text-sm text-gray-500">+1 (555) 123-4567</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">Business Hours</div>
                      <div className="text-sm text-gray-500">Mon-Fri 9AM-6PM PST</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Times</CardTitle>
                  <CardDescription>Expected response times by priority</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">High Priority</span>
                    </div>
                    <span className="text-sm font-medium">2-4 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Medium Priority</span>
                    </div>
                    <span className="text-sm font-medium">24 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Low Priority</span>
                    </div>
                    <span className="text-sm font-medium">48 hours</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

