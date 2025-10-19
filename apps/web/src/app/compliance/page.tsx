"use client"

import Link from "next/link"
import { Shield, FileText, Globe, Users, Building, Heart, DollarSign, Scale, CheckCircle, Calendar, AlertTriangle, Lock } from "lucide-react"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const complianceFrameworks = [
  {
    name: "SOC 2 Type II",
    category: "Security & Availability",
    description: "Comprehensive audit of security, availability, processing integrity, confidentiality, and privacy controls",
    status: "Certified",
    icon: Shield,
    color: "bg-green-100 text-green-800",
    details: [
      "Annual third-party audits",
      "Security controls assessment",
      "Availability monitoring",
      "Processing integrity validation"
    ]
  },
  {
    name: "ISO 27001",
    category: "Information Security",
    description: "International standard for information security management systems",
    status: "Certified",
    icon: Lock,
    color: "bg-blue-100 text-blue-800",
    details: [
      "Information security management system",
      "Risk assessment and treatment",
      "Continuous improvement processes",
      "Regular management reviews"
    ]
  },
  {
    name: "GDPR",
    category: "Data Protection",
    description: "General Data Protection Regulation compliance for EU data subjects",
    status: "Compliant",
    icon: Globe,
    color: "bg-purple-100 text-purple-800",
    details: [
      "Data subject rights implementation",
      "Privacy by design principles",
      "Data protection impact assessments",
      "Breach notification procedures"
    ]
  },
  {
    name: "CCPA",
    category: "Privacy Rights",
    description: "California Consumer Privacy Act compliance for California residents",
    status: "Compliant",
    icon: Users,
    color: "bg-orange-100 text-orange-800",
    details: [
      "Consumer privacy rights",
      "Data collection transparency",
      "Opt-out mechanisms",
      "Data deletion capabilities"
    ]
  },
  {
    name: "HIPAA",
    category: "Healthcare",
    description: "Health Insurance Portability and Accountability Act compliance",
    status: "Compliant",
    icon: Heart,
    color: "bg-red-100 text-red-800",
    details: [
      "Protected health information safeguards",
      "Administrative safeguards",
      "Physical safeguards",
      "Technical safeguards"
    ]
  },
  {
    name: "FedRAMP",
    category: "Government",
    description: "Federal Risk and Authorization Management Program for government cloud services",
    status: "In Process",
    icon: Building,
    color: "bg-yellow-100 text-yellow-800",
    details: [
      "Government cloud security standards",
      "Continuous monitoring requirements",
      "Third-party assessment organization review",
      "Authorization to operate (ATO) process"
    ]
  }
]

const industryStandards = [
  {
    industry: "Legal Services",
    standards: ["ABA Model Rules", "Attorney-Client Privilege", "Confidentiality Requirements"],
    icon: Scale
  },
  {
    industry: "Healthcare",
    standards: ["HIPAA", "HITECH Act", "FDA Regulations"],
    icon: Heart
  },
  {
    industry: "Financial Services",
    standards: ["SOX", "PCI DSS", "FFIEC Guidelines"],
    icon: DollarSign
  },
  {
    industry: "Government",
    standards: ["FedRAMP", "FISMA", "NIST Guidelines"],
    icon: Building
  }
]

const complianceFeatures = [
  {
    title: "Data Governance",
    icon: FileText,
    description: "Comprehensive data governance framework ensuring regulatory compliance",
    features: [
      "Data classification and labeling",
      "Data retention policies",
      "Data lineage tracking",
      "Consent management"
    ]
  },
  {
    title: "Privacy Controls",
    icon: Users,
    description: "Advanced privacy controls to protect individual rights and data",
    features: [
      "Right to access implementation",
      "Data portability features",
      "Right to deletion",
      "Consent withdrawal mechanisms"
    ]
  },
  {
    title: "Security Monitoring",
    icon: Shield,
    description: "Continuous security monitoring and incident response capabilities",
    features: [
      "Real-time threat detection",
      "Automated incident response",
      "Security event logging",
      "Compliance reporting"
    ]
  },
  {
    title: "Audit Trail",
    icon: CheckCircle,
    description: "Comprehensive audit trails for compliance and forensic purposes",
    features: [
      "User activity logging",
      "Data access tracking",
      "System change monitoring",
      "Immutable audit logs"
    ]
  }
]

