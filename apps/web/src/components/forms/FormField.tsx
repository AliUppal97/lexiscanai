"use client"

import * as React from "react"
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField as BaseFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

/**
 * FormField - Enterprise-grade reusable form field component
 * 
 * A comprehensive form field wrapper that supports multiple input types,
 * validation, descriptions, and full integration with react-hook-form.
 * 
 * Features:
 * - Multiple field types (text, email, password, number, textarea, select, checkbox, switch)
 * - Built-in validation support
 * - Accessible with ARIA labels
 * - Customizable styling
 * - Helper text and error messages
 * - Required field indicators
 * - Disabled and readonly states
 * 
 * @example
 * // Text input
 * <EnhancedFormField
 *   form={form}
 *   name="email"
 *   label="Email Address"
 *   type="email"
 *   placeholder="john@example.com"
 *   description="We'll never share your email"
 *   required
 * />
 * 
 * @example
 * // Select dropdown
 * <EnhancedFormField
 *   form={form}
 *   name="role"
 *   label="Role"
 *   type="select"
 *   options={[
 *     { label: "Admin", value: "admin" },
 *     { label: "User", value: "user" }
 *   ]}
 * />
 */

export type FieldType = 
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search"
  | "textarea"
  | "select"
  | "checkbox"
  | "switch"
  | "date"
  | "time"
  | "datetime-local"

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface EnhancedFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  // React Hook Form props
  form: UseFormReturn<TFieldValues>
  name: TName
  
  // Field configuration
  type?: FieldType
  label?: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  
  // Validation
  validate?: (value: unknown) => boolean | string | Promise<boolean | string>
  
  // Select options
  options?: SelectOption[]
  
  // Styling
  className?: string
  inputClassName?: string
  labelClassName?: string
  
  // Input attributes
  min?: number | string
  max?: number | string
  step?: number | string
  rows?: number
  maxLength?: number
  pattern?: string
  autoComplete?: string
  autoFocus?: boolean
  
  // Checkbox/Switch specific
  checkboxLabel?: string
  
  // Callbacks
  onChange?: (value: unknown) => void
  onBlur?: (e: React.FocusEvent) => void
  onFocus?: (e: React.FocusEvent) => void
}

