"use client"

import Link from "next/link"
import { FileText, Scale, Shield, Users, Calendar, AlertTriangle } from "lucide-react"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const sections = [
  {
    title: "Acceptance of Terms",
    icon: Scale,
    content: [
      {
        subtitle: "Agreement to Terms",
        description: "By accessing or using LexiScan AI services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services."
      },
      {
        subtitle: "Modifications",
        description: "We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through our platform. Continued use of our services after such modifications constitutes acceptance of the updated terms."
      }
    ]
  },
  {
    title: "Service Description",
    icon: FileText,
    content: [
      {
        subtitle: "AI Document Analysis",
        description: "LexiScan AI provides artificial intelligence-powered document analysis services for legal professionals, including contract review, risk assessment, and compliance checking."
      },
      {
        subtitle: "Service Availability",
        description: "We strive to maintain high service availability but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any part of our services with reasonable notice."
      }
    ]
  },
  {
    title: "User Responsibilities",
    icon: Users,
    content: [
      {
        subtitle: "Account Security",
        description: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use."
      },
      {
        subtitle: "Compliance",
        description: "You agree to use our services in compliance with all applicable laws and regulations. You are responsible for ensuring that your use of our services does not violate any third-party rights."
      },
      {
        subtitle: "Content Responsibility",
        description: "You are solely responsible for the content you upload and process through our services. You warrant that you have all necessary rights to such content and that it does not infringe on any third-party rights."
      }
    ]
  },
  {
    title: "Intellectual Property",
    icon: Shield,
    content: [
      {
        subtitle: "Our Rights",
        description: "LexiScan AI and its licensors own all rights, title, and interest in and to our services, including all intellectual property rights. Our services are protected by copyright, trademark, and other laws."
      },
      {
        subtitle: "Your Rights",
        description: "You retain ownership of the content you upload to our platform. By using our services, you grant us a limited license to process your content solely for the purpose of providing our services."
      }
    ]
  }
]

const limitations = [
  {
    title: "Service Limitations",
    description: "Our AI analysis is provided for informational purposes and should not be considered as legal advice. Users should always consult with qualified legal professionals for important decisions.",
    icon: AlertTriangle
  },
  {
    title: "Accuracy Disclaimer",
    description: "While we strive for accuracy, AI analysis may not be 100% accurate. Users should verify all analysis results and not rely solely on our AI recommendations.",
    icon: AlertTriangle
  },
  {
    title: "Third-Party Content",
    description: "Our services may include links to third-party websites or content. We are not responsible for the content or practices of such third parties.",
    icon: AlertTriangle
  }
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <Scale className="h-12 w-12 text-blue-600 mr-4" />
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                  Terms of Service
                </h1>
              </div>
              <p className="text-xl text-gray-600 mb-8">
                Please read these terms carefully before using LexiScan AI services.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last updated: January 1, 2024
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Version 2.1
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="py-8 bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Important Legal Notice</h3>
                  <p className="text-yellow-700">
                    LexiScan AI provides AI-powered document analysis tools for informational purposes only. 
                    Our services are not a substitute for professional legal advice. Always consult with qualified 
                    legal professionals for important legal decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms Content */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-16">
                {sections.map((section, index) => (
                  <div key={index}>
                    <div className="flex items-center mb-8">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <section.icon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        {section.title}
                      </h2>
                    </div>
                    
                    <div className="space-y-8">
                      {section.content.map((item, itemIndex) => (
                        <div key={itemIndex}>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            {item.subtitle}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Sections */}
              <div className="mt-16 space-y-12">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Payment Terms
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law. 
                      We may change our pricing with 30 days' notice to existing customers.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                      <li>Payment is due upon subscription activation</li>
                      <li>Failed payments may result in service suspension</li>
                      <li>Refunds are provided only in accordance with our refund policy</li>
                      <li>Taxes are calculated based on your location</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Limitation of Liability
                  </h2>
                  <div className="space-y-6">
                    {limitations.map((limitation, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-3">
                            <limitation.icon className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">
                                {limitation.title}
                              </h3>
                              <p className="text-gray-600">
                                {limitation.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Termination
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Either party may terminate this agreement at any time. Upon termination, your access to our services will cease, 
                    and we may delete your data according to our data retention policy. Provisions that by their nature should survive 
                    termination will remain in effect.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Governing Law
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    These terms are governed by the laws of the State of California, United States. Any disputes arising from these terms 
                    or your use of our services will be resolved in the courts of San Francisco County, California.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Contact Information
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="space-y-2">
                      <p><strong>Email:</strong> legal@lexiscan.ai</p>
                      <p><strong>Address:</strong> 123 Legal Tech Street, San Francisco, CA 94105</p>
                      <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
