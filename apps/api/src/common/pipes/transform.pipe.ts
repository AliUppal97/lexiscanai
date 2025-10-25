import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

/**
 * TransformPipe - Custom data transformation pipe
 * 
 * This pipe transforms and sanitizes incoming data before it reaches
 * the controller. Useful for:
 * - Trimming strings
 * - Converting case
 * - Parsing special formats
 * - Sanitizing input
 * 
 * Usage:
 * ```typescript
 * @Get(':id')
 * getById(@Param('id', ParseIntPipe, TransformPipe) id: number) {
 *   return this.service.findById(id);
 * }
 * 
 * @Post()
 * create(@Body(TransformPipe) data: CreateDto) {
 *   return this.service.create(data);
 * }
 * ```
 */
@Injectable()
export class TransformPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value === null || value === undefined) {
      return value;
    }

    // Transform based on type
    switch (metadata.type) {
      case 'body':
        return this.transformBody(value);
      case 'query':
        return this.transformQuery(value);
      case 'param':
        return this.transformParam(value, metadata);
      default:
        return value;
    }
  }

  /**
   * Transform request body
   */
  private transformBody(value: any): any {
    if (typeof value !== 'object') {
      return value;
    }

    const transformed = { ...value };

    // Recursively transform all string values
    for (const key in transformed) {
      if (typeof transformed[key] === 'string') {
        transformed[key] = this.transformString(transformed[key]);
      } else if (typeof transformed[key] === 'object' && transformed[key] !== null) {
        transformed[key] = this.transformBody(transformed[key]);
      }
    }

    return transformed;
  }

  /**
   * Transform query parameters
   */
  private transformQuery(value: any): any {
    if (typeof value !== 'object') {
      return this.transformQueryValue(value);
    }

    const transformed: any = {};

    for (const key in value) {
      transformed[key] = this.transformQueryValue(value[key]);
    }

    return transformed;
  }

  /**
   * Transform a single query value
   */
  private transformQueryValue(value: string): any {
    // Convert string booleans
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Convert string numbers
    if (/^\d+$/.test(value)) {
      return parseInt(value, 10);
    }

    // Convert string floats
    if (/^\d+\.\d+$/.test(value)) {
      return parseFloat(value);
    }

    // Trim strings
    return typeof value === 'string' ? value.trim() : value;
  }

  /**
   * Transform route parameters
   */
  private transformParam(value: string, metadata: ArgumentMetadata): any {
    // Convert numeric params
    if (metadata.metatype === Number) {
      const num = parseInt(value, 10);
      if (isNaN(num)) {
        throw new BadRequestException(`Invalid number: ${value}`);
      }
      return num;
    }

    // Trim string params
    return typeof value === 'string' ? value.trim() : value;
  }

  /**
   * Transform string value (trim, lowercase email, etc.)
   */
  private transformString(value: string): string {
    // Trim whitespace
    let transformed = value.trim();

    // Additional transformations can be added here
    // For example: lowercase emails, uppercase names, etc.

    return transformed;
  }
}

/**
 * ParseIntPipe - Parse string to integer
 * 
 * @example
 * @Get(':id')
 * getById(@Param('id', ParseIntPipe) id: number) { ... }
 */
@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException(
        `Validation failed. "${value}" is not a valid integer.`,
      );
    }
    return val;
  }
}

/**
 * ParseFloatPipe - Parse string to float
 * 
 * @example
 * @Get('price/:amount')
 * getByPrice(@Param('amount', ParseFloatPipe) amount: number) { ... }
 */
@Injectable()
export class ParseFloatPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseFloat(value);
    if (isNaN(val)) {
      throw new BadRequestException(
        `Validation failed. "${value}" is not a valid number.`,
      );
    }
    return val;
  }
}

/**
 * ParseBoolPipe - Parse string to boolean
 * 
 * @example
 * @Get('active/:isActive')
 * getActive(@Param('isActive', ParseBoolPipe) isActive: boolean) { ... }
 */
@Injectable()
export class ParseBoolPipe implements PipeTransform<string, boolean> {
  transform(value: string, metadata: ArgumentMetadata): boolean {
    const lowerValue = value.toLowerCase();
    
    if (lowerValue === 'true' || lowerValue === '1') {
      return true;
    }
    
    if (lowerValue === 'false' || lowerValue === '0') {
      return false;
    }
    
    throw new BadRequestException(
      `Validation failed. "${value}" is not a valid boolean.`,
    );
  }
}

/**
 * TrimPipe - Trim whitespace from strings
 * 
 * @example
 * @Post()
 * create(@Body('name', TrimPipe) name: string) { ... }
 */
@Injectable()
export class TrimPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (typeof value !== 'string') {
      return value;
    }
    return value.trim();
  }
}

/**
 * LowercasePipe - Convert string to lowercase
 * 
 * @example
 * @Get(':email')
 * getByEmail(@Param('email', LowercasePipe) email: string) { ... }
 */
@Injectable()
export class LowercasePipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (typeof value !== 'string') {
      return value;
    }
    return value.toLowerCase();
  }
}

/**
 * UppercasePipe - Convert string to uppercase
 * 
 * @example
 * @Get(':code')
 * getByCode(@Param('code', UppercasePipe) code: string) { ... }
 */
@Injectable()
export class UppercasePipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (typeof value !== 'string') {
      return value;
    }
    return value.toUpperCase();
  }
}

