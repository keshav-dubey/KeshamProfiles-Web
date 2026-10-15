
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
  readonly currentYear = new Date().getFullYear();

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
      this.errorMessage =
        'Please enter your email address and password.';
      return;
    }

    this.isLoading = true;

    this.authService.login({
      email: this.email.trim(),
      password: this.password
    }).subscribe({
   
next: (response: any) => {
  console.log('Login response:', response);

  this.isLoading = false;

  try {
    this.authService.setSession(response);
    console.log('Session saved successfully');

    const role = String(
      response?.user?.role ??
      response?.role ??
      ''
    ).trim().toLowerCase();

    console.log('Detected role:', role);

    if (!['admin', 'administrator', 'superadmin'].includes(role)) {
      this.errorMessage =
        'This account does not have administrator access.';
      return;
    }

    this.router.navigate(['/admin']).then(
      navigated => {
        console.log('Navigation successful:', navigated);
        console.log('Current URL:', this.router.url);

        if (!navigated) {
          this.errorMessage =
            'Could not open the admin dashboard. Check the authentication guard.';
        }
      },
      error => {
        console.error('Navigation error:', error);
        this.errorMessage = 'Unable to open the admin dashboard.';
      }
    );
  } catch (error) {
    console.error('Login session error:', error);
    this.errorMessage = 'Unable to save your login session.';
  }
},
    });
  }}
