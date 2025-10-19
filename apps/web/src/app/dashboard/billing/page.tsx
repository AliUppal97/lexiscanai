"use client"

import { useState } from "react"
import { 
  CreditCard, 
  Download, 
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  CreditCard as CardIcon,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const billingData = {
  currentPlan: {
    name: "Pro Plan",
    price: 99,
    period: "month",
    status: "active",
    nextBilling: "2024-02-15",
    documentsUsed: 1247,
    documentsLimit: 5000,
    features: [
      "Up to 5,000 documents per month",
      "Advanced AI analysis",
      "Priority support",
      "Team collaboration",
      "API access",
      "Custom integrations"
    ]
  },
  usage: {
    documents: { used: 1247, limit: 5000, percentage: 24.9 },
    apiCalls: { used: 15680, limit: 100000, percentage: 15.7 },
    storage: { used: 2.4, limit: 10, percentage: 24.0 }
  },
  invoices: [
    {
      id: "INV-2024-001",
      date: "2024-01-15",
      amount: 99.00,
      status: "paid",
      description: "Pro Plan - January 2024"
    },
    {
      id: "INV-2023-012",
      date: "2023-12-15",
      amount: 99.00,
      status: "paid",
      description: "Pro Plan - December 2023"
    },
    {
      id: "INV-2023-011",
      date: "2023-11-15",
      amount: 99.00,
      status: "paid",
      description: "Pro Plan - November 2023"
    },
    {
      id: "INV-2023-010",
      date: "2023-10-15",
      amount: 99.00,
      status: "paid",
      description: "Pro Plan - October 2023"
    }
  ],
  paymentMethods: [
    {
      id: "1",
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiryMonth: "12",
      expiryYear: "2025",
      isDefault: true
    },
    {
      id: "2",
      type: "card",
      last4: "5555",
      brand: "Mastercard",
      expiryMonth: "08",
      expiryYear: "2026",
      isDefault: false
    }
  ]
}

const plans = [
  {
    name: "Free",
    price: 0,
    period: "month",
    description: "Perfect for individuals getting started",
    features: [
      "Up to 100 documents per month",
      "Basic AI analysis",
      "Email support",
      "Standard processing speed"
    ],
    current: false,
    popular: false
  },
  {
    name: "Pro",
    price: 99,
    period: "month",
    description: "Ideal for growing teams and businesses",
    features: [
      "Up to 5,000 documents per month",
      "Advanced AI analysis",
      "Priority support",
      "Team collaboration",
      "API access",
      "Custom integrations"
    ],
    current: true,
    popular: true
  },
  {
    name: "Enterprise",
    price: 299,
    period: "month",
    description: "For large organizations with custom needs",
    features: [
      "Unlimited documents",
      "Premium AI analysis",
      "24/7 dedicated support",
      "Advanced team management",
      "Full API access",
      "Custom integrations",
      "SLA guarantee",
      "On-premise deployment"
    ],
    current: false,
    popular: false
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "paid":
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>
    case "pending":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case "failed":
      return <Badge variant="destructive">Failed</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

const getCardBrandIcon = (brand: string) => {
  switch (brand.toLowerCase()) {
    case "visa":
      return <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
    case "mastercard":
      return <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">M</div>
    default:
      return <CardIcon className="h-5 w-5 text-gray-400" />
  }
}

export default function BillingPage() {
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Usage</h1>
          <p className="text-gray-600">Manage your subscription, payment methods, and usage</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Invoices
          </Button>
          <Button size="sm" onClick={() => setIsUpgradeDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        </div>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {billingData.currentPlan.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{billingData.currentPlan.name}</h3>
                  <p className="text-gray-600">
                    ${billingData.currentPlan.price}/{billingData.currentPlan.period}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {billingData.currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Next billing date</span>
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-lg font-semibold">{billingData.currentPlan.nextBilling}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Documents this month</span>
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-lg font-semibold">
                  {billingData.currentPlan.documentsUsed.toLocaleString()} / {billingData.currentPlan.documentsLimit.toLocaleString()}
                </p>
                <Progress 
                  value={(billingData.currentPlan.documentsUsed / billingData.currentPlan.documentsLimit) * 100} 
                  className="h-2 mt-2" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          {/* Usage Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {billingData.usage.documents.used.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  of {billingData.usage.documents.limit.toLocaleString()} limit
                </p>
                <Progress value={billingData.usage.documents.percentage} className="h-2 mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {billingData.usage.apiCalls.used.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  of {billingData.usage.apiCalls.limit.toLocaleString()} limit
                </p>
                <Progress value={billingData.usage.apiCalls.percentage} className="h-2 mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {billingData.usage.storage.used} GB
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  of {billingData.usage.storage.limit} GB limit
                </p>
                <Progress value={billingData.usage.storage.percentage} className="h-2 mt-3" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your recent invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingData.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Online
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment methods and billing information</CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsAddPaymentDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingData.paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getCardBrandIcon(method.brand)}
                      <div>
                        <div className="font-medium">
                          {method.brand} •••• {method.last4}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </div>
                      </div>
                      {method.isDefault && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Plan Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Choose Your Plan</DialogTitle>
            <DialogDescription>
              Select the plan that best fits your needs. You can change or cancel anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-lg font-normal text-gray-500">/{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full mt-6" 
                    variant={plan.current ? "outline" : "default"}
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : "Select Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Payment Method Dialog */}
      <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new payment method to your account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input id="cardName" placeholder="John Doe" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddPaymentDialogOpen(false)}>
              Add Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

