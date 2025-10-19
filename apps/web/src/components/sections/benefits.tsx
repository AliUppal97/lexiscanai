import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  Users, 
  Shield,
  FileText,
  Sparkles
} from "lucide-react"
import Link from "next/link"

const benefits = [
  {
    icon: TrendingUp,
    title: "Reduce Review Time by 80%",
    description: "Our AI identifies key clauses, risks, and opportunities in seconds, allowing you to focus on strategic decisions.",
    metric: "80%",
    metricLabel: "Time Reduction"
  },
  {
    icon: Shield,
    title: "Minimize Human Error",
    description: "Consistent analysis across all documents with built-in quality checks and validation rules.",
    metric: "99.5%",
    metricLabel: "Accuracy Rate"
  },
  {
    icon: Users,
    title: "Scale Your Practice",
    description: "Handle more cases and clients without increasing your team size. Our AI works 24/7 to support your practice.",
    metric: "3x",
    metricLabel: "Capacity Increase"
  }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Senior Partner",
    company: "Johnson & Associates",
    content: "LexiScan AI has revolutionized our contract review process. What used to take hours now takes minutes.",
    avatar: "SJ"
  },
  {
    name: "Michael Chen",
    role: "Legal Director",
    company: "TechCorp",
    content: "The accuracy of the AI analysis is remarkable. It catches details that even experienced lawyers might miss.",
    avatar: "MC"
  },
  {
    name: "Emily Rodriguez",
    role: "Compliance Manager",
    company: "FinanceCorp",
    content: "We've reduced our compliance review time by 75% while improving accuracy. It's a game-changer.",
    avatar: "ER"
  }
]

export function Benefits() {
  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-4 w-4 mr-1" />
            Why Choose LexiScan AI?
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Transform your legal practice with AI-powered efficiency
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Join thousands of legal professionals who have revolutionized their workflow 
            with our intelligent document analysis platform.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="relative overflow-hidden border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <benefit.icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{benefit.metric}</div>
                          <div className="text-xs text-gray-500">{benefit.metricLabel}</div>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">
              Trusted by legal professionals worldwide
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              See what our customers are saying about LexiScan AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                      <p className="text-xs text-gray-400">{testimonial.company}</p>
                    </div>
                  </div>
                  <blockquote className="text-gray-700">
                    <p>"{testimonial.content}"</p>
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="mx-auto max-w-4xl border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600">
            <CardContent className="p-12 text-white">
              <div className="flex items-center justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of legal professionals who trust LexiScan AI to streamline their document analysis workflow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="group">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent">
                    Contact Sales
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-blue-200 mt-6">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

