import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="unauthorized-container">
      <div class="content">
        <div class="icon-wrapper">
          <mat-icon>lock</mat-icon>
        </div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page. Please contact your administrator if you believe this is an error.</p>
        <div class="actions">
          <button mat-raised-button color="primary" routerLink="/login">
            <mat-icon>login</mat-icon> Go to Login
          </button>
          <button mat-stroked-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon> Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: calc(100vh - 70px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .content {
      text-align: center;
      max-width: 400px;
    }
    .icon-wrapper {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .icon-wrapper mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #dc2626;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 12px;
    }
    p {
      color: #6b7280;
      line-height: 1.6;
      margin: 0 0 32px;
    }
    .actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .actions button mat-icon {
      margin-right: 8px;
    }
  `]
})
export class UnauthorizedComponent {
  goBack(): void {
    window.history.back();
  }
}