export function EnhancedFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  form,
  name,
  type = "text",
  label,
  placeholder,
  description,
  required = false,
  disabled = false,
  readOnly = false,
  validate,
  options = [],
  className,
  inputClassName,
  labelClassName,
  min,
  max,
  step,
  rows = 4,
  maxLength,
  pattern,
  autoComplete,
  autoFocus,
  checkboxLabel,
  onChange,
  onBlur,
  onFocus,
}: EnhancedFormFieldProps<TFieldValues, TName>) {
  return (
    <BaseFormField
      control={form.control}
      name={name}
      rules={{
        required: required ? `${label || name} is required` : undefined,
        validate,
      }}
      render={({ field }) => (
        <FormItem className={cn(className)}>
          {label && type !== "checkbox" && type !== "switch" && (
            <FormLabel className={cn(labelClassName)}>
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
          )}
          
          <FormControl>
            {renderField({
              field,
              type,
              placeholder,
              disabled,
              readOnly,
              options,
              inputClassName,
              min,
              max,
              step,
              rows,
              maxLength,
              pattern,
              autoComplete,
              autoFocus,
              label,
              checkboxLabel,
              required,
              labelClassName,
              onChange,
              onBlur,
              onFocus,
            })}
          </FormControl>
          
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Helper function to render different field types
interface RenderFieldProps {
  field: {
    name: string
    value: unknown
    onChange: (value: unknown) => void
    onBlur: () => void
  }
  type: FieldType
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  options?: SelectOption[]
  inputClassName?: string
  min?: number | string
  max?: number | string
  step?: number | string
  rows?: number
  maxLength?: number
  pattern?: string
  autoComplete?: string
  autoFocus?: boolean
  label?: string
  checkboxLabel?: string
  required?: boolean
  labelClassName?: string
  onChange?: (value: unknown) => void
  onBlur?: (e: React.FocusEvent) => void
  onFocus?: (e: React.FocusEvent) => void
}

function renderField({
  field,
  type,
  placeholder,
  disabled,
  readOnly,
  options,
  inputClassName,
  min,
  max,
  step,
  rows,
  maxLength,
  pattern,
  autoComplete,
  autoFocus,
  label,
  checkboxLabel,
  required,
  labelClassName,
  onChange,
  onBlur,
  onFocus,
}: RenderFieldProps) {
  const handleChange = (value: unknown) => {
    field.onChange(value)
    onChange?.(value)
  }

  const handleBlur = (e: React.FocusEvent) => {
    field.onBlur()
    onBlur?.(e)
  }

  const handleFocus = (e: React.FocusEvent) => {
    onFocus?.(e)
  }

  switch (type) {
    case "textarea":
      return (
        <Textarea
          {...field}
          value={String(field.value || "")}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          maxLength={maxLength}
          autoFocus={autoFocus}
          className={cn(inputClassName)}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onFocus={handleFocus}
        />
      )

    case "select":
      return (
        <Select
          value={String(field.value || "")}
          onValueChange={handleChange}
          disabled={disabled}
        >
          <SelectTrigger className={cn(inputClassName)} autoFocus={autoFocus}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option: SelectOption) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case "checkbox":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={Boolean(field.value)}
            onCheckedChange={handleChange}
            disabled={disabled}
            id={field.name}
            autoFocus={autoFocus}
          />
          <label
            htmlFor={field.name}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              labelClassName
            )}
          >
            {checkboxLabel || label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        </div>
      )

    case "switch":
      return (
        <div className="flex items-center justify-between">
          {(label || checkboxLabel) && (
            <label
              htmlFor={field.name}
              className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                labelClassName
              )}
            >
              {checkboxLabel || label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </label>
          )}
          <Switch
            checked={Boolean(field.value)}
            onCheckedChange={handleChange}
            disabled={disabled}
            id={field.name}
            autoFocus={autoFocus}
          />
        </div>
      )

    default:
      return (
        <Input
          {...field}
          value={String(field.value || "")}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          min={min}
          max={max}
          step={step}
          maxLength={maxLength}
          pattern={pattern}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={cn(inputClassName)}
          onChange={(e) => {
            const value = type === "number" ? parseFloat(e.target.value) : e.target.value
            handleChange(value)
          }}
          onBlur={handleBlur}
          onFocus={handleFocus}
        />
      )
  }
}

// Export display name
EnhancedFormField.displayName = "EnhancedFormField"

/**
 * Quick field creation helpers
 */

export interface QuickFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<EnhancedFormFieldProps<TFieldValues, TName>, "type"> {}

export const TextField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: QuickFieldProps<TFieldValues, TName>) => (
  <EnhancedFormField {...props} type="text" />
)

export const EmailField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: QuickFieldProps<TFieldValues, TName>) => (
  <EnhancedFormField {...props} type="email" autoComplete="email" />
)

export const PasswordField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: QuickFieldProps<TFieldValues, TName>) => (
  <EnhancedFormField {...props} type="password" autoComplete="current-password" />
)

export const NumberField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: QuickFieldProps<TFieldValues, TName>) => (
  <EnhancedFormField {...props} type="number" />
)

export const TextAreaField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: QuickFieldProps<TFieldValues, TName>) => (
  <EnhancedFormField {...props} type="textarea" />
)

export const SelectField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: QuickFieldProps<TFieldValues, TName>) => (
  <EnhancedFormField {...props} type="select" />
)

export const CheckboxField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: QuickFieldProps<TFieldValues, TName>) => (
  <EnhancedFormField {...props} type="checkbox" />
)

export const SwitchField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: QuickFieldProps<TFieldValues, TName>) => (
  <EnhancedFormField {...props} type="switch" />
)

