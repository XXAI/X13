import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject} from 'rxjs';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, filter, take } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private authService: AuthService;

  constructor(private injector: Injector) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    this.authService = this.injector.get(AuthService);

    const token: string = this.authService.getToken();

    request = request.clone({
      setHeaders: {
        'Authorization' : `Bearer ${token}`,
        'Content-type' : 'application/json'
      }
    });
    return next.handle(request);
  }
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private authService: AuthService;
  private refreshTokenInProgress: boolean = false;

  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(private router: Router, private injector: Injector){}

  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    this.authService = this.injector.get(AuthService);
    
    return next.handle(request)
    .pipe(catchError( (response:any) => {
      if(response instanceof HttpErrorResponse && response.status === 401){
        if(response.error.message == "Unauthenticated."){
          if(this.refreshTokenInProgress){
            return this.refreshTokenSubject.pipe(
                      filter(result => result !== null),
                      take(1),
                      switchMap(token => {
                        return next.handle(this.addAuthenticationToken(request));
                      })
                    );
          } else {
            this.refreshTokenInProgress = true;

            // Set the refreshTokenSubject to null so that subsequent API calls will wait until the new token has been retrieved
            this.refreshTokenSubject.next(null);

            // Call auth.refreshAccessToken(this is an Observable that will be returned)
            return this.authService.refreshToken().pipe(
              switchMap(token =>{
                this.refreshTokenInProgress = false;

                this.refreshTokenSubject.next(token);

                return next.handle(this.addAuthenticationToken(request));
              }),
              catchError((response:any)=>{
                this.refreshTokenInProgress = false;
                this.authService.logout();
                return throwError(response);
              })
            );
          }
        } else {
          this.authService.logout();
        }
        return throwError(response);
      }
      return throwError(response);
    }));
  }
  

  addAuthenticationToken(request) {
    // Get access token from Local Storage
    const accessToken = this.authService.getToken();

    // If access token is null this means that user is not logged in
    // And we return the original request
    if (!accessToken) {
        return request;
    }

    // We clone the request, because the original request is immutable
    return request.clone({
      setHeaders: {
        'Authorization' : `Bearer ${accessToken}`,
        'Content-type' : 'application/json'
      }
    });
  }
}