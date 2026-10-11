import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProfileService, Profile } from '../../services/profile';
import { ProjectService, Project } from '../../services/project';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit {
  readonly currentYear = new Date().getFullYear();
  private readonly profileService = inject(ProfileService);
  private readonly projectService = inject(ProjectService);

  profile = signal<Profile | null>(null);
  projects = signal<Project[]>([]);
  loading = signal(true);
  profileError = signal('');

  ngOnInit(): void {
    this.profileService.getPublicProfile('keshav-dubey').subscribe({
      next: (data) => {
        this.profile.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Profile API error:', error);
        this.profileError.set(
          'Profile information is temporarily unavailable.'
        );
        this.loading.set(false);
      }
    });

    this.projectService.getPublishedProjects().subscribe({
      next: (data) => this.projects.set(data),
      error: (error) => {
        console.error('Projects API error:', error);
      }
    });
  }

  getTechnologies(project: Project): string[] {
    return (project.technologies ?? '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
}