/**
 * LexiScan AI - Enterprise Form Components Library
 * 
 * A comprehensive collection of production-ready form components for building
 * complex, accessible, and type-safe forms in enterprise applications.
 * 
 * @module forms
 * @author LexiScan AI Team
 * @since 1.0.0
 */

// ============================================================================
// FORM FIELD - Enhanced Reusable Form Field
// ============================================================================

/**
 * EnhancedFormField - Comprehensive form field wrapper
 * 
 * Supports all standard input types with built-in validation,
 * error handling, and accessibility features.
 */
export {
  EnhancedFormField,
  TextField,
  EmailField,
  PasswordField,
  NumberField,
  TextAreaField,
  SelectField,
  CheckboxField,
  SwitchField,
  type EnhancedFormFieldProps,
  type FieldType,
  type SelectOption,
} from "./FormField"

// ============================================================================
// FORM VALIDATION - Zod Schemas and Utilities
// ============================================================================

/**
 * FormValidation - Pre-built validation schemas and utilities
 * 
 * Common validation patterns for enterprise applications including
 * email, password, phone, credit card, and more.
 */
export {
  // Common schemas
  emailSchema,
  passwordSchema,
  simplePasswordSchema,
  nameSchema,
  phoneSchema,
  urlSchema,
  organizationSchema,
  zipCodeSchema,
  creditCardSchema,
  cvvSchema,
  dateSchema,
  timeSchema,
  ipAddressSchema,
  usernameSchema,
  slugSchema,
  ageSchema,
  percentageSchema,
  priceSchema,
  
  // Composite schemas
  addressSchema,
  contactSchema,
  loginSchema,
  registrationSchema,
  passwordResetSchema,
  profileUpdateSchema,
  changePasswordSchema,
  
  // Utility functions
  calculatePasswordStrength,
  sanitizeInput,
  validateDateRange,
  formatValidationErrors,
  createDynamicSchema,
  
  // Helper schemas
  fileSizeSchema,
  fileTypeSchema,
  noProfanitySchema,
  createUniqueSchema,
  
  // Types
  type LoginFormData,
  type RegistrationFormData,
  type PasswordResetFormData,
  type ProfileUpdateFormData,
  type ChangePasswordFormData,
  type AddressFormData,
  type ContactFormData,
} from "./FormValidation"

// ============================================================================
// MULTI SELECT - Multi-Option Selector
// ============================================================================

/**
 * MultiSelect - Advanced multi-select with search and filtering
 * 
 * Supports grouping, async loading, and dynamic option creation.
 * Perfect for tags, roles, categories, and more.
 */
export {
  MultiSelect,
  MultiSelectCreatable,
  MultiSelectAsync,
  type MultiSelectOption,
  type MultiSelectProps,
} from "./MultiSelect"

// ============================================================================
// DATE RANGE PICKER - Date Range Selection
// ============================================================================

/**
 * DateRangePicker - Powerful date range selection
 * 
 * Includes preset ranges, custom selection, and keyboard navigation.
 * Ideal for analytics, reports, and filtering.
 */
export {
  DateRangePicker,
  DateRangeInput,
  type DateRange,
  type DateRangePreset,
  type DateRangePickerProps,
} from "./DateRangePicker"

// ============================================================================
// FILE UPLOAD ZONE - Drag & Drop File Upload
// ============================================================================

/**
 * FileUploadZone - Enterprise file upload component
 * 
 * Supports drag & drop, validation, progress tracking, and preview.
 * Multiple variants for different use cases.
 */
export {
  FileUploadZone,
  type UploadedFile,
  type FileUploadZoneProps,
  // Common accept configurations
  ACCEPT_IMAGES,
  ACCEPT_DOCUMENTS,
  ACCEPT_LEGAL_DOCUMENTS,
  ACCEPT_MEDIA,
} from "./FileUploadZone"

// ============================================================================
// RICH TEXT EDITOR - WYSIWYG Document Editing
// ============================================================================

