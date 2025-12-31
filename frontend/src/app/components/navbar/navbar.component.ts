import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService, Notification } from '../../services/notification.service';

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
            <!-- Notification Bell -->
            <div class="notification-wrapper">
              <button mat-icon-button (click)="toggleNotifications()" class="notification-btn" matTooltip="Notifications">
                <mat-icon>notifications</mat-icon>
                <span class="notification-badge" *ngIf="(notificationService.unreadCount$ | async) as count">
                  {{ count > 9 ? '9+' : count }}
                </span>
              </button>
              
              <!-- Notification Dropdown -->
              <div class="notification-dropdown" *ngIf="showNotifications">
                <div class="dropdown-header">
                  <span>Notifications</span>
                  <button mat-button (click)="markAllRead()" *ngIf="(notificationService.unreadCount$ | async)">Mark all read</button>
                </div>
                <div class="notification-list">
                  <div *ngIf="(notificationService.notifications$ | async)?.length === 0" class="empty-notifications">
                    <mat-icon>notifications_none</mat-icon>
                    <span>No notifications yet</span>
                  </div>
                  <div *ngFor="let n of (notificationService.notifications$ | async)" 
                       class="notification-item" [class.unread]="!n.is_read"
                       (click)="onNotificationClick(n)">
                    <div class="notification-icon" [ngClass]="n.type">
                      <mat-icon>{{ getNotificationIcon(n.type) }}</mat-icon>
                    </div>
                    <div class="notification-content">
                      <span class="notification-title">{{ n.title }}</span>
                      <span class="notification-body">{{ n.body }}</span>
                      <span class="notification-time">{{ n.created_at | date:'MMM d, h:mm a' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="user-badge" (click)="goToProfile()" matTooltip="View Profile">
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
    
    /* Notification Styles */
    .notification-wrapper {
      position: relative;
    }
    .notification-btn {
      color: rgba(255,255,255,0.8) !important;
      position: relative;
    }
    .notification-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 5px;
      border-radius: 10px;
      min-width: 16px;
      text-align: center;
    }
    .notification-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      width: 360px;
      max-height: 400px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      overflow: hidden;
      z-index: 1001;
    }
    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
      font-weight: 600;
      color: #1e293b;
    }
    .dropdown-header button {
      font-size: 12px;
      color: #6366f1;
    }
    .notification-list {
      max-height: 340px;
      overflow-y: auto;
    }
    .empty-notifications {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      color: #94a3b8;
    }
    .empty-notifications mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }
    .notification-item {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.2s;
      border-bottom: 1px solid #f1f5f9;
    }
    .notification-item:hover {
      background: #f8fafc;
    }
    .notification-item.unread {
      background: #eff6ff;
    }
    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .notification-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .notification-icon.status_change {
      background: #dbeafe;
      color: #2563eb;
    }
    .notification-icon.assignment {
      background: #fef3c7;
      color: #d97706;
    }
    .notification-icon.feedback {
      background: #d1fae5;
      color: #059669;
    }
    .notification-icon.system {
      background: #e2e8f0;
      color: #64748b;
    }
    .notification-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .notification-title {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 2px;
    }
    .notification-body {
      font-size: 12px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .notification-time {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 4px;
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
      cursor: pointer;
      transition: all 0.2s;
    }
    .user-badge:hover {
      background: rgba(255,255,255,0.15);
      border-color: rgba(255,255,255,0.2);
      transform: translateY(-1px);
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
export class NavbarComponent implements OnInit {
  showNotifications = false;

  constructor(
    public authService: AuthService,
    public notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.notificationService.loadNotifications();
        this.notificationService.loadUnreadCount();
        this.notificationService.requestPermission();
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notification-wrapper')) {
        this.showNotifications = false;
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.notificationService.loadNotifications();
    }
  }

  onNotificationClick(notification: Notification): void {
    if (!notification.is_read) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        this.notificationService.loadNotifications();
        this.notificationService.loadUnreadCount();
      });
    }
    this.showNotifications = false;
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notificationService.loadNotifications();
      this.notificationService.loadUnreadCount();
    });
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'status_change': 'update',
      'assignment': 'assignment_ind',
      'feedback': 'rate_review',
      'system': 'info'
    };
    return icons[type] || 'notifications';
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.notificationService.removeToken().subscribe();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
