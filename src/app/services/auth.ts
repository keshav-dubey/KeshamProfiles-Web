
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  token: string;
  expiresAtUtc: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  register(data: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      data
    );
  }

  setSession(response: AuthResponse): void {
    sessionStorage.setItem('access_token', response.token);
    sessionStorage.setItem('user_name', response.fullName);
    sessionStorage.setItem('user_role', response.role);
  }

  getToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  getRole(): string {
    return (
      sessionStorage.getItem('user_role') ?? ''
    ).trim().toLowerCase();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdminAuthenticated(): boolean {
    const adminRoles = [
      'admin',
      'administrator',
      'superadmin'
    ];

    return (
      this.isAuthenticated() &&
      adminRoles.includes(this.getRole())
    );
  }

  clearSession(): void {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_name');
    sessionStorage.removeItem('user_role');
  }
}
