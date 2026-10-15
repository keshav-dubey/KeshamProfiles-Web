
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
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface SaveProjectRequest {
  title: string;
  slug: string;
  shortDescription: string;
  description: string | null;
  technologies: string | null;
  imageUrl: string | null;
  gitHubUrl: string | null;
  liveDemoUrl: string | null;
  displayOrder: number;
  isPublished: boolean;
}
