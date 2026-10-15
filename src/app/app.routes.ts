
import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { adminAuthGuard } from './guards/admin-auth-guard';
import { AdminProfile } from './pages/admin-profile/admin-profile';
import { AdminDocuments } from './pages/admin-documents/admin-documents';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'keshav-dubey',
    component: Home
  },
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [adminAuthGuard]
  },
  {
  path: 'admin/profile',
  component: AdminProfile,
  canActivate: [adminAuthGuard]
},
{
  path: 'admin/documents',
  component: AdminDocuments,
  canActivate: [adminAuthGuard]
},
  {
    path: 'admin/projects',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./pages/admin-projects/admin-projects')
        .then(m => m.AdminProjects)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
