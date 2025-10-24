"use client"

import * as React from "react"
import { useForm, UseFormReturn, FieldValues, DefaultValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EnhancedFormField, type FieldType, type SelectOption } from "./FormField"
import { MultiSelect, type MultiSelectOption } from "./MultiSelect"
import { DateRangePicker } from "./DateRangePicker"
import { FileUploadZone } from "./FileUploadZone"
import { RichTextEditor } from "./RichTextEditor"
import { Loader2 } from "lucide-react"

/**
 * FormBuilder - Enterprise dynamic form generation component
 * 
 * The most powerful component for building complex forms dynamically from configuration.
 * Supports all field types, validation, conditional logic, multi-step forms,
 * and more.
 * 
 * Features:
 * - Dynamic form generation from config
 * - All field types (text, select, file upload, rich text, etc.)
 * - Zod schema validation
 * - Conditional field visibility
 * - Multi-step/wizard forms
 * - Form sections
 * - Custom field rendering
 * - Auto-save
 * - Loading states
 * - Success/error handling
 * 
 * @example
 * const fields: FormFieldConfig[] = [
 *   {
 *     name: "email",
 *     label: "Email Address",
 *     type: "email",
 *     required: true,
 *     validation: z.string().email()
 *   },
 *   {
 *     name: "bio",
 *     label: "Biography",
 *     type: "richtext",
 *     description: "Tell us about yourself"
 *   }
 * ]
 * 
 * <FormBuilder
 *   fields={fields}
 *   onSubmit={async (data) => {
 *     await saveProfile(data)
 *   }}
 *   submitText="Save Profile"
 * />
 */

export type FormFieldType =
  | FieldType
  | "richtext"
  | "file"
  | "multiselect"
  | "daterange"
  | "section"
  | "custom"

export interface FormFieldConfig<T = unknown> {
  // Basic config
  name: string
  label?: string
  type: FormFieldType
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean

  // Validation
  validation?: z.ZodTypeAny
  validate?: (value: unknown, formValues: FieldValues) => boolean | string | Promise<boolean | string>

  // Options (for select, multiselect)
  options?: SelectOption[] | MultiSelectOption[]

  // Conditional logic
  visible?: (values: FieldValues) => boolean
  dependencies?: string[] // Fields that affect this field's visibility/options

  // Field-specific props
  rows?: number // textarea
  maxLength?: number
  min?: number | string
  max?: number | string
  accept?: Record<string, string[]> // file upload
  maxFiles?: number
  maxSize?: number
  showPreview?: boolean
  multiple?: boolean

  // Custom rendering
  render?: (props: FormFieldRenderProps<T>) => React.ReactNode

  // Section-specific (for type: "section")
  fields?: FormFieldConfig[]
  collapsible?: boolean
  defaultExpanded?: boolean

  // Styling
  className?: string
  fieldClassName?: string

  // Grid layout
  col?: number // Grid column span (1-12)
  colSpan?: "full" | "half" | "third" | "quarter"
}

export interface FormFieldRenderProps<T = unknown> {
  field: FormFieldConfig<T>
  form: UseFormReturn<FieldValues>
  value: unknown
  onChange: (value: unknown) => void
  error?: string
}

export interface FormSection {
  title?: string
  description?: string
  fields: FormFieldConfig[]
  collapsible?: boolean
  defaultExpanded?: boolean
}

export interface FormStep {
  title: string
  description?: string
  fields: FormFieldConfig[]
  validationSchema?: z.ZodObject<Record<string, z.ZodTypeAny>>
}

export interface FormBuilderProps<T extends FieldValues = FieldValues> {
  // Form configuration
  fields?: FormFieldConfig[]
  sections?: FormSection[]
  steps?: FormStep[]

  // Schema and validation
  schema?: z.ZodObject<Record<string, z.ZodTypeAny>>
  defaultValues?: DefaultValues<T>

  // Submit handling
  onSubmit: (data: T) => Promise<void> | void
  onError?: (errors: Record<string, unknown>) => void
  onChange?: (values: T) => void

  // UI customization
  title?: string
  description?: string
  submitText?: string
  cancelText?: string
  onCancel?: () => void
  layout?: "single" | "two-column" | "grid"
  className?: string

  // States
  isLoading?: boolean
  disabled?: boolean

  // Multi-step
  showStepIndicator?: boolean
  allowStepNavigation?: boolean

  // Other
  autoSave?: boolean
  autoSaveDelay?: number
  onAutoSave?: (values: T) => void
}

