import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { interval, Subscription } from 'rxjs';
import { ProfileService, Profile } from '../../services/profile';
import { ProjectService, Project } from '../../services/project';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit, OnDestroy {
  readonly currentYear = new Date().getFullYear();

  private gallerySubscription?: Subscription;

  private readonly profileService = inject(ProfileService);
  private readonly projectService = inject(ProjectService);
  private readonly sanitizer = inject(DomSanitizer);

  profile = signal<Profile | null>(null);
  projects = signal<Project[]>([]);
  loading = signal(true);
  profileError = signal('');

  // Use the resume URL stored on the profile; fall back to the public PDF path.
  readonly resumeUrlForDisplay = computed(
    () => this.profile()?.resumeUrl || '/resume/Keshav-Dubey-Resume.pdf'
  );

  // Angular requires a trusted resource URL for an embedded PDF preview.
  readonly safeResumePreviewUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.resumeUrlForDisplay();
    if (!url || !/^(https?:\/\/|\/)/i.test(url)) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  // Optional professional profile links.
  naukriUrl?: string;
  indeedUrl?: string;
  hackerRankUrl?: string;

  // Signal ensures Angular detects gallery position changes.
  projectImageIndexes = signal<Record<number, number>>({});

  // Project screenshot galleries.
  private readonly projectGalleries: Record<string, string[]> = {
    hrms: [
      '/images/projects/hrms/Login.png',
      '/images/projects/hrms/dashboard.png',
      '/images/projects/hrms/employees.png',
      '/images/projects/hrms/attendance.png',
      '/images/projects/hrms/reports.png'
    ],
    keshamprofiles: [
      '/images/projects/keshamprofiles/Login.png',
      '/images/projects/keshamprofiles/Public-Portfolio.png',
      '/images/projects/keshamprofiles/profile-3.png',
      '/images/projects/keshamprofiles/profile-4.png',
      '/images/projects/keshamprofiles/profile-5.png'
    ]
  };

  ngOnInit(): void {
    this.loadProfile();
    this.loadProjects();
  }

  private loadProfile(): void {
    this.profileService.getPublicProfile('keshav-dubey').subscribe({
      next: data => {
        this.profile.set(data);
        this.loading.set(false);
      },
      error: error => {
        console.error('Profile API error:', error);
        this.profileError.set('Profile information is temporarily unavailable.');
        this.loading.set(false);
      }
    });
  }

  private loadProjects(): void {
    this.projectService.getPublishedProjects().subscribe({
      next: data => {
        this.projects.set(data ?? []);
        this.startGalleryRotation();
      },
      error: error => {
        console.error('Projects API error:', error);
        this.projects.set([]);
      }
    });
  }

  private startGalleryRotation(): void {
    this.gallerySubscription?.unsubscribe();
    this.gallerySubscription = interval(3000).subscribe(() => {
      for (const project of this.projects()) {
        const images = this.getProjectImages(project);
        if (images.length > 1) {
          this.nextProjectImage(project);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.gallerySubscription?.unsubscribe();
  }

  getTechnologies(project: Project): string[] {
    return (project.technologies ?? '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  getProjectImages(project: Project): string[] {
    const title = (project.title ?? '').toLowerCase();
    if (title.includes('hrms')) return this.projectGalleries['hrms'];
    if (title.includes('keshamprofiles')) return this.projectGalleries['keshamprofiles'];
    return project.imageUrl ? [project.imageUrl] : [];
  }

  getProjectImageIndex(project: Project): number {
    return this.projectImageIndexes()[project.projectId] ?? 0;
  }

  nextProjectImage(project: Project): void {
    const images = this.getProjectImages(project);
    if (images.length < 2) return;
    const nextIndex = (this.getProjectImageIndex(project) + 1) % images.length;
    this.projectImageIndexes.update(indexes => ({
      ...indexes,
      [project.projectId]: nextIndex
    }));
  }

  previousProjectImage(project: Project): void {
    const images = this.getProjectImages(project);
    if (images.length < 2) return;
    const previousIndex = (this.getProjectImageIndex(project) - 1 + images.length) % images.length;
    this.projectImageIndexes.update(indexes => ({
      ...indexes,
      [project.projectId]: previousIndex
    }));
  }

  selectProjectImage(project: Project, index: number): void {
    const images = this.getProjectImages(project);
    if (index < 0 || index >= images.length) return;
    this.projectImageIndexes.update(indexes => ({
      ...indexes,
      [project.projectId]: index
    }));
  }
}
