import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Briefcase,
  Heart,
  TrendingUp,
  Users,
  Globe,
  Zap,
  Coffee,
  GraduationCap,
  Shield,
  Laptop,
  CalendarDays,
  DollarSign,
  Smile,
  Award,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Building2,
  HeartHandshake,
  Rocket,
  Target,
  Brain,
  Code,
  Scale,
  Lock,
  BarChart3
} from "lucide-react"

export const metadata: Metadata = {
  title: "Careers - Join Our Team | LexiScan AI",
  description: "Join LexiScan AI and help transform the legal industry with AI. Explore career opportunities, benefits, and our inclusive culture. Remote and hybrid positions available.",
  keywords: "careers, jobs, legal tech jobs, AI careers, remote jobs, law tech, software engineer jobs, legal AI"
}

const stats = [
  { label: "Team Members", value: "150+", icon: Users },
  { label: "Countries", value: "12", icon: Globe },
  { label: "Funding Raised", value: "$50M+", icon: TrendingUp },
  { label: "Employee Satisfaction", value: "98%", icon: Smile },
]

const values = [
  {
    title: "Innovation First",
    description: "We push boundaries and embrace new ideas. Our team is empowered to experiment, learn from failures, and build the future of legal technology.",
    icon: Rocket,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    title: "Client Success",
    description: "Our clients' success is our success. We're obsessed with delivering value and building tools that legal professionals love to use every day.",
    icon: Target,
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600"
  },
  {
    title: "Diversity & Inclusion",
    description: "We believe diverse teams build better products. We're committed to creating an inclusive workplace where everyone feels valued and heard.",
    icon: HeartHandshake,
    bgColor: "bg-green-100",
    iconColor: "text-green-600"
  },
  {
    title: "Work-Life Balance",
    description: "We value your time and well-being. Flexible hours, unlimited PTO, and remote work options ensure you can do your best work while living your best life.",
    icon: Heart,
    bgColor: "bg-pink-100",
    iconColor: "text-pink-600"
  },
]

const benefits = [
  {
    category: "Health & Wellness",
    icon: Heart,
    items: [
      "Comprehensive health, dental, and vision insurance",
      "Mental health support and counseling services",
      "Fitness and wellness stipend ($100/month)",
      "Ergonomic home office setup allowance"
    ]
  },
  {
    category: "Financial & Retirement",
    icon: DollarSign,
    items: [
      "Competitive salary with equity compensation",
      "401(k) with 4% company match",
      "Performance bonuses and stock options",
      "Annual salary reviews and adjustments"
    ]
  },
  {
    category: "Time Off & Flexibility",
    icon: CalendarDays,
    items: [
      "Unlimited PTO (minimum 3 weeks encouraged)",
      "12 paid holidays plus winter break",
      "Flexible work hours and remote options",
      "Generous parental leave (16 weeks)"
    ]
  },
  {
    category: "Growth & Learning",
    icon: GraduationCap,
    items: [
      "Annual learning budget ($3,000/year)",
      "Conference and training opportunities",
      "Internal mentorship program",
      "Career development planning and support"
    ]
  },
  {
    category: "Work Environment",
    icon: Laptop,
    items: [
      "Latest MacBook Pro or Windows laptop",
      "Modern office spaces in major cities",
      "Remote-first culture with global team",
      "Regular team offsites and events"
    ]
  },
  {
    category: "Additional Perks",
    icon: Coffee,
    items: [
      "Catered lunches and snacks in office",
      "Commuter benefits and parking",
      "Life and disability insurance",
      "Employee referral bonuses"
    ]
  }
]

