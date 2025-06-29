import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Interface to define the structure of data stored for each IP in the throttler.
 */
interface IpRequestData {
  count: number; // Number of requests made by this IP
  lastReset: number; // Timestamp when the count was last reset (or initialized)
}

@Injectable()
export class CustomThrottlerGuard implements CanActivate {
  // A Map to store request data for each IP address.
  // Key: IP address (string)
  // Value: IpRequestData object containing count and lastReset timestamp.
  private readonly requests = new Map<string, IpRequestData>();

  // The maximum number of requests allowed within the defined TTL.
  private readonly limit = 2; // e.g., 2 requests

  // The time-to-live (TTL) for request counts in milliseconds.
  // After this duration, the request count for an IP will be reset.
  private readonly ttl = 60 * 1000; // e.g., 60,000 milliseconds (1 minute)

  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();
    // Safely retrieve the IP address from the request.
    // It prioritizes 'x-forwarded-for' header for proxy environments,
    // falls back to req.ip, and defaults to 'unknown'.
    const ip =
      (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
    const now = Date.now(); // Current timestamp in milliseconds.

    // Retrieve the existing request data for the current IP.
    let ipData = this.requests.get(ip);

    // Check if the IP data doesn't exist OR if the TTL has expired for the existing data.
    if (!ipData || now - ipData.lastReset > this.ttl) {
      // If either condition is true, reset the counter for this IP.
      ipData = { count: 1, lastReset: now };
      this.requests.set(ip, ipData); // Store the new/reset data.
      return true; // Allow the request as it's the first in a new window or after reset.
    }

    // If the request count has already reached or exceeded the limit within the TTL.
    if (ipData.count >= this.limit) {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      ); // Throw an HTTP 429 (Too Many Requests) exception.
    }

    ipData.count++; // If the limit is not yet reached, increment the request count.
    this.requests.set(ip, ipData); // Update the map with the incremented count.

    return true; // Allow the request.
  }
}
