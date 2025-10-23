import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Shield,
  Lock,
  Globe,
  Award,
  Users,
  TrendingUp,
  CheckCircle,
  Zap,
  Brain,
  FileText,
  Scale,
  Building2,
  Heart,
  Target,
  Lightbulb,
  ArrowRight,
  Star,
  Clock,
  ShieldCheck,
  GraduationCap,
  UserCheck,
  Sparkles
} from "lucide-react"

export const metadata: Metadata = {
  title: "About Us - Enterprise Legal AI | LexiScan AI",
  description: "Trusted by leading law firms worldwide. Learn how LexiScan AI is revolutionizing legal document analysis with enterprise-grade security and AI-powered insights.",
  keywords: "legal AI, law firm software, document analysis, legal tech, enterprise security, SOC 2, GDPR compliant"
}

const stats = [
  { label: "Documents Analyzed", value: "10M+", icon: FileText },
  { label: "Law Firms Served", value: "500+", icon: Building2 },
  { label: "Time Saved (Hours)", value: "2M+", icon: Clock },
  { label: "Customer Satisfaction", value: "99.8%", icon: Star },
]

const values = [
  {
    title: "Security First",
    description: "We prioritize the security and confidentiality of your legal documents above all else. Bank-level encryption, zero-knowledge architecture, and compliance with global standards.",
    icon: Shield,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    title: "Trust & Transparency",
    description: "Complete transparency in our AI operations, data handling, and business practices. Your data is never used to train our models without explicit consent.",
    icon: ShieldCheck,
    bgColor: "bg-green-100",
    iconColor: "text-green-600"
  },
  {
    title: "Innovation",
    description: "Continuously advancing legal AI technology to stay ahead of industry needs. We invest 30% of revenue in R&D to serve you better.",
    icon: Lightbulb,
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600"
  },
  {
    title: "Client Success",
    description: "Your success is our success. Dedicated support teams, personalized onboarding, and ongoing training to maximize your ROI.",
    icon: Target,
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600"
  },
]

const certifications = [
  {
    name: "SOC 2 Type II",
    description: "Certified for security, availability, and confidentiality",
    icon: Shield,
  },
  {
    name: "ISO 27001",
    description: "International standard for information security",
    icon: Award,
  },
  {
    name: "GDPR Compliant",
    description: "Full compliance with EU data protection regulations",
    icon: Globe,
  },
  {
    name: "HIPAA Ready",
    description: "Healthcare compliance for sensitive legal matters",
    icon: Lock,
  },
]

const milestones = [
  {
    year: "2020",
    title: "Company Founded",
    description: "LexiScan AI was founded by former BigLaw attorneys and AI researchers from Stanford and MIT."
  },
  {
    year: "2021",
    title: "First 100 Law Firms",
    description: "Reached 100 law firms across 15 countries, processing over 1 million documents."
  },
  {
    year: "2022",
    title: "Series A Funding",
    description: "Secured $50M Series A led by top-tier VCs to expand enterprise capabilities."
  },
  {
    year: "2023",
    title: "SOC 2 Certification",
    description: "Achieved SOC 2 Type II certification and launched advanced AI models."
  },
  {
    year: "2024",
    title: "Global Expansion",
    description: "Serving 500+ law firms globally with 10M+ documents analyzed and 99.8% accuracy."
  },
]

const leadership = [
  {
    name: "Sarah Mitchell",
    role: "CEO & Co-Founder",
    bio: "Former partner at Skadden Arps. JD from Harvard Law, MBA from Stanford GSB.",
    icon: UserCheck,
  },
  {
    name: "Dr. James Chen",
    role: "CTO & Co-Founder",
    bio: "PhD in AI from MIT. Former lead researcher at Google AI and DeepMind.",
    icon: Brain,
  },
  {
    name: "Michael Rodriguez",
    role: "Chief Security Officer",
    bio: "20+ years in cybersecurity. Former CISO at major financial institutions.",
    icon: Shield,
  },
  {
    name: "Emily Thompson",
    role: "Chief Legal Officer",
    bio: "Former General Counsel at Fortune 500. Expert in legal tech compliance.",
    icon: Scale,
  },
]

