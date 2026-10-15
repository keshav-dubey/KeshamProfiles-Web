import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { ProfileService, Profile } from './services/profile';
import { ProjectService, Project } from './services/project';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  profile = signal<Profile | null>(null);
  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal('');

  constructor(
    private profileService: ProfileService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    // Load the public profile.
    this.profileService.getPublicProfile('keshav-dubey').subscribe({
      next: (data: Profile) => {
        this.profile.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Profile API error:', err);
        this.error.set('Unable to load your profile.');
        this.loading.set(false);
      }
    });

    // Load published projects.
    this.projectService.getPublishedProjects().subscribe({
      next: (data: Project[]) => this.projects.set(data),
      error: (err: HttpErrorResponse) => {
        console.error('Projects API error:', err);
      }
    });
  }
}