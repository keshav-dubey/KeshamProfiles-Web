import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
interface DocumentItem {
  documentId: number;
  documentName: string;
  documentType: string;
  isPublic: boolean;
  isPublished: boolean;
  uploadedAt: string;
}

@Component({
  selector: 'app-admin-documents',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule],
  templateUrl: './admin-documents.html',
  styleUrl: './admin-documents.scss'
})
export class AdminDocuments implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = 'http://localhost:5011/api/documents';

  documents: DocumentItem[] = [];
  selectedFile: File | null = null;
  documentType = 'Resume';
  searchTerm = '';

  loading = false;
  uploading = false;
  dragActive = false;
  errorMessage = '';
  successMessage = '';

  readonly documentTypes = [
    'Resume',
    'Certificate',
    'Aadhaar',
    'PAN',
    'DrivingLicence',
    'Other'
  ];

  ngOnInit(): void {
    this.loadDocuments();
  }

  get filteredDocuments(): DocumentItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) return this.documents;

    return this.documents.filter(document =>
      document.documentName.toLowerCase().includes(term) ||
      document.documentType.toLowerCase().includes(term)
    );
  }

  get resumeCount(): number {
    return this.documents.filter(x => x.documentType === 'Resume').length;
  }

  get certificateCount(): number {
    return this.documents.filter(x => x.documentType === 'Certificate').length;
  }

  get privateCount(): number {
    return this.documents.filter(x => !x.isPublic).length;
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

  loadDocuments(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<DocumentItem[]>(
      `${this.apiUrl}/mine`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: result => {
        this.documents = result ?? [];
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          error.status === 401
            ? 'Your session has expired. Please sign in again.'
            : 'Unable to load documents. Check that the API is running.';
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) this.validateFile(file);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = true;
  }

  onDragLeave(): void {
    this.dragActive = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) this.validateFile(file);
  }

  private validateFile(file: File): void {
    this.errorMessage = '';
    this.successMessage = '';

    const allowed = [
      'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'
    ];

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !allowed.includes(extension)) {
      this.selectedFile = null;
      this.errorMessage =
        'Unsupported file type. Select PDF, DOC, DOCX, JPG or PNG.';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.selectedFile = null;
      this.errorMessage = 'File size must not exceed 10 MB.';
      return;
    }

    this.selectedFile = file;
  }

  uploadDocument(): void {
    if (!this.selectedFile || this.uploading) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('documentType', this.documentType);

    this.uploading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Do not set Content-Type manually; the browser adds the multipart boundary.
    this.http.post(
      `${this.apiUrl}/upload`,
      formData,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.uploading = false;
        this.selectedFile = null;
        this.successMessage = 'Document uploaded successfully.';
        this.loadDocuments();
      },
      error: error => {
        this.uploading = false;
        this.errorMessage =
          error.error?.message || 'Upload failed. Please try again.';
      }
    });
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}