"use client"

import { z } from "zod"

/**
 * FormValidation - Enterprise validation schemas and utilities
 * 
 * Provides reusable Zod schemas and validation utilities for common form fields
 * used in enterprise applications. Follows industry best practices for security
 * and data validation.
 * 
 * Features:
 * - Pre-built validation schemas
 * - Custom validators
 * - Error message customization
 * - Type-safe validation
 * - Async validation support
 * 
 * @example
 * import { emailSchema, passwordSchema } from '@/components/forms/FormValidation'
 * 
 * const loginSchema = z.object({
 *   email: emailSchema,
 *   password: passwordSchema,
 * })
 */

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

/**
 * Email validation
 * - Required
 * - Valid email format
 * - Max 255 characters
 */
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters")
  .toLowerCase()
  .trim()

/**
 * Password validation
 * - Min 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character"
  )

/**
 * Simple password (for less critical applications)
 * - Min 6 characters
 */
export const simplePasswordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password must be less than 128 characters")

/**
 * Name validation
 * - 2-50 characters
 * - Letters, spaces, hyphens, apostrophes
 */
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters")
  .regex(
    /^[a-zA-Z\s\-']+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  )
  .trim()

/**
 * Phone number validation (US format)
 * - 10 digits
 * - Optional country code
 */
export const phoneSchema = z
  .string()
  .regex(
    /^(\+1)?[\s.-]?\(?([0-9]{3})\)?[\s.-]?([0-9]{3})[\s.-]?([0-9]{4})$/,
    "Invalid phone number format (e.g., (555) 123-4567)"
  )
  .transform((val) => val.replace(/\D/g, "")) // Remove non-digits

/**
 * URL validation
 * - Valid URL format
 * - HTTP/HTTPS protocol
 */
export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .regex(/^https?:\/\//, "URL must start with http:// or https://")

/**
 * Organization/Company name
 * - 2-100 characters
 */
export const organizationSchema = z
  .string()
  .min(2, "Organization name must be at least 2 characters")
  .max(100, "Organization name must be less than 100 characters")
  .trim()

/**
 * ZIP/Postal code (US format)
 * - 5 digits or 5+4 format
 */
export const zipCodeSchema = z
  .string()
  .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code (e.g., 12345 or 12345-6789)")

/**
 * Credit card number
 * - 13-19 digits
 * - Luhn algorithm validation
 */
export const creditCardSchema = z
  .string()
  .regex(/^\d{13,19}$/, "Invalid credit card number")
  .refine((val) => luhnCheck(val), "Invalid credit card number")

/**
 * CVV validation
 * - 3 or 4 digits
 */
export const cvvSchema = z
  .string()
  .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits")

/**
 * Date validation (YYYY-MM-DD format)
 */
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
  .refine((val) => !isNaN(Date.parse(val)), "Invalid date")

/**
 * Time validation (HH:MM format)
 */
export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)")

/**
 * File size validation
 */
export const fileSizeSchema = (maxSizeMB: number) =>
  z
    .instanceof(File)
    .refine(
      (file) => file.size <= maxSizeMB * 1024 * 1024,
      `File size must be less than ${maxSizeMB}MB`
    )

/**
 * File type validation
 */
export const fileTypeSchema = (allowedTypes: string[]) =>
  z
    .instanceof(File)
    .refine(
      (file) => allowedTypes.includes(file.type),
      `File type must be one of: ${allowedTypes.join(", ")}`
    )

/**
 * IP address validation
 */
export const ipAddressSchema = z
  .string()
  .regex(
    /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/,
    "Invalid IP address"
  )

/**
 * Username validation
 * - 3-20 characters
 * - Letters, numbers, underscores, hyphens
 * - Must start with letter
 */
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be less than 20 characters")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_-]*$/,
    "Username must start with a letter and contain only letters, numbers, underscores, and hyphens"
  )

/**
 * Slug validation (URL-friendly string)
 * - Lowercase letters, numbers, hyphens
 */
export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(100, "Slug must be less than 100 characters")
  .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")

/**
 * Age validation
 * - Must be 18 or older
 */
export const ageSchema = z
  .number()
  .min(18, "Must be at least 18 years old")
  .max(120, "Invalid age")

/**
 * Percentage validation
 * - 0-100
 */
export const percentageSchema = z
  .number()
  .min(0, "Percentage must be at least 0")
  .max(100, "Percentage must be at most 100")

/**
 * Currency/Price validation
 * - Positive number with 2 decimal places
 */
export const priceSchema = z
  .number()
  .positive("Price must be positive")
  .multipleOf(0.01, "Price must have at most 2 decimal places")

// ============================================================================
// COMPOSITE SCHEMAS
// ============================================================================

/**
 * Address schema
 */
export const addressSchema = z.object({
  street: z.string().min(1, "Street address is required").max(100),
  street2: z.string().max(100).optional(),
  city: z.string().min(1, "City is required").max(50),
  state: z.string().min(2, "State is required").max(2),
  zipCode: zipCodeSchema,
  country: z.string().default("US"),
})

/**
 * Contact information schema
 */
export const contactSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
})

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

