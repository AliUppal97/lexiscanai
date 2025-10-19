"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, X, Star, ArrowRight, FileText, Users, Zap, Shield } from "lucide-react"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const plans = [
  {
    name: "Starter",
    description: "Perfect for individuals and small teams",
    price: { monthly: 29, yearly: 290 },
    features: [
      "Up to 100 documents per month",
      "Basic AI analysis",
      "Standard support",
      "PDF, DOC, DOCX support",
      "Basic risk assessment",
      "Email notifications",
    ],
    limitations: [
      "No team collaboration",
      "No API access",
      "No custom integrations",
      "No priority support",
    ],
    popular: false,
    cta: "Start Free Trial",
    href: "/signup?plan=starter",
  },
  {
    name: "Professional",
    description: "Ideal for growing legal teams",
    price: { monthly: 99, yearly: 990 },
    features: [
      "Up to 1,000 documents per month",
      "Advanced AI analysis",
      "Priority support",
      "All file formats supported",
      "Comprehensive risk assessment",
      "Team collaboration (up to 10 users)",
      "Custom templates",
      "Advanced analytics",
      "API access",
      "Integration with legal tools",
    ],
    limitations: [
      "Limited to 10 team members",
      "No white-label options",
    ],
    popular: true,
    cta: "Start Free Trial",
    href: "/signup?plan=professional",
  },
  {
    name: "Enterprise",
    description: "For large organizations with complex needs",
    price: { monthly: 299, yearly: 2990 },
    features: [
      "Unlimited documents",
      "Premium AI analysis",
      "24/7 dedicated support",
      "All file formats + custom formats",
      "Advanced risk assessment + compliance",
      "Unlimited team members",
      "Custom templates + workflows",
      "Advanced analytics + reporting",
      "Full API access",
      "Custom integrations",
      "White-label options",
      "On-premise deployment",
      "SSO integration",
      "Audit logs",
      "Custom SLA",
    ],
    limitations: [],
    popular: false,
    cta: "Contact Sales",
    href: "/contact?plan=enterprise",
  },
]

const features = [
  {
    name: "AI Document Analysis",
    description: "Advanced NLP algorithms analyze contracts and legal documents with human-level accuracy.",
    icon: FileText,
  },
  {
    name: "Team Collaboration",
    description: "Work together with your team on document reviews and analysis workflows.",
    icon: Users,
  },
  {
    name: "Lightning Fast Processing",
    description: "Process hundreds of documents in minutes with our scalable infrastructure.",
    icon: Zap,
  },
  {
    name: "Enterprise Security",
    description: "Bank-grade security with end-to-end encryption and compliance standards.",
    icon: Shield,
  },
]

const faqs = [
  {
    question: "Can I change plans anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
  },
  {
    question: "What happens if I exceed my document limit?",
    answer: "We'll notify you when you're approaching your limit. You can upgrade your plan or purchase additional document credits as needed.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, all paid plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "Do you offer custom pricing?",
    answer: "Yes, we offer custom pricing for Enterprise customers with specific requirements. Contact our sales team to discuss your needs.",
  },
  {
    question: "What file formats do you support?",
    answer: "We support PDF, DOC, DOCX, TXT, XLS, XLSX, and many other formats. Enterprise customers can request support for custom formats.",
  },
  {
    question: "How secure is my data?",
    answer: "We use bank-grade security with end-to-end encryption, SOC 2 compliance, and regular security audits. Your data is never shared with third parties.",
  },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Simple, transparent pricing
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Choose the perfect plan for your legal team. All plans include our core AI analysis features.
              </p>
              
              {/* Billing Toggle */}
              <div className="flex items-center justify-center space-x-4 mb-12">
                <Label htmlFor="billing-toggle" className="text-lg font-medium">
                  Monthly
                </Label>
                <Switch
                  id="billing-toggle"
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                />
                <Label htmlFor="billing-toggle" className="text-lg font-medium">
                  Yearly
                </Label>
                {isYearly && (
                  <Badge variant="secondary" className="ml-2">
                    Save 17%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan) => (
                <Card 
                  key={plan.name} 
                  className={`relative ${
                    plan.popular 
                      ? "border-blue-500 shadow-lg scale-105" 
                      : "border-gray-200"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-lg">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">
                        ${isYearly ? plan.price.yearly : plan.price.monthly}
                      </span>
                      <span className="text-gray-600 ml-2">
                        /{isYearly ? "year" : "month"}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                      asChild
                    >
                      <Link href={plan.href}>
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {plan.limitations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-start">
                              <X className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-500">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything you need to analyze legal documents
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our AI-powered platform provides comprehensive document analysis tools for legal professionals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently asked questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about our pricing and plans.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-blue-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of legal professionals who trust LexiScan AI for their document analysis needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">
                  Start Free Trial
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent" asChild>
                <Link href="/contact">
                  Contact Sales
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

