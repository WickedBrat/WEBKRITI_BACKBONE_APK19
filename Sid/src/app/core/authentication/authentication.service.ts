import { Injectable } from '@angular/core';
import * as auth0 from 'auth0-js';
import { Router } from '@angular/router';

/**
 * Provides a base for authentication workflow.
 * The Credentials interface as well as login/logout methods should be replaced with proper implementation.
 */
@Injectable()
export class AuthenticationService {
  auth0 = new auth0.WebAuth({
    clientID: 'B8c3qW8zvBbUmPuGcont2qbMjkgGJXrl',
    domain: 'wicked.auth0.com',
    responseType: 'token id_token',
    redirectUri: 'http://localhost:4200',
    scope: 'openid profile email'
  });

  constructor(private router: Router) {}

  public logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('expires_at');
  }

  public isAuthenticated(): boolean {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '{}');
    if (new Date().getTime() < expiresAt) {
      return true;
    } else {
      this.logout();
      return false;
    }
  }
  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err: any, authResult: any) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        this.router.navigate(['/home']);
      } else if (err) {
        this.router.navigate(['/']);
      }
    });
  }

  private setSession(authResult: any): void {
    const expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
    console.log(authResult);
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('user_id', authResult.idTokenPayload.sub);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    localStorage.setItem('name', authResult.idTokenPayload.name);
  }
}