/**
 * RichTextEditor - Full-featured text editor
 * 
 * WYSIWYG editor with formatting, links, images, and more.
 * Includes utilities for content manipulation.
 */
export {
  RichTextEditor,
  RichTextViewer,
  useRichTextEditor,
  sanitizeHtml,
  htmlToPlainText,
  getWordCount,
  type RichTextEditorProps,
  type RichTextViewerProps,
  type UseRichTextEditorOptions,
} from "./RichTextEditor"

// ============================================================================
// FORM BUILDER - Dynamic Form Generation
// ============================================================================

/**
 * FormBuilder - The ultimate form building component
 * 
 * Build complex forms dynamically from configuration.
 * Supports multi-step forms, conditional fields, sections, and more.
 */
export {
  FormBuilder,
  type FormFieldConfig,
  type FormFieldRenderProps,
  type FormSection,
  type FormStep,
  type FormBuilderProps,
  type FormFieldType,
} from "./FormBuilder"

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * @example Basic Form Field
 * ```tsx
 * import { EnhancedFormField, emailSchema } from '@/components/forms'
 * import { useForm } from 'react-hook-form'
 * import { zodResolver } from '@hookform/resolvers/zod'
 * import { z } from 'zod'
 * 
 * const schema = z.object({
 *   email: emailSchema,
 *   password: z.string().min(8),
 * })
 * 
 * function LoginForm() {
 *   const form = useForm({
 *     resolver: zodResolver(schema),
 *   })
 * 
 *   return (
 *     <Form {...form}>
 *       <EnhancedFormField
 *         form={form}
 *         name="email"
 *         type="email"
 *         label="Email"
 *         required
 *       />
 *       <EnhancedFormField
 *         form={form}
 *         name="password"
 *         type="password"
 *         label="Password"
 *         required
 *       />
 *     </Form>
 *   )
 * }
 * ```
 */

/**
 * @example Multi-Select with Search
 * ```tsx
 * import { MultiSelect } from '@/components/forms'
 * 
 * const roles = [
 *   { label: "Admin", value: "admin" },
 *   { label: "Lawyer", value: "lawyer" },
 *   { label: "Paralegal", value: "paralegal" },
 * ]
 * 
 * function RoleSelector() {
 *   const [selected, setSelected] = useState<string[]>([])
 *   
 *   return (
 *     <MultiSelect
 *       options={roles}
 *       value={selected}
 *       onChange={setSelected}
 *       placeholder="Select roles..."
 *     />
 *   )
 * }
 * ```
 */

/**
 * @example Date Range Picker
 * ```tsx
 * import { DateRangePicker } from '@/components/forms'
 * import { subDays } from 'date-fns'
 * 
 * function AnalyticsDashboard() {
 *   const [dateRange, setDateRange] = useState({
 *     from: subDays(new Date(), 7),
 *     to: new Date(),
 *   })
 *   
 *   return (
 *     <DateRangePicker
 *       value={dateRange}
 *       onChange={setDateRange}
 *       placeholder="Select date range"
 *     />
 *   )
 * }
 * ```
 */

/**
 * @example File Upload Zone
 * ```tsx
 * import { FileUploadZone, ACCEPT_LEGAL_DOCUMENTS } from '@/components/forms'
 * 
 * function DocumentUpload() {
 *   const handleUpload = async (files: File[]) => {
 *     const formData = new FormData()
 *     files.forEach(file => formData.append('files', file))
 *     await fetch('/api/upload', { method: 'POST', body: formData })
 *   }
 *   
 *   return (
 *     <FileUploadZone
 *       accept={ACCEPT_LEGAL_DOCUMENTS}
 *       maxSize={10 * 1024 * 1024} // 10MB
 *       maxFiles={5}
 *       onUpload={handleUpload}
 *       description="Upload PDF or Word documents"
 *     />
 *   )
 * }
 * ```
 */