const whyChooseUs = [
  {
    title: "Attorney-Client Privilege Protected",
    description: "We understand the sacred nature of attorney-client privilege. Our infrastructure is designed with legal confidentiality at its core.",
    icon: Lock,
  },
  {
    title: "No AI Training on Your Data",
    description: "Your documents are never used to train our AI models. Your data remains exclusively yours, always.",
    icon: UserCheck,
  },
  {
    title: "Built by Legal Professionals",
    description: "Founded and built by attorneys who understand the unique needs and challenges of legal practice.",
    icon: GraduationCap,
  },
  {
    title: "Enterprise-Grade Infrastructure",
    description: "99.99% uptime SLA, redundant data centers, and disaster recovery protocols that exceed industry standards.",
    icon: Building2,
  },
  {
    title: "Audit Trail & Compliance",
    description: "Complete audit trails, chain of custody tracking, and compliance reporting for regulatory requirements.",
    icon: CheckCircle,
  },
  {
    title: "24/7 Priority Support",
    description: "Dedicated support teams available around the clock for enterprise clients with guaranteed response times.",
    icon: Heart,
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-24 sm:pt-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Award className="h-3 w-3 mr-1" />
              Trusted by 500+ Law Firms Worldwide
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
              Transforming Legal Practice with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trusted AI
              </span>
            </h1>
            <p className="text-lg leading-8 text-gray-600 mb-8">
              LexiScan AI is the leading enterprise AI platform for legal document analysis, 
              trusted by international law firms and corporate legal departments to enhance 
              efficiency while maintaining the highest standards of security and confidentiality.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="group">
                  Get Started Today
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline">
                  Schedule a Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
          <div className="relative aspect-[1155/678] w-[36.125rem] bg-gradient-to-tr from-blue-200 to-purple-200 opacity-30" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => {
              const StatIcon = stat.icon
              return (
                <Card key={stat.label} className="text-center border-none shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-3">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <StatIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                Our Mission
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Empowering Legal Professionals with AI They Can Trust
              </h2>
              <div className="prose prose-lg text-gray-600 space-y-4">
                <p>
                  LexiScan AI was founded with a singular mission: to help legal professionals 
                  work smarter, not harder, while maintaining the integrity and confidentiality 
                  that the legal profession demands.
                </p>
                <p>
                  We believe that artificial intelligence should augment human expertise, not 
                  replace it. Our platform is designed to handle the time-consuming tasks of 
                  document review, contract analysis, and research—freeing attorneys to focus 
                  on strategy, client relationships, and high-value legal work.
                </p>
                <p>
                  Every feature, every security protocol, and every design decision is made 
                  with one question in mind: "Would we trust this with our most sensitive 
                  legal matters?" If the answer isn't a resounding yes, we don't ship it.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              {values.map((value) => {
                const IconComponent = value.icon
                return (
                  <Card key={value.title} className="border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-lg ${value.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className={`h-6 w-6 ${value.iconColor}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {value.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {value.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Shield className="h-3 w-3 mr-1" />
              Why Law Firms Choose Us
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for the Legal Industry, By the Legal Industry
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We understand the unique challenges of legal practice because we've lived them. 
              Our platform is purpose-built for the exacting standards of the legal profession.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item) => {
              const ItemIcon = item.icon
              return (
                <Card key={item.title} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                      <ItemIcon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Security & Certifications */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Lock className="h-3 w-3 mr-1" />
              Security & Compliance
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Security You Can Verify
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We don't just talk about security—we prove it with industry-leading certifications 
              and third-party audits. Your data security is our top priority.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {certifications.map((cert) => {
              const CertIcon = cert.icon
              return (
                <Card key={cert.name} className="text-center border-2 hover:border-blue-500 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <CertIcon className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {cert.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {cert.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none">
            <CardContent className="pt-8 pb-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">256-bit</div>
                  <div className="text-sm text-gray-600">AES Encryption</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">99.99%</div>
                  <div className="text-sm text-gray-600">Uptime SLA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                  <div className="text-sm text-gray-600">Security Monitoring</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Users className="h-3 w-3 mr-1" />
              Leadership Team
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Led by Legal and Technology Experts
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our leadership team combines deep legal expertise with cutting-edge AI research 
              and enterprise security experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((leader) => {
              const LeaderIcon = leader.icon
              return (
                <Card key={leader.name} className="border-none shadow-lg">
                  <CardContent className="pt-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <LeaderIcon className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      {leader.name}
                    </h3>
                    <p className="text-sm text-blue-600 mb-3">
                      {leader.role}
                    </p>
                    <p className="text-sm text-gray-600">
                      {leader.bio}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <TrendingUp className="h-3 w-3 mr-1" />
              Our Journey
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Five Years of Innovation and Growth
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From a small startup to serving hundreds of law firms globally, 
              our commitment to excellence has never wavered.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-600 hidden lg:block" />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="relative">
                  <div className={`lg:grid lg:grid-cols-2 lg:gap-8 ${index % 2 === 0 ? '' : 'lg:grid-flow-dense'}`}>
                    <div className={`${index % 2 === 0 ? '' : 'lg:col-start-2'}`}>
                      <Card className="border-2 border-blue-200 hover:border-blue-500 transition-colors">
                        <CardContent className="pt-6">
                          <Badge variant="secondary" className="mb-3">
                            {milestone.year}
                          </Badge>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {milestone.title}
                          </h3>
                          <p className="text-gray-600">
                            {milestone.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 top-8 transform -translate-x-1/2 -translate-y-1/2 hidden lg:block">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-white shadow-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Legal Practice?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of leading law firms who trust LexiScan AI for their 
              document analysis needs.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="group bg-white hover:bg-gray-100">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Contact Sales
                </Button>
              </Link>
            </div>
            <p className="text-sm text-blue-200 mt-6">
              <CheckCircle className="inline h-4 w-4 mr-1" />
              No credit card required • 14-day free trial • Enterprise support available
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

