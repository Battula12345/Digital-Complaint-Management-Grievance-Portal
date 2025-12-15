import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  template: `
    <mat-toolbar>
      <div class="toolbar-content">
        <div class="brand">
          <mat-icon class="logo-icon">support_agent</mat-icon>
          <span class="brand-text">Grievance Portal</span>
        </div>
        <div class="nav-right">
          <ng-container *ngIf="authService.currentUser$ | async as user">
            <div class="user-badge">
              <div class="avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
              <div class="user-details">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-role">{{ user.role }}</span>
              </div>
            </div>
            <button mat-icon-button (click)="logout()" matTooltip="Logout" class="logout-btn">
              <mat-icon>logout</mat-icon>
            </button>
          </ng-container>
          <ng-container *ngIf="!(authService.currentUser$ | async)">
            <button mat-button routerLink="/login" class="nav-btn">Login</button>
            <button mat-raised-button routerLink="/register" class="register-btn">Get Started</button>
          </ng-container>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 0 24px;
      height: 70px;
    }
    .toolbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }
    .brand-text {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: white;
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .user-badge {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255,255,255,0.15);
      padding: 6px 16px 6px 6px;
      border-radius: 30px;
      backdrop-filter: blur(10px);
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: white;
      color: #6366f1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
    }
    .user-details {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: white;
      line-height: 1.2;
    }
    .user-role {
      font-size: 11px;
      color: rgba(255,255,255,0.8);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .logout-btn {
      color: white !important;
      transition: all 0.2s;
    }
    .logout-btn:hover {
      background: rgba(255,255,255,0.1) !important;
    }
    .nav-btn {
      color: white !important;
      font-weight: 500;
    }
    .register-btn {
      background: white !important;
      color: #6366f1 !important;
      font-weight: 600 !important;
      border-radius: 20px !important;
      padding: 0 20px !important;
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
