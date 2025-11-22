import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class VersionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // Add version headers to response
        if (request.apiVersion) {
          response.setHeader('X-API-Version', request.apiVersion);
        }

        if (request.apiVersionDeprecated) {
          response.setHeader('X-API-Deprecated', 'true');
          if (request.apiVersionSunsetDate) {
            response.setHeader('X-API-Sunset-Date', request.apiVersionSunsetDate.toISOString());
          }
        }

        return data;
      }),
    );
  }
}