/**
 * @example Rich Text Editor
 * ```tsx
 * import { RichTextEditor, useRichTextEditor } from '@/components/forms'
 * 
 * function DocumentEditor() {
 *   const editor = useRichTextEditor({
 *     initialValue: '<p>Start writing...</p>',
 *     maxLength: 5000,
 *   })
 *   
 *   return (
 *     <div>
 *       <RichTextEditor
 *         value={editor.value}
 *         onChange={editor.setValue}
 *         placeholder="Write your document..."
 *         showCharCount
 *       />
 *       <p>Word count: {getWordCount(editor.value)}</p>
 *     </div>
 *   )
 * }
 * ```
 */

/**
 * @example Dynamic Form Builder
 * ```tsx
 * import { FormBuilder, type FormFieldConfig } from '@/components/forms'
 * import { emailSchema, passwordSchema } from '@/components/forms'
 * 
 * const fields: FormFieldConfig[] = [
 *   {
 *     name: "email",
 *     label: "Email Address",
 *     type: "email",
 *     required: true,
 *     validation: emailSchema,
 *   },
 *   {
 *     name: "password",
 *     label: "Password",
 *     type: "password",
 *     required: true,
 *     validation: passwordSchema,
 *   },
 *   {
 *     name: "role",
 *     label: "Role",
 *     type: "select",
 *     options: [
 *       { label: "Admin", value: "admin" },
 *       { label: "User", value: "user" },
 *     ],
 *   },
 *   {
 *     name: "bio",
 *     label: "Biography",
 *     type: "richtext",
 *     description: "Tell us about yourself",
 *   },
 * ]
 * 
 * function SignupForm() {
 *   const handleSubmit = async (data: any) => {
 *     await fetch('/api/signup', {
 *       method: 'POST',
 *       body: JSON.stringify(data),
 *     })
 *   }
 *   
 *   return (
 *     <FormBuilder
 *       fields={fields}
 *       onSubmit={handleSubmit}
 *       title="Create Account"
 *       submitText="Sign Up"
 *       layout="single"
 *     />
 *   )
 * }
 * ```
 */

/**
 * @example Multi-Step Form
 * ```tsx
 * import { FormBuilder, type FormStep } from '@/components/forms'
 * 
 * const steps: FormStep[] = [
 *   {
 *     title: "Personal Info",
 *     fields: [
 *       { name: "firstName", label: "First Name", type: "text", required: true },
 *       { name: "lastName", label: "Last Name", type: "text", required: true },
 *       { name: "email", label: "Email", type: "email", required: true },
 *     ],
 *   },
 *   {
 *     title: "Organization",
 *     fields: [
 *       { name: "orgName", label: "Organization Name", type: "text", required: true },
 *       { name: "industry", label: "Industry", type: "select", options: [...] },
 *     ],
 *   },
 *   {
 *     title: "Preferences",
 *     fields: [
 *       { name: "notifications", label: "Email Notifications", type: "switch" },
 *       { name: "newsletter", label: "Subscribe to Newsletter", type: "checkbox" },
 *     ],
 *   },
 * ]
 * 
 * function OnboardingWizard() {
 *   return (
 *     <FormBuilder
 *       steps={steps}
 *       onSubmit={async (data) => await completeOnboarding(data)}
 *       title="Welcome to LexiScan AI"
 *       showStepIndicator
 *     />
 *   )
 * }
 * ```
 */

// ============================================================================
// INTEGRATION WITH CUSTOM HOOKS
// ============================================================================

/**
 * All form components integrate seamlessly with custom hooks
 * from @/hooks for data fetching, mutations, and state management.
 * 
 * @example Integrated Form with Hooks
 * ```tsx
 * import { FormBuilder } from '@/components/forms'
 * import { useProfile, useUpdateProfile } from '@/hooks'
 * 
 * function ProfileForm() {
 *   const { data: profile, isLoading } = useProfile()
 *   const { mutateAsync: updateProfile } = useUpdateProfile()
 *   
 *   if (isLoading) return <Loading />
 *   
 *   return (
 *     <FormBuilder
 *       fields={profileFields}
 *       defaultValues={profile}
 *       onSubmit={updateProfile}
 *       title="Edit Profile"
 *     />
 *   )
 * }
 * ```
 */

