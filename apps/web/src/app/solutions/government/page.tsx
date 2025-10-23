import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Shield,
  Building2,
  Lock,
  FileCheck,
  Users,
  Scale,
  CheckCircle2,
  ArrowRight,
  Award,
  Globe,
  Server,
  Eye,
  Zap,
  FileText,
  Clock,
  DollarSign,
  Briefcase,
  ShieldCheck,
  FileSearch,
  AlertTriangle,
  BarChart3,
  Key,
  Database,
  UserCheck,
  CloudCog,
  Flag,
  Landmark,
  BookOpen,
  GraduationCap,
  Target,
  Sparkles
} from "lucide-react"

export const metadata: Metadata = {
  title: "Government & Public Sector Solutions | LexiScan AI",
  description: "Secure, compliant AI-powered document analysis for US federal, state, and local government agencies. FedRAMP authorized, FISMA compliant, with government-specific deployment options.",
  keywords: "government legal AI, federal document analysis, FedRAMP, FISMA compliance, public sector legal tech, government contracts"
}

const certifications = [
  {
    name: "FedRAMP Authorized",
    level: "Moderate Impact Level",
    description: "Federal Risk and Authorization Management Program certified",
    icon: ShieldCheck,
    status: "Active",
    color: "blue"
  },
  {
    name: "FISMA Compliant",
    description: "Federal Information Security Management Act standards met",
    icon: Shield,
    status: "Certified",
    color: "green"
  },
  {
    name: "StateRAMP Ready",
    description: "State-level risk and authorization program compliant",
    icon: Flag,
    status: "Authorized",
    color: "purple"
  },
  {
    name: "CJIS Compliant",
    description: "Criminal Justice Information Services Security Policy adherent",
    icon: Scale,
    status: "Certified",
    color: "red"
  },
  {
    name: "Section 508",
    description: "Accessibility standards for federal technology",
    icon: UserCheck,
    status: "Compliant",
    color: "orange"
  },
  {
    name: "IL4/IL5 Ready",
    description: "Impact Level 4 & 5 DoD cloud security requirements",
    icon: Lock,
    status: "In Progress",
    color: "indigo"
  }
]

const governmentUseCases = [
  {
    title: "Contract & Procurement",
    description: "Streamline RFP analysis, vendor contract review, and procurement documentation with AI-powered insights.",
    icon: FileCheck,
    features: [
      "Automated RFP/RFQ analysis",
      "Vendor proposal comparison",
      "Contract compliance checking",
      "FAR/DFARS regulation verification"
    ],
    metrics: {
      timeSaved: "65%",
      accuracy: "98%",
      cost: "50% reduction"
    },
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200"
  },
  {
    title: "Legal & Compliance",
    description: "Ensure regulatory compliance, manage legal documents, and conduct thorough due diligence for government operations.",
    icon: Scale,
    features: [
      "Regulatory compliance monitoring",
      "FOIA request processing",
      "Legal document classification",
      "Policy compliance verification"
    ],
    metrics: {
      timeSaved: "70%",
      accuracy: "99%",
      cost: "60% reduction"
    },
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200"
  },
  {
    title: "Investigations & Enforcement",
    description: "Support law enforcement and regulatory agencies with rapid document analysis and evidence processing.",
    icon: FileSearch,
    features: [
      "Evidence document review",
      "Case file organization",
      "Pattern detection & analysis",
      "Chain of custody tracking"
    ],
    metrics: {
      timeSaved: "75%",
      accuracy: "97%",
      cost: "55% reduction"
    },
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    borderColor: "border-red-200"
  },
  {
    title: "Records Management",
    description: "Digitize, organize, and analyze vast archives of government records with automated classification.",
    icon: Database,
    features: [
      "Document digitization & OCR",
      "Automated classification",
      "Retention policy enforcement",
      "NARA compliance support"
    ],
    metrics: {
      timeSaved: "80%",
      accuracy: "96%",
      cost: "70% reduction"
    },
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    borderColor: "border-green-200"
  }
]

