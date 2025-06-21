import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

// ExceptionFilter: Base interface for creating custom error handlers.

// Catch(): A decorator that tells Nest to use this class to catch all exceptions.

// ArgumentsHost: Gives access to the HTTP request/response context.

// HttpException: The base class for all standard NestJS HTTP errors.

// HttpStatus: Enum of HTTP status codes (like 404, 500, etc.).

// Request, Response: Express.js types for request and response objects.

// QueryFailedError: Specific error thrown by TypeORM when a query fails (e.g., duplicate email).

//!-----------------------------------------------------------------------------------------------
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  //catch: This method is called whenever an exception is thrown.
  // exception: the actual error object.
  // host: provides access to the context (e.g., HTTP, WebSocket, RPC).

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // tells Nest to handle this exception in the HTTP context.
    const response = ctx.getResponse<Response>(); //the Express res object.
    const request = ctx.getRequest<Request>(); // the Express req object (can be used for URL, headers, etc.).

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    //! If the error is a NestJS HttpException (e.g., NotFoundException, BadRequestException):
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as any).message || JSON.stringify(res); //Extract a readable message string (if it's an object, fallback to .message or JSON.stringify)
    } else if (exception instanceof QueryFailedError) {
      const err: any = exception;
      if (err.code === '23505') {
        status = HttpStatus.CONFLICT;
        message = err.driverError.detail || 'Duplicate entry';
      }
    } else {
      // Unknown/unhandled exceptions
      console.error('Unhandled Exception:', exception);
      message = (exception as any)?.message || message; //Try to extract exception.message, otherwise fall back to 'Internal server error'
    }

    response.status(status).json({
      statusCode: status,
      //   timestamp: new Date().toISOString(),
      //   path: request.url,
      message,
    });
  }
}
