
import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { adminAuthGuard } from './guards/admin-auth-guard';
export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // Public recruiter portfolio: no login required
  { path: 'keshav-dubey', component: Home },

  // Admin area: guard required
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [adminAuthGuard]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