const deploymentOptions = [
  {
    title: "Government Cloud (GovCloud)",
    description: "Deploy on AWS GovCloud or Azure Government for sensitive workloads",
    icon: CloudCog,
    features: [
      "FedRAMP authorized infrastructure",
      "ITAR compliance support",
      "Dedicated government tenancy",
      "Enhanced security controls"
    ],
    recommended: "Federal Agencies"
  },
  {
    title: "On-Premises Deployment",
    description: "Install within your secure government data center environment",
    icon: Server,
    features: [
      "Air-gapped deployment options",
      "Full data sovereignty",
      "Custom security hardening",
      "No external dependencies"
    ],
    recommended: "DoD & Intelligence"
  },
  {
    title: "Hybrid Cloud",
    description: "Combine on-premises and cloud for flexible, secure operations",
    icon: Database,
    features: [
      "Flexible data residency",
      "Seamless integration",
      "Scalable processing",
      "Cost optimization"
    ],
    recommended: "State & Local Gov"
  }
]

const securityFeatures = [
  {
    title: "Advanced Encryption",
    description: "AES-256 encryption at rest, TLS 1.3 in transit, with FIPS 140-2 validated modules",
    icon: Lock
  },
  {
    title: "Multi-Factor Authentication",
    description: "PIV/CAC card support, biometrics, and integration with government identity systems",
    icon: Key
  },
  {
    title: "Audit Logging",
    description: "Comprehensive audit trails meeting NIST 800-53 requirements for accountability",
    icon: FileText
  },
  {
    title: "Data Residency",
    description: "Guaranteed US data storage with no international data transfers",
    icon: Flag
  },
  {
    title: "Access Controls",
    description: "Role-based access control (RBAC) with granular permissions and need-to-know enforcement",
    icon: UserCheck
  },
  {
    title: "Continuous Monitoring",
    description: "24/7 security monitoring, threat detection, and incident response capabilities",
    icon: Eye
  }
]

const agencies = [
  {
    type: "Federal Agencies",
    icon: Landmark,
    count: "15+",
    examples: [
      "Department of Justice",
      "Department of Defense",
      "Federal Acquisition Service",
      "Various Federal Departments"
    ]
  },
  {
    type: "State Governments",
    icon: Flag,
    count: "25+",
    examples: [
      "State Attorney General Offices",
      "State Procurement Departments",
      "State Courts & Judiciary",
      "Regulatory Agencies"
    ]
  },
  {
    type: "Local Governments",
    icon: Building2,
    count: "100+",
    examples: [
      "City Legal Departments",
      "County Prosecutor Offices",
      "Municipal Court Systems",
      "Local Law Enforcement"
    ]
  },
  {
    type: "Education Institutions",
    icon: GraduationCap,
    count: "50+",
    examples: [
      "Public Universities",
      "Community Colleges",
      "School Districts",
      "Education Departments"
    ]
  }
]

const procurementInfo = [
  {
    title: "GSA Schedule 70",
    description: "Available through GSA Multiple Award Schedule for streamlined federal procurement",
    icon: FileCheck,
    details: [
      "Contract #: GS-35F-XXXXX",
      "Schedule: 70 - IT Solutions",
      "Period: Through 2029",
      "CAGE Code: XXXXX"
    ]
  },
  {
    title: "Cooperative Purchasing",
    description: "Available for state and local governments through cooperative contracts",
    icon: Users,
    details: [
      "NASPO ValuePoint",
      "Sourcewell contract",
      "OMNIA Partners",
      "State-specific contracts"
    ]
  },
  {
    title: "Blanket Purchase Agreements",
    description: "Establish BPAs for simplified ordering and volume discounts",
    icon: Briefcase,
    details: [
      "Flexible pricing models",
      "Volume-based discounts",
      "Multi-year commitments",
      "Streamlined renewals"
    ]
  }
]