export function FormBuilder<T extends FieldValues = FieldValues>({
  fields: singleFields,
  sections: formSections,
  steps,
  schema,
  defaultValues,
  onSubmit,
  onError,
  onChange,
  title,
  description,
  submitText = "Submit",
  cancelText = "Cancel",
  onCancel,
  layout = "single",
  className,
  isLoading: externalLoading = false,
  disabled = false,
  showStepIndicator = true,
  allowStepNavigation = true,
  autoSave = false,
  autoSaveDelay = 1000,
  onAutoSave,
}: FormBuilderProps<T>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(0)
  const autoSaveTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  // Determine form mode
  const isMultiStep = Boolean(steps && steps.length > 1)
  const isSectioned = Boolean(formSections)
  const isSingleForm = Boolean(singleFields)

  // Setup form
  const form = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode: "onChange",
  })

  const { handleSubmit, watch, formState: { errors } } = form

  // Watch for changes (for auto-save and onChange)
  React.useEffect(() => {
    const subscription = watch((values) => {
      onChange?.(values as T)

      if (autoSave && onAutoSave) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current)
        }
        autoSaveTimerRef.current = setTimeout(() => {
          onAutoSave(values as T)
        }, autoSaveDelay)
      }
    })

    return () => {
      subscription.unsubscribe()
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [watch, onChange, autoSave, onAutoSave, autoSaveDelay])

  const onSubmitHandler = async (data: T) => {
    if (isMultiStep && currentStep < steps!.length - 1) {
      // Move to next step
      setCurrentStep(currentStep + 1)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      onError?.(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormFieldConfig, _fieldIndex: number) => {
    const formValues = form.watch()
    
    // Check visibility
    if (field.visible && !field.visible(formValues)) {
      return null
    }

    // Section type
    if (field.type === "section") {
      return (
        <FormSectionComponent
          key={field.name}
          title={field.label}
          description={field.description}
          collapsible={field.collapsible}
          defaultExpanded={field.defaultExpanded}
          className={field.className}
        >
          {field.fields?.map((subField, subIndex) =>
            renderField(subField, subIndex)
          )}
        </FormSectionComponent>
      )
    }

    // Custom render
    if (field.render) {
      return (
        <div key={field.name} className={cn(getFieldGridClass(field), field.fieldClassName)}>
          {field.render({
            field,
            form: form as unknown as UseFormReturn<FieldValues>,
            value: form.watch(field.name as never),
            onChange: (value) => form.setValue(field.name as never, value as never),
            error: errors[field.name]?.message as string,
          })}
        </div>
      )
    }

    // Multi-select
    if (field.type === "multiselect") {
      const value = form.watch(field.name as never) as unknown as string[] | undefined
      return (
        <div key={field.name} className={cn(getFieldGridClass(field), field.fieldClassName, field.className)}>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {field.label}
            {field.required && <span className="ml-1 text-destructive">*</span>}
          </label>
          <MultiSelect
            options={(field.options as MultiSelectOption[]) || []}
            value={value}
            onChange={(value) => form.setValue(field.name as never, value as never)}
            placeholder={field.placeholder}
            disabled={field.disabled || disabled}
            maxCount={field.maxFiles}
          />
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          {errors[field.name] && <p className="text-sm font-medium text-destructive">{String((errors[field.name] as { message?: string })?.message || "")}</p>}
        </div>
      )
    }

    // Date range
    if (field.type === "daterange") {
      const value = form.watch(field.name as never) as unknown as { from: Date | undefined; to: Date | undefined } | undefined
      return (
        <div key={field.name} className={cn(getFieldGridClass(field), field.fieldClassName, field.className)}>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {field.label}
            {field.required && <span className="ml-1 text-destructive">*</span>}
          </label>
          <DateRangePicker
            value={value}
            onChange={(value) => form.setValue(field.name as never, value as never)}
            placeholder={field.placeholder}
            disabled={field.disabled || disabled}
          />
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          {errors[field.name] && <p className="text-sm font-medium text-destructive">{String((errors[field.name] as { message?: string })?.message || "")}</p>}
        </div>
      )
    }

    // File upload
    if (field.type === "file") {
      const value = form.watch(field.name as never) as unknown as File[] | undefined
      return (
        <div key={field.name} className={cn(getFieldGridClass(field), field.fieldClassName, field.className)}>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {field.label}
            {field.required && <span className="ml-1 text-destructive">*</span>}
          </label>
          <FileUploadZone
            accept={field.accept}
            maxFiles={field.maxFiles}
            maxSize={field.maxSize}
            value={value}
            onChange={(value) => form.setValue(field.name as never, value as never)}
            disabled={field.disabled || disabled}
            showPreview={field.showPreview}
          />
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          {errors[field.name] && <p className="text-sm font-medium text-destructive">{String((errors[field.name] as { message?: string })?.message || "")}</p>}
        </div>
      )
    }

    // Rich text
    if (field.type === "richtext") {
      const value = form.watch(field.name as never) as unknown as string | undefined
      return (
        <div key={field.name} className={cn(getFieldGridClass(field), field.fieldClassName, field.className)}>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {field.label}
            {field.required && <span className="ml-1 text-destructive">*</span>}
          </label>
          <RichTextEditor
            value={value}
            onChange={(value) => form.setValue(field.name as never, value as never)}
            placeholder={field.placeholder}
            disabled={field.disabled || disabled}
            readOnly={field.readOnly}
            maxLength={field.maxLength}
          />
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          {errors[field.name] && <p className="text-sm font-medium text-destructive">{String((errors[field.name] as { message?: string })?.message || "")}</p>}
        </div>
      )
    }

    // Standard field
    return (
      <div key={field.name} className={cn(getFieldGridClass(field), field.fieldClassName)}>
        <EnhancedFormField
          form={form}
          name={field.name as never}
          type={field.type as FieldType}
          label={field.label}
          placeholder={field.placeholder}
          description={field.description}
          required={field.required}
          disabled={field.disabled || disabled}
          readOnly={field.readOnly}
          options={field.options as SelectOption[]}
          validate={field.validate ? (value: unknown) => field.validate!(value, formValues) : undefined}
          min={field.min}
          max={field.max}
          rows={field.rows}
          maxLength={field.maxLength}
          className={field.className}
        />
      </div>
    )
  }

  const getFieldGridClass = (field: FormFieldConfig) => {
    if (layout === "single") return "w-full"
    
    if (field.colSpan === "full") return "col-span-12"
    if (field.colSpan === "half") return "col-span-12 md:col-span-6"
    if (field.colSpan === "third") return "col-span-12 md:col-span-4"
    if (field.colSpan === "quarter") return "col-span-12 md:col-span-3"
    
    if (field.col) return `col-span-12 md:col-span-${field.col}`
    
    if (layout === "two-column") return "col-span-12 md:col-span-6"
    if (layout === "grid") return "col-span-12 md:col-span-4"
    
    return "col-span-12"
  }

  const renderFormContent = () => {
    let fieldsToRender: FormFieldConfig[] = []

    if (isMultiStep && steps) {
      fieldsToRender = steps[currentStep].fields
    } else if (isSectioned && formSections) {
      return formSections.map((section, index) => (
        <FormSectionComponent
          key={index}
          title={section.title}
          description={section.description}
          collapsible={section.collapsible}
          defaultExpanded={section.defaultExpanded}
        >
          <div className={cn(
            layout === "single" ? "space-y-4" : "grid gap-4",
            layout === "two-column" && "grid-cols-12",
            layout === "grid" && "grid-cols-12"
          )}>
            {section.fields.map((field, fieldIndex) => renderField(field, fieldIndex))}
          </div>
        </FormSectionComponent>
      ))
    } else if (isSingleForm && singleFields) {
      fieldsToRender = singleFields
    }

    return (
      <div className={cn(
        layout === "single" ? "space-y-4" : "grid gap-4",
        layout === "two-column" && "grid-cols-12",
        layout === "grid" && "grid-cols-12"
      )}>
        {fieldsToRender.map((field, index) => renderField(field, index))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      {(title || description) && (
        <div>
          {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
          {description && <p className="text-muted-foreground mt-2">{description}</p>}
        </div>
      )}

      {/* Step indicator */}
      {isMultiStep && showStepIndicator && steps && (
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={allowStepNavigation ? setCurrentStep : undefined}
        />
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
          {renderFormContent()}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || externalLoading}
              >
                {cancelText}
              </Button>
            )}
            
            {isMultiStep && currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isSubmitting || externalLoading}
              >
                Previous
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={isSubmitting || externalLoading || disabled}
            >
              {(isSubmitting || externalLoading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isMultiStep && currentStep < steps!.length - 1 ? "Next" : submitText}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

/**
 * FormSectionComponent - Collapsible form section
 */

interface FormSectionComponentProps {
  title?: string
  description?: string
  collapsible?: boolean
  defaultExpanded?: boolean
  className?: string
  children: React.ReactNode
}

function FormSectionComponent({
  title,
  description,
  collapsible = false,
  defaultExpanded = true,
  className,
  children,
}: FormSectionComponentProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

  if (!title) {
    return <div className={className}>{children}</div>
  }

  return (
    <Card className={className}>
      <CardHeader
        className={cn(collapsible && "cursor-pointer")}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {collapsible && (
            <Button variant="ghost" size="sm">
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          )}
        </div>
      </CardHeader>
      {(!collapsible || isExpanded) && (
        <CardContent>{children}</CardContent>
      )}
    </Card>
  )
}

/**
 * StepIndicator - Multi-step form progress indicator
 */

interface StepIndicatorProps {
  steps: FormStep[]
  currentStep: number
  onStepClick?: (step: number) => void
}

function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, stepIndex) => (
        <React.Fragment key={stepIndex}>
          <div
            className={cn(
              "flex items-center",
              onStepClick && "cursor-pointer"
            )}
            onClick={() => onStepClick?.(stepIndex)}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                stepIndex === currentStep && "border-primary bg-primary text-primary-foreground",
                stepIndex < currentStep && "border-primary bg-primary/20 text-primary",
                stepIndex > currentStep && "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {stepIndex + 1}
            </div>
            <div className="ml-4">
              <p className={cn(
                "text-sm font-medium",
                stepIndex === currentStep ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground">{step.description}</p>
              )}
            </div>
          </div>
          {stepIndex < steps.length - 1 && (
            <Separator className="flex-1 mx-4" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

