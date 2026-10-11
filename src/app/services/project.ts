
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Project {
  projectId: number;
  title: string;
  slug: string;
  shortDescription: string;
  description: string | null;
  technologies: string | null;
  imageUrl: string | null;
  gitHubUrl: string | null;
  liveDemoUrl: string | null;
  displayOrder: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);

private readonly apiUrl =
  `${environment.apiUrl}/projects/public`;  

  getPublishedProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }
}
