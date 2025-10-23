import type { Metadata } from "next"
import Link from "next/link"
import { Shield, Lock, Eye, Database, Server, Users, AlertTriangle, CheckCircle, FileText, Calendar, Globe, Zap, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Security & Compliance - Enterprise Protection | LexiScan AI",
  description: "Enterprise-grade security with SOC 2, ISO 27001, GDPR, and HIPAA compliance. Learn how LexiScan AI protects your legal documents with bank-level encryption.",
  keywords: "legal security, SOC 2, ISO 27001, GDPR compliant, HIPAA, data encryption, enterprise security"
}

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
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-24 sm:pt-24 sm:pb-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4">
                <Shield className="h-3 w-3 mr-1" />
                Certified & Audited
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                Enterprise-Grade{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Security & Compliance
                </span>
              </h1>
              <p className="text-lg leading-8 text-gray-600 mb-8">
                Bank-level encryption, third-party audits, and global compliance certifications 
                to protect your most sensitive legal documents.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <Link href="/contact">
                  <Button size="lg" className="group">
                    Request Security Documentation
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline">
                    Schedule Security Review
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last updated: January 2024
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Version 2.1
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  SOC 2 Type II Certified
                </div>
              </div>
            </div>
          </div>
        </section>

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
                <Card className="hover:shadow-lg transition-shadow">
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
                <Card className="hover:shadow-lg transition-shadow">
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
                <Card className="hover:shadow-lg transition-shadow">
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

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                See Our Security in Action
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Schedule a personalized security review with our team to learn how we protect your data.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="group bg-white hover:bg-gray-100">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 bg-white/5">
                    Contact Security Team
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-blue-200 mt-6">
                <CheckCircle className="inline h-4 w-4 mr-1" />
                Enterprise support • Custom security reviews • Compliance documentation
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