const complianceReports = [
  {
    name: "SOC 2 Type II Report",
    period: "2023",
    description: "Independent audit of security, availability, and confidentiality controls",
    status: "Available",
    icon: Shield
  },
  {
    name: "ISO 27001 Certificate",
    period: "2023-2026",
    description: "Information security management system certification",
    status: "Valid",
    icon: Lock
  },
  {
    name: "GDPR Compliance Assessment",
    period: "2023",
    description: "Comprehensive assessment of GDPR compliance measures",
    status: "Available",
    icon: Globe
  },
  {
    name: "Penetration Testing Report",
    period: "Q4 2023",
    description: "Third-party security assessment and vulnerability testing",
    status: "Available",
    icon: AlertTriangle
  }
]

export default function CompliancePage() {
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
                  Compliance
                </h1>
              </div>
              <p className="text-xl text-gray-600 mb-8">
                Comprehensive compliance with international standards and regulatory requirements for enterprise customers.
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

        {/* Compliance Frameworks */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Compliance Frameworks
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We maintain compliance with major international standards and regulatory frameworks.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {complianceFrameworks.map((framework, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <framework.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <Badge className={`${framework.color} text-xs`}>
                        {framework.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{framework.name}</CardTitle>
                    <Badge variant="outline" className="text-xs w-fit">
                      {framework.category}
                    </Badge>
                    <CardDescription className="mt-3">
                      {framework.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {framework.details.map((detail, detailIndex) => (
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

        {/* Industry Standards */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Industry-Specific Compliance
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Specialized compliance measures for different industries and use cases.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {industryStandards.map((industry, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <industry.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      {industry.industry}
                    </h3>
                    <ul className="space-y-2 text-left">
                      {industry.standards.map((standard, standardIndex) => (
                        <li key={standardIndex} className="flex items-start text-sm text-gray-600">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-1 flex-shrink-0" />
                          {standard}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance Features */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Compliance Features
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Built-in compliance features to help you meet regulatory requirements.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {complianceFeatures.map((feature, index) => (
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
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
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

        {/* Compliance Reports */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Compliance Reports & Certifications
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Independent third-party audits and certifications validating our compliance posture.
              </p>
            </div>
            <div className="max-w-4xl mx-auto space-y-6">
              {complianceReports.map((report, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <report.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {report.name}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {report.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {report.period}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {report.status}
                            </Badge>
                          </div>
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

        {/* Data Processing Agreements */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Data Processing Agreements
                </h2>
                <p className="text-gray-600">
                  Standard and custom data processing agreements to meet your compliance requirements.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <FileText className="h-6 w-6 text-blue-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Standard DPA
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Our standard data processing agreement covers GDPR, CCPA, and other major privacy regulations.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li>• GDPR Article 28 compliant</li>
                      <li>• CCPA service provider terms</li>
                      <li>• Standard contractual clauses</li>
                      <li>• Data breach notification terms</li>
                    </ul>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      Download DPA
                    </button>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Shield className="h-6 w-6 text-blue-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Custom DPA
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Custom data processing agreements tailored to your specific compliance requirements.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li>• Industry-specific terms</li>
                      <li>• Custom data retention periods</li>
                      <li>• Specialized security requirements</li>
                      <li>• Jurisdiction-specific clauses</li>
                    </ul>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      Request Custom DPA
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Contact */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Compliance Support
              </h2>
              <p className="text-gray-600 mb-8">
                Our compliance team is here to help you meet your regulatory requirements.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Compliance Questions</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      General compliance and regulatory questions
                    </p>
                    <a href="mailto:compliance@lexiscan.ai" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      compliance@lexiscan.ai
                    </a>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Audit Requests</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Request access to compliance reports and certifications
                    </p>
                    <a href="mailto:audits@lexiscan.ai" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      audits@lexiscan.ai
                    </a>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Legal Team</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Legal agreements and contract negotiations
                    </p>
                    <a href="mailto:legal@lexiscan.ai" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      legal@lexiscan.ai
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