const openPositions = [
  {
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote (US)",
    type: "Full-time",
    icon: Code,
    description: "Build scalable backend systems and intuitive frontend experiences for legal professionals.",
    requirements: ["5+ years experience", "React, Node.js, TypeScript", "AWS/Cloud infrastructure"],
    salary: "$150k - $200k"
  },
  {
    title: "Machine Learning Engineer",
    department: "AI/ML",
    location: "San Francisco, CA / Remote",
    type: "Full-time",
    icon: Brain,
    description: "Develop and improve AI models for legal document analysis and natural language processing.",
    requirements: ["PhD or 3+ years ML experience", "Python, TensorFlow/PyTorch", "NLP expertise"],
    salary: "$160k - $220k"
  },
  {
    title: "Legal Product Manager",
    department: "Product",
    location: "New York, NY / Remote",
    type: "Full-time",
    icon: Scale,
    description: "Define product strategy for our legal AI platform working closely with law firm clients.",
    requirements: ["JD or legal background preferred", "3+ years product management", "Legal tech experience"],
    salary: "$140k - $180k"
  },
  {
    title: "Senior Security Engineer",
    department: "Security",
    location: "Remote (US)",
    type: "Full-time",
    icon: Lock,
    description: "Ensure enterprise-grade security and compliance for sensitive legal documents.",
    requirements: ["5+ years security experience", "SOC 2, GDPR knowledge", "Cloud security"],
    salary: "$150k - $190k"
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Boston, MA / Remote",
    type: "Full-time",
    icon: Users,
    description: "Help law firms succeed with LexiScan AI through onboarding, training, and ongoing support.",
    requirements: ["3+ years customer success", "Legal industry experience", "Technical aptitude"],
    salary: "$90k - $130k"
  },
  {
    title: "Data Analyst",
    department: "Analytics",
    location: "Remote (US)",
    type: "Full-time",
    icon: BarChart3,
    description: "Analyze product usage, customer behavior, and business metrics to drive data-informed decisions.",
    requirements: ["3+ years analytics experience", "SQL, Python, BI tools", "Statistical analysis"],
    salary: "$100k - $140k"
  }
]

const offices = [
  {
    city: "San Francisco",
    state: "California",
    address: "123 Market Street, Suite 400",
    description: "Our headquarters and main engineering hub",
    image: "🌉"
  },
  {
    city: "New York",
    state: "New York", 
    address: "456 Park Avenue, 12th Floor",
    description: "Sales, legal, and customer success center",
    image: "🗽"
  },
  {
    city: "Boston",
    state: "Massachusetts",
    address: "789 Cambridge Street, Suite 200",
    description: "Product and design team office",
    image: "🏛️"
  },
  {
    city: "Remote",
    state: "Worldwide",
    address: "Work from anywhere",
    description: "60% of our team works remotely",
    image: "🌍"
  }
]

