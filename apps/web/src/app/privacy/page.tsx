"use client"

import Link from "next/link"
import { FileText, Shield, Eye, Lock, Database, Globe, Users, Calendar } from "lucide-react"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const sections = [
  {
    title: "Information We Collect",
    icon: Database,
    content: [
      {
        subtitle: "Personal Information",
        description: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your name, email address, phone number, and organization details."
      },
      {
        subtitle: "Document Data",
        description: "We process the documents you upload to our platform for analysis purposes. This includes contracts, legal documents, and other files you choose to analyze using our AI services."
      },
      {
        subtitle: "Usage Information",
        description: "We collect information about how you use our services, including your interactions with our platform, features used, and performance metrics to improve our services."
      }
    ]
  },
  {
    title: "How We Use Your Information",
    icon: Eye,
    content: [
      {
        subtitle: "Service Provision",
        description: "We use your information to provide, maintain, and improve our AI document analysis services, including processing your documents and delivering analysis results."
      },
      {
        subtitle: "Communication",
        description: "We use your contact information to send you important updates about our services, respond to your inquiries, and provide customer support."
      },
      {
        subtitle: "Security and Compliance",
        description: "We use your information to ensure the security of our platform, prevent fraud, and comply with legal obligations and industry standards."
      }
    ]
  },
  {
    title: "Data Security",
    icon: Lock,
    content: [
      {
        subtitle: "Encryption",
        description: "All data is encrypted in transit and at rest using industry-standard encryption protocols. We use AES-256 encryption for data at rest and TLS 1.3 for data in transit."
      },
      {
        subtitle: "Access Controls",
        description: "We implement strict access controls and authentication measures to ensure only authorized personnel can access your data. All access is logged and monitored."
      },
      {
        subtitle: "Infrastructure Security",
        description: "Our infrastructure is hosted on secure cloud platforms with multiple layers of security, including firewalls, intrusion detection, and regular security audits."
      }
    ]
  },
  {
    title: "Data Sharing",
    icon: Users,
    content: [
      {
        subtitle: "No Third-Party Sharing",
        description: "We do not sell, trade, or otherwise transfer your personal information to third parties without your explicit consent, except as described in this policy."
      },
      {
        subtitle: "Service Providers",
        description: "We may share information with trusted service providers who assist us in operating our platform, conducting our business, or serving our users, provided they agree to keep this information confidential."
      },
      {
        subtitle: "Legal Requirements",
        description: "We may disclose your information if required to do so by law or in response to valid requests by public authorities."
      }
    ]
  }
]

const compliance = [
  {
    name: "SOC 2 Type II",
    description: "Comprehensive security and availability controls",
    icon: Shield
  },
  {
    name: "GDPR Compliant",
    description: "Full compliance with European data protection regulations",
    icon: Globe
  },
  {
    name: "CCPA Compliant",
    description: "California Consumer Privacy Act compliance",
    icon: Users
  },
  {
    name: "ISO 27001",
    description: "International standard for information security management",
    icon: Lock
  }
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <Shield className="h-12 w-12 text-blue-600 mr-4" />
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                  Privacy Policy
                </h1>
              </div>
              <p className="text-xl text-gray-600 mb-8">
                Your privacy is our priority. Learn how we collect, use, and protect your information.
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

        {/* Compliance Badges */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Security & Compliance
              </h2>
              <p className="text-gray-600">
                We maintain the highest standards of data protection and security.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {compliance.map((item, index) => (
                <Card key={index} className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <item.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy Policy Content */}
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
                    Your Rights
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Access & Portability</h3>
                        <p className="text-gray-600 text-sm">
                          You have the right to access your personal data and receive a copy in a portable format.
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Correction & Deletion</h3>
                        <p className="text-gray-600 text-sm">
                          You can request correction of inaccurate data or deletion of your personal information.
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Opt-out & Withdrawal</h3>
                        <p className="text-gray-600 text-sm">
                          You can opt-out of marketing communications and withdraw consent at any time.
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Data Processing</h3>
                        <p className="text-gray-600 text-sm">
                          You have the right to object to certain types of data processing activities.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Data Retention
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy. Document data is retained according to your subscription plan and can be deleted upon request.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Account information: Retained while your account is active</li>
                    <li>Document data: Retained according to your plan (30 days to unlimited)</li>
                    <li>Usage logs: Retained for 12 months for security and analytics</li>
                    <li>Support communications: Retained for 3 years</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Contact Us
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="space-y-2">
                      <p><strong>Email:</strong> privacy@lexiscan.ai</p>
                      <p><strong>Address:</strong> 123 Legal Tech Street, San Francisco, CA 94105</p>
                      <p><strong>Data Protection Officer:</strong> dpo@lexiscan.ai</p>
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

