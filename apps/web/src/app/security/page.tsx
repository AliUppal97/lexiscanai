"use client"

import Link from "next/link"
import { Shield, Lock, Eye, Database, Server, Users, AlertTriangle, CheckCircle, FileText, Calendar, Globe, Zap } from "lucide-react"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const securityFeatures = [
  {
    title: "Data Encryption",
    icon: Lock,
    description: "End-to-end encryption for all data in transit and at rest",
    details: [
      "AES-256 encryption for data at rest",
      "TLS 1.3 for data in transit",
      "Encrypted database connections",
      "Key management with AWS KMS"
    ]
  },
  {
    title: "Access Controls",
    icon: Users,
    description: "Multi-layered access control and authentication",
    details: [
      "Multi-factor authentication (MFA)",
      "Role-based access control (RBAC)",
      "Single Sign-On (SSO) integration",
      "Session management and timeout"
    ]
  },
  {
    title: "Infrastructure Security",
    icon: Server,
    description: "Secure cloud infrastructure with enterprise-grade protection",
    details: [
      "AWS/Azure certified infrastructure",
      "Network segmentation and firewalls",
      "Intrusion detection and prevention",
      "Regular security patching"
    ]
  },
  {
    title: "Data Privacy",
    icon: Eye,
    description: "Comprehensive data privacy and protection measures",
    details: [
      "Data minimization principles",
      "Privacy by design architecture",
      "Right to be forgotten compliance",
      "Data anonymization capabilities"
    ]
  }
]

const complianceStandards = [
  {
    name: "SOC 2 Type II",
    status: "Certified",
    description: "Security, availability, and confidentiality controls",
    icon: Shield,
    color: "bg-green-100 text-green-800"
  },
  {
    name: "ISO 27001",
    status: "Certified",
    description: "Information security management system",
    icon: Lock,
    color: "bg-blue-100 text-blue-800"
  },
  {
    name: "GDPR",
    status: "Compliant",
    description: "European data protection regulation",
    icon: Globe,
    color: "bg-purple-100 text-purple-800"
  },
  {
    name: "CCPA",
    status: "Compliant",
    description: "California Consumer Privacy Act",
    icon: Users,
    color: "bg-orange-100 text-orange-800"
  },
  {
    name: "HIPAA",
    status: "Compliant",
    description: "Health Insurance Portability and Accountability Act",
    icon: FileText,
    color: "bg-red-100 text-red-800"
  },
  {
    name: "FedRAMP",
    status: "In Process",
    description: "Federal Risk and Authorization Management Program",
    icon: Shield,
    color: "bg-yellow-100 text-yellow-800"
  }
]

const securityMeasures = [
  {
    category: "Network Security",
    icon: Server,
    measures: [
      "DDoS protection and mitigation",
      "Web Application Firewall (WAF)",
      "Network intrusion detection",
      "Secure VPN access for employees"
    ]
  },
  {
    category: "Application Security",
    icon: Shield,
    measures: [
      "Regular security code reviews",
      "Automated vulnerability scanning",
      "Penetration testing quarterly",
      "Secure development lifecycle (SDL)"
    ]
  },
  {
    category: "Data Protection",
    icon: Database,
    measures: [
      "Automated data backups",
      "Point-in-time recovery",
      "Cross-region replication",
      "Data loss prevention (DLP)"
    ]
  },
  {
    category: "Monitoring & Response",
    icon: AlertTriangle,
    measures: [
      "24/7 security monitoring",
      "Real-time threat detection",
      "Incident response procedures",
      "Security event logging"
    ]
  }
]

const auditReports = [
  {
    name: "SOC 2 Type II Report",
    date: "December 2023",
    description: "Independent audit of security, availability, and confidentiality controls",
    status: "Available upon request"
  },
  {
    name: "Penetration Testing Report",
    date: "November 2023",
    description: "Third-party security assessment and vulnerability testing",
    status: "Available upon request"
  },
  {
    name: "ISO 27001 Certification",
    date: "October 2023",
    description: "Information security management system certification",
    status: "Valid until October 2026"
  }
]

export default function SecurityPage() {
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
                  Security & Compliance
                </h1>
              </div>
              <p className="text-xl text-gray-600 mb-8">
                Enterprise-grade security and compliance standards to protect your data and meet regulatory requirements.
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Compliance & Certifications
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We maintain the highest standards of security and compliance to meet enterprise and regulatory requirements.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
              {complianceStandards.map((standard, index) => (
                <Card key={index} className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <standard.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                      {standard.name}
                    </h3>
                    <Badge className={`${standard.color} text-xs mb-2`}>
                      {standard.status}
                    </Badge>
                    <p className="text-xs text-gray-600">
                      {standard.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Security Features
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Comprehensive security measures to protect your data and ensure business continuity.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {securityFeatures.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <feature.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Security Measures */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Security Measures
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Multi-layered security approach covering all aspects of our platform and infrastructure.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {securityMeasures.map((measure, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <measure.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      {measure.category}
                    </h3>
                    <ul className="space-y-2 text-left">
                      {measure.measures.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start text-sm text-gray-600">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-1 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Reports */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Audit Reports & Certifications
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Independent third-party audits and certifications to validate our security posture.
              </p>
            </div>
            <div className="max-w-4xl mx-auto space-y-6">
              {auditReports.map((report, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {report.name}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {report.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {report.date}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {report.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                          Request Access
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Data Residency */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Data Residency & Sovereignty
                </h2>
                <p className="text-gray-600">
                  We respect data sovereignty requirements and provide options for data residency.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Globe className="h-6 w-6 text-blue-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Global Data Centers
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Our data centers are strategically located to provide optimal performance and comply with local data residency requirements.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• US East (Virginia)</li>
                      <li>• US West (California)</li>
                      <li>• EU West (Ireland)</li>
                      <li>• Asia Pacific (Singapore)</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Shield className="h-6 w-6 text-blue-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Data Sovereignty
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      We provide data residency options to meet regulatory requirements and customer preferences.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• EU data stays in EU</li>
                      <li>• US data stays in US</li>
                      <li>• Custom data residency options</li>
                      <li>• Cross-border transfer controls</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Security Team */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Security Contact
              </h2>
              <p className="text-gray-600 mb-8">
                Have security questions or need to report a security issue? Contact our security team.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Security Issues</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Report security vulnerabilities or incidents
                    </p>
                    <a href="mailto:security@lexiscan.ai" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      security@lexiscan.ai
                    </a>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Compliance</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Questions about compliance and certifications
                    </p>
                    <a href="mailto:compliance@lexiscan.ai" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      compliance@lexiscan.ai
                    </a>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Privacy</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Data privacy and protection inquiries
                    </p>
                    <a href="mailto:privacy@lexiscan.ai" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      privacy@lexiscan.ai
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
