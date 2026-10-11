import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly currentYear = new Date().getFullYear();

  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  showPassword = false;

  onLogin(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.loading = true;

    this.authService.login({
      email: this.email.trim(),
      password: this.password
    }).subscribe({
  next: (response) => {
  if (response.role?.toLowerCase() !== 'admin') {
    this.loading = false;
    this.errorMessage =
      'This account does not have administrator access.';
    return;
  }

  this.authService.setSession(response);
  this.loading = false;
  this.router.navigate(['/admin']);
},
      error: (error) => {
        console.error('Login API error:', error);
        this.loading = false;

        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else {
          this.errorMessage =
            'Unable to sign in. Check the API connection and try again.';
        }
      }
    });
  }
}