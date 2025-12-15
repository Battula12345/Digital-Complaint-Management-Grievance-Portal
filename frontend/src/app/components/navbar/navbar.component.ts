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
      padding: 0 32px;
      height: 70px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    .toolbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .brand:hover {
      opacity: 0.9;
    }
    .logo-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #0ea5e9;
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
      background: rgba(255,255,255,0.1);
      padding: 6px 16px 6px 6px;
      border-radius: 30px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
      color: white;
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
      color: rgba(255,255,255,0.7);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .logout-btn {
      color: rgba(255,255,255,0.8) !important;
      transition: all 0.2s;
    }
    .logout-btn:hover {
      background: rgba(255,255,255,0.1) !important;
      color: white !important;
    }
    .nav-btn {
      color: rgba(255,255,255,0.9) !important;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-btn:hover {
      color: white !important;
    }
    .register-btn {
      background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%) !important;
      color: white !important;
      font-weight: 600 !important;
      border-radius: 24px !important;
      padding: 0 24px !important;
      height: 40px !important;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3) !important;
      transition: all 0.3s ease !important;
    }
    .register-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4) !important;
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
