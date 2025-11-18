import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Type,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * ValidationPipe - Validates and transforms incoming data using DTOs
 * 
 * This pipe uses class-validator and class-transformer to:
 * - Validate request body, query, and params against DTOs
 * - Transform plain objects into class instances
 * - Strip unknown properties (whitelist)
 * - Reject unknown properties (forbidNonWhitelisted)
 * - Transform types automatically
 * 
 * Features:
 * - Automatic DTO validation
 * - Type transformation
 * - Whitelist mode (strips unknown properties)
 * - Forbid non-whitelisted mode (rejects unknown properties)
 * - Nested object validation
 * - Array validation
 * - Custom error messages
 * 
 * Usage:
 * ```typescript
 * // Global usage (in main.ts)
 * app.useGlobalPipes(new ValidationPipe({
 *   whitelist: true,
 *   forbidNonWhitelisted: true,
 *   transform: true,
 *   transformOptions: {
 *     enableImplicitConversion: true,
 *   },
 * }));
 * 
 * // Or use NestJS built-in ValidationPipe
 * import { ValidationPipe } from '@nestjs/common';
 * ```
 * 
 * @example
 * // In your DTO
 * export class CreateUserDto {
 *   @IsEmail()
 *   @IsNotEmpty()
 *   email: string;
 * 
 *   @IsString()
 *   @MinLength(8)
 *   password: string;
 * 
 *   @IsOptional()
 *   @IsString()
 *   name?: string;
 * }
 * 
 * // In your controller
 * @Post()
 * create(@Body() dto: CreateUserDto) {
 *   // dto is validated and transformed
 *   return this.service.create(dto);
 * }
 */
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  private readonly whitelist: boolean;
  private readonly forbidNonWhitelisted: boolean;
  private readonly shouldTransform: boolean;
  private readonly skipMissingProperties: boolean;
  private readonly enableImplicitConversion: boolean;

  constructor(options?: ValidationPipeOptions) {
    this.whitelist = options?.whitelist ?? true;
    this.forbidNonWhitelisted = options?.forbidNonWhitelisted ?? false;
    this.shouldTransform = options?.transform ?? true;
    this.skipMissingProperties = options?.skipMissingProperties ?? false;
    this.enableImplicitConversion = options?.enableImplicitConversion ?? true;
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    // Skip validation for primitive types
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Transform plain object to class instance
    const object = plainToInstance(metatype, value, {
      enableImplicitConversion: this.enableImplicitConversion,
      excludeExtraneousValues: this.whitelist,
    });

    // Validate the transformed object
    const errors = await validate(object, {
      whitelist: this.whitelist,
      forbidNonWhitelisted: this.forbidNonWhitelisted,
      skipMissingProperties: this.skipMissingProperties,
    });

    if (errors.length > 0) {
      throw new BadRequestException(this.formatErrors(errors));
    }

    return this.shouldTransform ? object : value;
  }

  /**
   * Check if metatype should be validated
   */
  private toValidate(metatype: Type): boolean {
    const types: Type[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  /**
   * Format validation errors for response
   */
  private formatErrors(errors: ValidationError[]): any[] {
    return errors.map((error) => ({
      property: error.property,
      value: error.value,
      constraints: error.constraints,
      children: error.children?.length > 0 ? this.formatErrors(error.children) : undefined,
    }));
  }
}

/**
 * ValidationPipe options
 */
export interface ValidationPipeOptions {
  /** Strip properties that do not have decorators */
  whitelist?: boolean;

  /** Throw an error if non-whitelisted properties are present */
  forbidNonWhitelisted?: boolean;

  /** Transform payload to DTO instance */
  transform?: boolean;

  /** Skip validation of properties that are not in the DTO */
  skipMissingProperties?: boolean;

  /** Automatically convert primitive types */
  enableImplicitConversion?: boolean;
}

