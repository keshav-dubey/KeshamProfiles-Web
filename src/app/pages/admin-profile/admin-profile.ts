import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface ProfileForm {
  fullName: string;
  profileSlug: string;
  professionalTitle: string;
  shortBio: string;
  email: string;
  phone: string;
  location: string;
  profileImageUrl: string;
  resumeUrl: string;
  gitHubUrl: string;
  linkedInUrl: string;
  naukriUrl: string;
}

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.scss'
})
export class AdminProfile implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = 'http://localhost:5011/api/profile';

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  profile: ProfileForm = this.emptyProfile();

  private emptyProfile(): ProfileForm {
    return {
      fullName: '',
      profileSlug: 'keshav-dubey',
      professionalTitle: '',
      shortBio: '',
      email: '',
      phone: '',
      location: '',
      profileImageUrl: '',
      resumeUrl: '',
      gitHubUrl: '',
      linkedInUrl: '',
      naukriUrl: ''
    };
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private getHeaders(): HttpHeaders {
    const token =
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('access_token') ||
      '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<Partial<ProfileForm>>(
      `${this.apiUrl}/mine`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: result => {
        this.profile = { ...this.emptyProfile(), ...result };
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          error.status === 404
            ? 'The profile editing endpoint has not been added to the backend yet.'
            : error.status === 401
              ? 'Your session has expired. Please sign in again.'
              : 'Unable to load your profile. Check the API and try again.';
      }
    });
  }

  saveProfile(): void {
    if (this.saving) return;

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.put(
      `${this.apiUrl}/mine`,
      this.profile,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Profile updated successfully.';
      },
      error: error => {
        this.saving = false;
        this.errorMessage =
          error.error?.message ||
          'Profile could not be saved. The backend update endpoint may not exist yet.';
      }
    });
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}