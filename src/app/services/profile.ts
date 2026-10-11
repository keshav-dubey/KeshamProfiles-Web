
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Profile {
  profileId: number;
  fullName: string;
  profileSlug: string;
  professionalTitle: string | null;
  shortBio: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  profileImageUrl: string | null;
  resumeUrl: string | null;
  gitHubUrl: string | null;
  linkedInUrl: string | null;
  naukriUrl: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);

 private apiUrl = `${environment.apiUrl}/profile/public`;

  getPublicProfile(slug: string): Observable<Profile> {
    return this.http.get<Profile>(
      `${this.apiUrl}/${encodeURIComponent(slug)}`
    );
  }
}
