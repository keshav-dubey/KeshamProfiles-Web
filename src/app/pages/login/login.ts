
import { Component } from '@angular/core';
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
    currentYear = new Date().getFullYear();
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  readonly columns = [
    3, 7, 12, 17, 22, 27, 32, 37, 42, 47,
    52, 57, 62, 67, 72, 77, 82, 87, 92, 97
  ];

  readonly particles = Array.from({ length: 28 }, (_, index) => ({
    id: index,
    left: (index * 37 + 11) % 98,
    delay: -((index * 1.7) % 12),
    duration: 7 + ((index * 3) % 8)
  }));

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter your email address and password.';
      return;
    }

    this.isLoading = true;

    this.authService.login({
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        // Keep the application's existing session handling.
        this.authService.setSession(response);

        const role = String(
          response?.user?.role ??
          response?.role ??
          ''
        ).toLowerCase();

       if (role && role !== 'admin') {
  this.errorMessage =
    'This account does not have administrator access.';
  return;
}

        void this.router.navigate(['/admin']);
      },
      error: (error: any) => {
        this.isLoading = false;

        if (error?.status === 401) {
          this.errorMessage = 'Invalid email address or password.';
        } else if (error?.status === 0) {
          this.errorMessage =
            'Unable to connect to the server. Please check that the API is running.';
        } else {
          this.errorMessage =
            error?.error?.message ||
            'Sign in failed. Please try again.';
        }
      }
    });
  }
}