/**
 * Registration schema
 */
export const registrationSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    organizationName: organizationSchema.optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

/**
 * Password reset schema
 */
export const passwordResetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

/**
 * Profile update schema
 */
export const profileUpdateSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  website: urlSchema.optional(),
  location: z.string().max(100).optional(),
})

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Luhn algorithm for credit card validation
 */
function luhnCheck(cardNumber: string): boolean {
  let sum = 0
  let isEven = false

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

/**
 * Custom validation: Check if string contains profanity
 * (Placeholder - integrate with profanity filter library)
 */
export const noProfanitySchema = z
  .string()
  .refine(
    (val) => {
      // Integrate with profanity filter library
      // For now, basic check
      const profaneWords = ["badword1", "badword2"] // Replace with real library
      return !profaneWords.some((word) =>
        val.toLowerCase().includes(word.toLowerCase())
      )
    },
    { message: "Content contains inappropriate language" }
  )

/**
 * Custom validation: Async unique check (e.g., email uniqueness)
 */
export const createUniqueSchema = (
  checkFn: (value: string) => Promise<boolean>
) =>
  z.string().refine(checkFn, {
    message: "This value is already taken",
  })

/**
 * Custom validation: Password strength meter
 */
export function calculatePasswordStrength(password: string): {
  score: number
  label: string
  suggestions: string[]
} {
  let score = 0
  const suggestions: string[] = []

  // Length
  if (password.length >= 8) score += 1
  else suggestions.push("Use at least 8 characters")

  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // Complexity
  if (/[a-z]/.test(password)) score += 1
  else suggestions.push("Add lowercase letters")

  if (/[A-Z]/.test(password)) score += 1
  else suggestions.push("Add uppercase letters")

  if (/[0-9]/.test(password)) score += 1
  else suggestions.push("Add numbers")

  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else suggestions.push("Add special characters")

  // Penalize common patterns
  if (/(.)\1{2,}/.test(password)) score -= 1 // Repeated characters
  if (/^[0-9]+$/.test(password)) score -= 1 // Only numbers
  if (/^[a-zA-Z]+$/.test(password)) score -= 1 // Only letters

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"]
  const index = Math.max(0, Math.min(Math.floor(score / 1.5), labels.length - 1))

  return {
    score: Math.max(0, Math.min(score, 7)),
    label: labels[index],
    suggestions,
  }
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
}

/**
 * Validate and parse date range
 */
export function validateDateRange(startDate: Date, endDate: Date): {
  valid: boolean
  error?: string
} {
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    return { valid: false, error: "Invalid start date" }
  }

  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    return { valid: false, error: "Invalid end date" }
  }

  if (endDate < startDate) {
    return { valid: false, error: "End date must be after start date" }
  }

  return { valid: true }
}

/**
 * Format validation error messages
 */
export function formatValidationErrors(errors: Record<string, unknown>): string[] {
  const messages: string[] = []

  Object.entries(errors).forEach(([field, error]) => {
    if (typeof error === "object" && error !== null && "message" in error) {
      messages.push(`${field}: ${String((error as { message: string }).message)}`)
    } else if (typeof error === "string") {
      messages.push(`${field}: ${error}`)
    }
  })

  return messages
}

/**
 * Create schema from field configuration
 */
export function createDynamicSchema(
  fields: Array<{
    name: string
    type: string
    required?: boolean
    min?: number
    max?: number
  }>
) {
  const schemaObject: Record<string, z.ZodTypeAny> = {}

  fields.forEach((field) => {
    let fieldSchema: z.ZodTypeAny

    switch (field.type) {
      case "email":
        fieldSchema = emailSchema
        break
      case "number": {
        let numSchema = z.number()
        if (field.min !== undefined) numSchema = numSchema.min(field.min)
        if (field.max !== undefined) numSchema = numSchema.max(field.max)
        fieldSchema = numSchema
        break
      }
      case "boolean":
        fieldSchema = z.boolean()
        break
      default: {
        let strSchema = z.string()
        if (field.min !== undefined)
          strSchema = strSchema.min(
            field.min,
            `Must be at least ${field.min} characters`
          )
        if (field.max !== undefined)
          strSchema = strSchema.max(
            field.max,
            `Must be at most ${field.max} characters`
          )
        fieldSchema = strSchema
        break
      }
    }

    if (!field.required) {
      fieldSchema = fieldSchema.optional()
    }

    schemaObject[field.name] = fieldSchema
  })

  return z.object(schemaObject)
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LoginFormData = z.infer<typeof loginSchema>
export type RegistrationFormData = z.infer<typeof registrationSchema>
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type AddressFormData = z.infer<typeof addressSchema>
export type ContactFormData = z.infer<typeof contactSchema>

