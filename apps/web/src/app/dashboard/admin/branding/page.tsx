"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { 
  Palette, 
  Upload, 
  Save, 
  RotateCcw,
  Eye,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Monitor
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export default function AdminBrandingPage() {
  const [hasChanges, setHasChanges] = useState(false)
  const [primaryColor, setPrimaryColor] = useState("#3B82F6")
  const [secondaryColor, setSecondaryColor] = useState("#8B5CF6")

  const handleSave = () => {
    // Save branding changes
    setHasChanges(false)
  }

  const handleReset = () => {
    // Reset to defaults
    setPrimaryColor("#3B82F6")
    setSecondaryColor("#8B5CF6")
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branding Customization</h1>
          <p className="text-gray-600">Customize your organization&apos;s look and feel.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unsaved Changes</AlertTitle>
          <AlertDescription>
            You have unsaved branding changes. Click &quot;Save Changes&quot; to apply them.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="logo">Logo</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            
            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Organization Information</CardTitle>
                  <CardDescription>
                    Basic information about your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input id="orgName" placeholder="Acme Law Firm" onChange={() => setHasChanges(true)} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="orgTagline">Tagline</Label>
                    <Input id="orgTagline" placeholder="Excellence in Legal Services" onChange={() => setHasChanges(true)} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="orgDescription">Description</Label>
                    <Textarea 
                      id="orgDescription" 
                      placeholder="A brief description of your organization"
                      rows={3}
                      onChange={() => setHasChanges(true)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="orgWebsite">Website URL</Label>
                    <Input 
                      id="orgWebsite" 
                      type="url"
                      placeholder="https://www.acmelawfirm.com"
                      onChange={() => setHasChanges(true)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input 
                      id="supportEmail" 
                      type="email"
                      placeholder="support@acmelawfirm.com"
                      onChange={() => setHasChanges(true)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Brand Colors</CardTitle>
                  <CardDescription>
                    Customize your organization&apos;s color palette
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="primaryColor" 
                          type="color"
                          value={primaryColor}
                          onChange={(e) => {
                            setPrimaryColor(e.target.value)
                            setHasChanges(true)
                          }}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input 
                          value={primaryColor}
                          onChange={(e) => {
                            setPrimaryColor(e.target.value)
                            setHasChanges(true)
                          }}
                          className="flex-1 font-mono"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="secondaryColor" 
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => {
                            setSecondaryColor(e.target.value)
                            setHasChanges(true)
                          }}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input 
                          value={secondaryColor}
                          onChange={(e) => {
                            setSecondaryColor(e.target.value)
                            setHasChanges(true)
                          }}
                          className="flex-1 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <Label>Color Preview</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div 
                        className="h-24 rounded-lg border-2 flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                      >
                        Primary
                      </div>
                      <div 
                        className="h-24 rounded-lg border-2 flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: secondaryColor, borderColor: secondaryColor }}
                      >
                        Secondary
                      </div>
                      <div 
                        className="h-24 rounded-lg border-2 flex items-center justify-center text-white font-semibold"
                        style={{ 
                          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                          borderColor: primaryColor 
                        }}
                      >
                        Gradient
                      </div>
                    </div>
                  </div>
                  
                  <Alert>
                    <Palette className="h-4 w-4" />
                    <AlertDescription>
                      Colors will be applied to buttons, links, and other UI elements throughout the application.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Logo Tab */}
            <TabsContent value="logo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Logo & Images</CardTitle>
                  <CardDescription>
                    Upload your organization&apos;s logo and favicon
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Primary Logo</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drag and drop or click to upload
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        PNG, JPG or SVG (max. 2MB) • Recommended: 400x100px
                      </p>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Dark Mode Logo (Optional)</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center bg-gray-900">
                      <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-300 mb-2">
                        Upload a version for dark backgrounds
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        PNG, JPG or SVG (max. 2MB)
                      </p>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Favicon</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload favicon
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        ICO, PNG (16x16 or 32x32)
                      </p>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Email Tab */}
            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Email Branding</CardTitle>
                  <CardDescription>
                    Customize email templates and signatures
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailFrom">From Name</Label>
                    <Input 
                      id="emailFrom" 
                      placeholder="Acme Law Firm"
                      onChange={() => setHasChanges(true)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emailReply">Reply-To Email</Label>
                    <Input 
                      id="emailReply" 
                      type="email"
                      placeholder="noreply@acmelawfirm.com"
                      onChange={() => setHasChanges(true)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emailFooter">Email Footer</Label>
                    <Textarea 
                      id="emailFooter" 
                      placeholder="© 2024 Acme Law Firm. All rights reserved."
                      rows={3}
                      onChange={() => setHasChanges(true)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Include Company Logo</Label>
                      <p className="text-sm text-gray-500">
                        Show your logo in email headers
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Custom Email Signature</Label>
                      <p className="text-sm text-gray-500">
                        Add a custom signature to all emails
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Custom Tab */}
            <TabsContent value="custom" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Custom CSS & Scripts</CardTitle>
                  <CardDescription>
                    Advanced customization options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Advanced Feature</AlertTitle>
                    <AlertDescription>
                      Only modify if you understand CSS and JavaScript. Invalid code may break your application.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customCss">Custom CSS</Label>
                    <Textarea 
                      id="customCss" 
                      placeholder="/* Your custom CSS here */"
                      rows={6}
                      className="font-mono text-xs"
                      onChange={() => setHasChanges(true)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customJs">Custom JavaScript</Label>
                    <Textarea 
                      id="customJs" 
                      placeholder="// Your custom JavaScript here"
                      rows={6}
                      className="font-mono text-xs"
                      onChange={() => setHasChanges(true)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Enable Custom Code</Label>
                      <p className="text-sm text-gray-500">
                        Apply custom CSS and JavaScript
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Live Preview
              </CardTitle>
              <CardDescription>
                See how your changes will look
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Preview Mode</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Monitor className="h-4 w-4 mr-2" />
                    Desktop
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile
                  </Button>
                </div>
              </div>
              
              {/* Preview Window */}
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-gradient-to-r p-4 text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold">Organization Name</div>
                      <div className="text-xs opacity-90">Your tagline here</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <Button 
                    className="w-full"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary Button
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    Secondary Button
                  </Button>
                  
                  <div className="text-sm space-y-2">
                    <p className="text-gray-600">Sample text and links:</p>
                    <a 
                      href="#" 
                      className="text-sm font-medium"
                      style={{ color: primaryColor }}
                    >
                      Link Example
                    </a>
                  </div>
                </div>
              </div>
              
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Preview is live! Changes will apply after saving.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

