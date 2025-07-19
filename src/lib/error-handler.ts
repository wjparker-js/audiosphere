/**
 * Centralized error handling utilities for API endpoints
 */

import { NextResponse } from 'next/server';
import { createApiResponse } from './data-transformer';

export interface DatabaseError extends Error {
  code?: string;
  errno?: number;
  sqlState?: string;
  sqlMessage?: string;
}

export interface ValidationError extends Error {
  field?: string;
  value?: any;
}

export class ErrorHandler {
  /**
   * Handle database connection errors
   */
  static handleDatabaseError(error: DatabaseError): NextResponse {
    console.error('Database error:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      stack: error.stack
    });

    // Check for specific database error types
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        createApiResponse(false, undefined, {
          code: 'DATABASE_CONNECTION_ERROR',
          message: 'Unable to connect to database. Please try again later.'
        }),
        { status: 503 }
      );
    }

    if (error.code === 'ER_NO_SUCH_TABLE') {
      return NextResponse.json(
        createApiResponse(false, undefined, {
          code: 'DATABASE_SCHEMA_ERROR',
          message: 'Database table not found. Please contact support.'
        }),
        { status: 500 }
      );
    }

    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return NextResponse.json(
        createApiResponse(false, undefined, {
          code: 'DATABASE_FIELD_ERROR',
          message: 'Database field error. Please contact support.',
          details: process.env.NODE_ENV === 'development' ? error.sqlMessage : undefined
        }),
        { status: 500 }
      );
    }

    // Generic database error
    return NextResponse.json(
      createApiResponse(false, undefined, {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: ValidationError): NextResponse {
    console.error('Validation error:', error);

    return NextResponse.json(
      createApiResponse(false, undefined, {
        code: 'VALIDATION_ERROR',
        message: error.message || 'Invalid input data provided.',
        details: {
          field: error.field,
          value: error.value
        }
      }),
      { status: 422 }
    );
  }

  /**
   * Handle not found errors
   */
  static handleNotFoundError(resource: string): NextResponse {
    return NextResponse.json(
      createApiResponse(false, undefined, {
        code: 'NOT_FOUND',
        message: `${resource} not found.`
      }),
      { status: 404 }
    );
  }

  /**
   * Handle generic errors
   */
  static handleGenericError(error: Error): NextResponse {
    console.error('Generic error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return NextResponse.json(
      createApiResponse(false, undefined, {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(message: string = 'Authentication required'): NextResponse {
    return NextResponse.json(
      createApiResponse(false, undefined, {
        code: 'AUTHENTICATION_ERROR',
        message
      }),
      { status: 401 }
    );
  }

  /**
   * Handle authorization errors
   */
  static handleAuthorizationError(message: string = 'Insufficient permissions'): NextResponse {
    return NextResponse.json(
      createApiResponse(false, undefined, {
        code: 'AUTHORIZATION_ERROR',
        message
      }),
      { status: 403 }
    );
  }

  /**
   * Handle rate limiting errors
   */
  static handleRateLimitError(message: string = 'Too many requests'): NextResponse {
    return NextResponse.json(
      createApiResponse(false, undefined, {
        code: 'RATE_LIMIT_EXCEEDED',
        message
      }),
      { status: 429 }
    );
  }

  /**
   * Validate required fields
   */
  static validateRequired(data: Record<string, any>, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim().length === 0)) {
        const error = new Error(`${field} is required`) as ValidationError;
        error.field = field;
        error.value = data[field];
        throw error;
      }
    }
  }

  /**
   * Validate field types
   */
  static validateTypes(data: Record<string, any>, typeValidations: Record<string, string>): void {
    for (const [field, expectedType] of Object.entries(typeValidations)) {
      if (data[field] !== undefined && data[field] !== null) {
        const actualType = typeof data[field];
        if (actualType !== expectedType) {
          const error = new Error(`${field} must be of type ${expectedType}`) as ValidationError;
          error.field = field;
          error.value = data[field];
          throw error;
        }
      }
    }
  }

  /**
   * Validate string length
   */
  static validateLength(data: Record<string, any>, lengthValidations: Record<string, { min?: number; max?: number }>): void {
    for (const [field, validation] of Object.entries(lengthValidations)) {
      const value = data[field];
      if (value && typeof value === 'string') {
        if (validation.min && value.length < validation.min) {
          const error = new Error(`${field} must be at least ${validation.min} characters`) as ValidationError;
          error.field = field;
          error.value = value;
          throw error;
        }
        if (validation.max && value.length > validation.max) {
          const error = new Error(`${field} must be no more than ${validation.max} characters`) as ValidationError;
          error.field = field;
          error.value = value;
          throw error;
        }
      }
    }
  }
}

/**
 * Async error wrapper for API handlers
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof Error) {
        // Check error type and handle appropriately
        if ('code' in error || 'errno' in error) {
          return ErrorHandler.handleDatabaseError(error as DatabaseError);
        }
        if ('field' in error) {
          return ErrorHandler.handleValidationError(error as ValidationError);
        }
        return ErrorHandler.handleGenericError(error);
      }
      
      // Handle non-Error objects
      return ErrorHandler.handleGenericError(new Error('Unknown error occurred'));
    }
  };
}