const benefits = [
  {
    title: "Taxpayer Savings",
    stat: "$12M+",
    description: "Total cost savings realized by government clients annually",
    icon: DollarSign,
    color: "green"
  },
  {
    title: "Faster Processing",
    stat: "70%",
    description: "Average reduction in document processing time across agencies",
    icon: Clock,
    color: "blue"
  },
  {
    title: "Enhanced Accuracy",
    stat: "98.5%",
    description: "AI-powered analysis accuracy for compliance and risk detection",
    icon: Target,
    color: "purple"
  },
  {
    title: "Improved Transparency",
    stat: "100%",
    description: "Complete audit trails and accountability for all operations",
    icon: Eye,
    color: "orange"
  }
]

export default function GovernmentSolutionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 pt-20 pb-24 sm:pt-24 sm:pb-32 text-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
                <Landmark className="h-3 w-3 mr-1" />
                Government & Public Sector Solutions
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                Secure AI for{" "}
                <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                  Public Service
                </span>
              </h1>
              <p className="text-lg leading-8 text-blue-100 mb-8">
                FedRAMP authorized, FISMA compliant document analysis built specifically for US government 
                agencies. Deliver better citizen services while ensuring security, compliance, and transparency.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <Link href="/contact">
                  <Button size="lg" variant="secondary" className="group bg-white hover:bg-gray-100 text-blue-900">
                    Request Agency Demo
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/case-studies">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Award className="mr-2 h-4 w-4" />
                    View Government Case Studies
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-200">
                <span className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  FedRAMP Authorized
                </span>
                <span className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  FISMA Compliant
                </span>
                <span className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  GSA Schedule 70
                </span>
                <span className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Section 508 Accessible
                </span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
            <div className="relative aspect-[1155/678] w-[36.125rem] bg-gradient-to-tr from-blue-400 to-cyan-400 opacity-20" />
          </div>
        </section>

        {/* Certifications */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Award className="h-3 w-3 mr-1" />
                Security & Compliance Certifications
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Meeting the Highest Government Standards
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We maintain rigorous security certifications and authorizations required for government use
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert) => {
                const CertIcon = cert.icon
                return (
                  <Card key={cert.name} className={`border-2 border-${cert.color}-200 hover:shadow-lg transition-shadow`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`h-12 w-12 rounded-lg bg-${cert.color}-100 flex items-center justify-center flex-shrink-0`}>
                          <CertIcon className={`h-6 w-6 text-${cert.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-gray-900">{cert.name}</h3>
                            <Badge variant="secondary" className={`bg-${cert.color}-100 text-${cert.color}-700 border-none`}>
                              {cert.status}
                            </Badge>
                          </div>
                          {cert.level && (
                            <p className="text-xs font-medium text-gray-600 mb-2">{cert.level}</p>
                          )}
                          <p className="text-sm text-gray-600">{cert.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Government Use Cases */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Purpose-Built for Government Operations
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Specialized solutions addressing the unique challenges of public sector legal work
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {governmentUseCases.map((useCase) => {
                const UseCaseIcon = useCase.icon
                return (
                  <Card key={useCase.title} className={`border-2 ${useCase.borderColor} hover:shadow-xl transition-shadow`}>
                    <CardHeader className={useCase.bgColor}>
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-white shadow-md flex items-center justify-center flex-shrink-0">
                          <UseCaseIcon className={`h-6 w-6 ${useCase.iconColor}`} />
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-2">{useCase.title}</CardTitle>
                          <CardDescription className="text-gray-700">{useCase.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Key Capabilities:</h4>
                      <ul className="space-y-2 mb-6">
                        {useCase.features.map((feature) => (
                          <li key={feature} className="flex items-start text-sm text-gray-600">
                            <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {useCase.metrics.timeSaved}
                          </div>
                          <div className="text-xs text-gray-600">Time Saved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {useCase.metrics.accuracy}
                          </div>
                          <div className="text-xs text-gray-600">Accuracy</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            {useCase.metrics.cost}
                          </div>
                          <div className="text-xs text-gray-600">Cost Savings</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Deployment Options */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Server className="h-3 w-3 mr-1" />
                Flexible Deployment
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Deploy Where Your Data Lives
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Choose the deployment model that meets your agency's security and compliance requirements
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {deploymentOptions.map((option) => {
                const OptionIcon = option.icon
                return (
                  <Card key={option.title} className="border-2 hover:border-blue-500 transition-colors">
                    <CardContent className="pt-6">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                        <OptionIcon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600 text-center mb-4">
                        {option.description}
                      </p>
                      
                      <Separator className="my-4" />
                      
                      <ul className="space-y-2 mb-4">
                        {option.features.map((feature) => (
                          <li key={feature} className="flex items-start text-sm text-gray-600">
                            <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Badge variant="outline" className="w-full justify-center">
                        Recommended for: {option.recommended}
                      </Badge>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Shield className="h-3 w-3 mr-1" />
                Enterprise-Grade Security
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Security Built for Government
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive security controls meeting federal security requirements
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityFeatures.map((feature) => {
                const FeatureIcon = feature.icon
                return (
                  <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <FeatureIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Agencies Served */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Trusted by Government at All Levels
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Serving federal, state, local, and education institutions across America
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {agencies.map((agency) => {
                const AgencyIcon = agency.icon
                return (
                  <Card key={agency.type} className="border-2 border-blue-100 hover:border-blue-300 transition-colors text-center">
                    <CardContent className="pt-6">
                      <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                        <AgencyIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {agency.count}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-4">
                        {agency.type}
                      </h3>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {agency.examples.map((example) => (
                          <li key={example}>{example}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Procurement Information */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Briefcase className="h-3 w-3 mr-1" />
                Procurement & Contracting
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Simplified Government Procurement
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Multiple contracting vehicles for easy, compliant purchasing
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {procurementInfo.map((info) => {
                const InfoIcon = info.icon
                return (
                  <Card key={info.title} className="border-2 border-green-200 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                        <InfoIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {info.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {info.description}
                      </p>
                      <Separator className="my-4" />
                      <ul className="space-y-2">
                        {info.details.map((detail) => (
                          <li key={detail} className="flex items-start text-sm text-gray-600">
                            <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-12 text-center">
              <Card className="max-w-3xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 border-none">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Need Help with Procurement?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Our government contracts team can assist with RFP responses, SOW development, 
                    and navigating federal acquisition regulations.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/contact">
                      <Button>
                        Contact Government Sales
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download Capability Statement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits & Results */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <BarChart3 className="h-3 w-3 mr-1" />
                Proven Results
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Delivering Value to Taxpayers
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Measurable impact across government operations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit) => {
                const BenefitIcon = benefit.icon
                return (
                  <Card key={benefit.title} className="border-none shadow-lg text-center">
                    <CardContent className="pt-6">
                      <div className={`h-16 w-16 rounded-full bg-${benefit.color}-100 flex items-center justify-center mx-auto mb-4`}>
                        <BenefitIcon className={`h-8 w-8 text-${benefit.color}-600`} />
                      </div>
                      <div className={`text-4xl font-bold text-${benefit.color}-600 mb-2`}>
                        {benefit.stat}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Ready to Modernize Your Agency?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Let's discuss how LexiScan AI can help your agency deliver better services, 
                reduce costs, and maintain the highest security standards.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/contact">
                  <Button size="lg" variant="secondary" className="group bg-white hover:bg-gray-100 text-blue-900">
                    Schedule Agency Demo
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/case-studies">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    View Government Case Studies
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Download Government Brochure
                </Button>
              </div>
              <p className="text-sm text-blue-200 mt-6">
                FedRAMP Authorized • FISMA Compliant • GSA Schedule Available • Free Agency Consultation
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

