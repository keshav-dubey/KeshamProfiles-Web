
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project';
import { Project, SaveProjectRequest } from '../../models/project.model';

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-projects.html',
  styleUrl: './admin-projects.scss'
})
export class AdminProjects implements OnInit {
  private readonly projectService = inject(ProjectService);

  projects: Project[] = [];
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  showForm = false;
  editingId: number | null = null;

  form: SaveProjectRequest = this.emptyForm();

  ngOnInit(): void {
    this.loadProjects();
  }

  private emptyForm(): SaveProjectRequest {
    return {
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      technologies: '',
      imageUrl: '',
      gitHubUrl: '',
      liveDemoUrl: '',
      displayOrder: 0,
      isPublished: true
    };
  }

 
loadProjects(): void {
  this.loading = true;
  this.errorMessage = '';

  this.projectService.getAllProjects().subscribe({
    next: (projects) => {
      this.projects = projects ?? [];
      this.loading = false;
    },
    error: (error) => {
      this.loading = false;

      if (error.status === 401) {
        this.errorMessage = 'Your session is invalid or expired. Please sign in again.';
      } else if (error.status === 403) {
        this.errorMessage = 'Your account does not have permission to manage projects.';
      } else if (error.status === 0) {
        this.errorMessage = 'Cannot connect to the API. Check that the backend is running.';
      } else {
        this.errorMessage = error.error?.message || 'Unable to load projects.';
      }

      console.error('Get projects failed:', error);
    }
  });
}


  addProject(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.showForm = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  editProject(project: Project): void {
    this.editingId = project.projectId;
    this.form = {
      title: project.title,
      slug: project.slug,
      shortDescription: project.shortDescription,
      description: project.description ?? '',
      technologies: project.technologies ?? '',
      imageUrl: project.imageUrl ?? '',
      gitHubUrl: project.gitHubUrl ?? '',
      liveDemoUrl: project.liveDemoUrl ?? '',
      displayOrder: project.displayOrder,
      isPublished: project.isPublished
    };
    this.showForm = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveProject(): void {
    if (
      !this.form.title.trim() ||
      !this.form.slug.trim() ||
      !this.form.shortDescription.trim()
    ) {
      this.errorMessage = 'Title, slug and short description are required.';
      return;
    }

    const request: SaveProjectRequest = {
      ...this.form,
      title: this.form.title.trim(),
      slug: this.form.slug.trim().toLowerCase(),
      shortDescription: this.form.shortDescription.trim()
    };

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const operation = this.editingId === null
      ? this.projectService.createProject(request)
      : this.projectService.updateProject(this.editingId, request);

    operation.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.successMessage = this.editingId === null
          ? 'Project created successfully.'
          : 'Project updated successfully.';
        this.loadProjects();
      },
      error: error => {
        this.saving = false;
        this.errorMessage =
          error.error?.message || 'Unable to save the project.';
      }
    });
  }

  togglePublished(project: Project): void {
    const request: SaveProjectRequest = {
      title: project.title,
      slug: project.slug,
      shortDescription: project.shortDescription,
      description: project.description,
      technologies: project.technologies,
      imageUrl: project.imageUrl,
      gitHubUrl: project.gitHubUrl,
      liveDemoUrl: project.liveDemoUrl,
      displayOrder: project.displayOrder,
      isPublished: !project.isPublished
    };

    this.projectService.updateProject(project.projectId, request).subscribe({
      next: () => {
        this.successMessage = 'Project visibility updated.';
        this.loadProjects();
      },
      error: error => {
        this.errorMessage =
          error.error?.message || 'Unable to update project visibility.';
      }
    });
  }

  deleteProject(project: Project): void {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) {
      return;
    }

    this.projectService.deleteProject(project.projectId).subscribe({
      next: () => {
        this.successMessage = 'Project deleted successfully.';
        this.loadProjects();
      },
      error: error => {
        this.errorMessage =
          error.error?.message || 'Unable to delete the project.';
      }
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form = this.emptyForm();
  }

  trackByProjectId(_index: number, project: Project): number {
    return project.projectId;
  }
}
