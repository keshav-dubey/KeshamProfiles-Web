
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';
import { Project, SaveProjectRequest } from '../models/project.model';

export type { Project, SaveProjectRequest } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  // Public portfolio: published projects only
  getPublishedProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/public`);
  }

  // Admin: get all projects
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  // Admin: get one project
  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Admin: create a project
  createProject(request: SaveProjectRequest): Observable<unknown> {
    return this.http.post(this.apiUrl, request, {
      headers: this.getAuthHeaders()
    });
  }

  // Admin: update a project
  updateProject(
    id: number,
    request: SaveProjectRequest
  ): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${id}`, request, {
      headers: this.getAuthHeaders()
    });
  }

  // Admin: delete a project
  deleteProject(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    if (!token) {
      console.error('JWT token is missing. Please sign in again.');
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
