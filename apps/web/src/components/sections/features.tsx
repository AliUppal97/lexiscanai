import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Shield, 
  Zap, 
  FileText, 
  Search, 
  BarChart3,
  Users,
  Lock,
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const mainFeatures = [
  {
    icon: Brain,
    title: "AI Document Analysis",
    description: "Advanced NLP algorithms analyze contracts, legal documents, and case files with human-level accuracy and consistency.",
    features: ["Contract Review", "Risk Assessment", "Compliance Checking", "Clause Extraction"],
    color: "blue"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security with end-to-end encryption, audit trails, and compliance with legal industry standards.",
    features: ["SOC 2 Compliance", "End-to-End Encryption", "Audit Trails", "Role-Based Access"],
    color: "green"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Process hundreds of documents in minutes, not hours. Get instant insights and recommendations.",
    features: ["Real-time Processing", "Batch Analysis", "Instant Results", "Scalable Infrastructure"],
    color: "purple"
  }
]

const additionalFeatures = [
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find relevant information across your document library using natural language queries."
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track document processing metrics, review times, and team productivity with detailed insights."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share documents, assign reviews, and collaborate seamlessly with your legal team."
  },
  {
    icon: Lock,
    title: "Data Privacy",
    description: "Your documents are processed securely with full data sovereignty and privacy controls."
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Access your AI-powered legal tools anytime, anywhere with 99.9% uptime guarantee."
  },
  {
    icon: FileText,
    title: "Multi-Format Support",
    description: "Process PDFs, Word docs, emails, and more with our comprehensive format support."
  }
]

const stats = [
  { label: "Documents Processed", value: "1M+" },
  { label: "Time Saved", value: "80%" },
  { label: "Accuracy Rate", value: "98.5%" },
  { label: "Customer Satisfaction", value: "4.9/5" }
]

export function Features() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            <CheckCircle className="h-4 w-4 mr-1" />
            Powerful Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to streamline your legal workflow
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our comprehensive suite of AI-powered tools helps legal professionals 
            work faster, smarter, and more accurately than ever before.
          </p>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="text-base leading-7 text-gray-600">{stat.label}</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Main Features */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {mainFeatures.map((feature) => (
              <Card key={feature.title} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-${feature.color}-100 mb-4`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item) => (
                      <li key={item} className="flex items-center text-sm text-gray-600">
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

        {/* Additional Features Grid */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {additionalFeatures.map((feature) => (
              <div key={feature.title} className="group relative rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                      <feature.icon className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{feature.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="mx-auto max-w-2xl">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">
              Ready to transform your legal workflow?
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of legal professionals who trust LexiScan AI to streamline their document analysis.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg">
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