const hiringProcess = [
  {
    step: 1,
    title: "Application",
    description: "Submit your resume and cover letter through our careers portal",
    duration: "1 day"
  },
  {
    step: 2,
    title: "Recruiter Screen",
    description: "30-minute call with our recruiting team to discuss your background",
    duration: "3-5 days"
  },
  {
    step: 3,
    title: "Technical/Skills Assessment",
    description: "Role-specific assessment or take-home challenge",
    duration: "1 week"
  },
  {
    step: 4,
    title: "Team Interviews",
    description: "Meet with potential teammates and hiring manager (3-4 interviews)",
    duration: "1-2 weeks"
  },
  {
    step: 5,
    title: "Final Interview",
    description: "Conversation with leadership team and culture fit discussion",
    duration: "1 week"
  },
  {
    step: 6,
    title: "Offer & Onboarding",
    description: "Receive offer, negotiate if needed, and join the team!",
    duration: "1-2 weeks"
  }
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior ML Engineer",
    quote: "Working at LexiScan AI has been incredibly rewarding. The team is brilliant, the problems are challenging, and we're genuinely making an impact in the legal industry.",
    tenure: "2 years"
  },
  {
    name: "Marcus Johnson",
    role: "Product Manager",
    quote: "The company truly values work-life balance. I've never felt more supported or empowered to do my best work while still having time for my family.",
    tenure: "1.5 years"
  },
  {
    name: "Emily Rodriguez",
    role: "Customer Success Lead",
    quote: "What I love most is how customer-focused we are. Every feature we build, every decision we make, is centered around helping our clients succeed.",
    tenure: "3 years"
  }
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-24 sm:pt-24 sm:pb-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="secondary" className="mb-4">
                <Briefcase className="h-3 w-3 mr-1" />
                We're Hiring!
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                Build the Future of{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Legal Technology
                </span>
              </h1>
              <p className="text-lg leading-8 text-gray-600 mb-8">
                Join our mission to transform how legal professionals work with AI-powered document 
                analysis. We're a diverse team of innovators, engineers, and legal experts building 
                tools that make a real difference.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="#positions">
                  <Button size="lg" className="group">
                    View Open Positions
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#culture">
                  <Button size="lg" variant="outline">
                    Learn About Our Culture
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

        {/* Values Section */}
        <section id="culture" className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Heart className="h-3 w-3 mr-1" />
                Our Values
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What We Believe In
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our culture is built on these core values that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value) => {
                const ValueIcon = value.icon
                return (
                  <Card key={value.title} className="border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-lg ${value.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <ValueIcon className={`h-6 w-6 ${value.iconColor}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                            {value.title}
                          </h3>
                          <p className="text-gray-600">
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
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Award className="h-3 w-3 mr-1" />
                Benefits & Perks
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                We Take Care of Our Team
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Comprehensive benefits package designed to support your health, growth, and happiness
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit) => {
                const BenefitIcon = benefit.icon
                return (
                  <Card key={benefit.category} className="border-none shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <BenefitIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">{benefit.category}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {benefit.items.map((item) => (
                          <li key={item} className="flex items-start text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section id="positions" className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                Open Positions
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Join Our Growing Team
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We're always looking for talented people who are passionate about transforming the legal industry
              </p>
            </div>

            <div className="grid gap-6">
              {openPositions.map((position) => {
                const PositionIcon = position.icon
                return (
                  <Card key={position.title} className="border-2 hover:border-blue-500 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                              <PositionIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {position.title}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="secondary" className="text-xs">
                                  {position.department}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {position.location}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {position.type}
                                </Badge>
                                <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                  {position.salary}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-3">
                                {position.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {position.requirements.map((req) => (
                                  <span key={req} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {req}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button className="w-full md:w-auto">
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">
                Don't see the perfect role? We're always interested in meeting talented people.
              </p>
              <Button variant="outline" size="lg">
                Send Us Your Resume
              </Button>
            </div>
          </div>
        </section>

        {/* Hiring Process */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Target className="h-3 w-3 mr-1" />
                Our Hiring Process
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What to Expect
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our transparent hiring process typically takes 3-4 weeks from application to offer
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 to-purple-600 hidden md:block" />
                
                <div className="space-y-8">
                  {hiringProcess.map((step) => (
                    <div key={step.step} className="relative flex gap-6">
                      {/* Step number circle */}
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {step.step}
                        </div>
                      </div>
                      
                      {/* Step content */}
                      <Card className="flex-1 border-2 hover:border-blue-500 transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {step.title}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {step.duration}
                            </Badge>
                          </div>
                          <p className="text-gray-600">
                            {step.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Users className="h-3 w-3 mr-1" />
                Hear From Our Team
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What Our Employees Say
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real stories from real team members about working at LexiScan AI
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="border-none shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                        <p className="text-xs text-gray-500">{testimonial.tenure} at LexiScan</p>
                      </div>
                    </div>
                    <p className="text-gray-600 italic">
                      "{testimonial.quote}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Offices */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <MapPin className="h-3 w-3 mr-1" />
                Our Locations
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Where We Work
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We have offices across the US and support remote work globally
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {offices.map((office) => (
                <Card key={office.city} className="border-none shadow-lg hover:shadow-xl transition-shadow text-center">
                  <CardContent className="pt-6">
                    <div className="text-6xl mb-4">{office.image}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {office.city}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{office.state}</p>
                    <p className="text-xs text-gray-500 mb-3">{office.address}</p>
                    <p className="text-sm text-gray-600">
                      {office.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Diversity & Inclusion */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                <HeartHandshake className="h-3 w-3 mr-1" />
                Diversity, Equity & Inclusion
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Building a Diverse & Inclusive Workplace
              </h2>
              <div className="prose prose-lg text-gray-600 mx-auto">
                <p className="mb-4">
                  At LexiScan AI, we believe that diverse teams build better products and make better decisions. 
                  We're committed to creating an inclusive workplace where people of all backgrounds, identities, 
                  and experiences feel valued and empowered to do their best work.
                </p>
                <p className="mb-4">
                  We actively work to eliminate bias in our hiring and promotion processes, ensure pay equity 
                  across all roles, and foster a culture of belonging where everyone can bring their authentic 
                  selves to work.
                </p>
                <p className="mb-6">
                  We're proud to be an equal opportunity employer and welcome applications from candidates of 
                  all backgrounds. We particularly encourage applications from women, people of color, LGBTQ+ 
                  individuals, people with disabilities, and veterans.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Badge className="px-4 py-2">Equal Opportunity Employer</Badge>
                <Badge className="px-4 py-2">Pay Equity Certified</Badge>
                <Badge className="px-4 py-2">Family Friendly</Badge>
                <Badge className="px-4 py-2">Remote Friendly</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Make an Impact?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join our team and help build the future of legal technology. 
                We're looking for passionate people who want to make a difference.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="#positions">
                  <Button size="lg" variant="secondary" className="group bg-white hover:bg-gray-100">
                    View All Open Positions
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 bg-white/5">
                    Get in Touch
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-blue-200 mt-6">
                <CheckCircle className="inline h-4 w-4 mr-1" />
                Equal Opportunity Employer • Remote Options • Competitive Benefits
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

