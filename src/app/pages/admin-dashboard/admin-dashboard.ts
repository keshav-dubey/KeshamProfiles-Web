
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly userName =
    sessionStorage.getItem('user_name') || 'Administrator';

  logout(): void {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}
