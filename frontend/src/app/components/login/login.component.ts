import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="icon-wrapper">
            <mat-icon>login</mat-icon>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to your dashboard</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Email Address</mat-label>
            <mat-icon matPrefix>email</mat-icon>
            <input matInput type="email" formControlName="email" placeholder="you@example.com">
            <mat-error>Enter a valid email</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Password</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error>Password is required</mat-error>
          </mat-form-field>

          <div *ngIf="error" class="error-message">
            <mat-icon>error</mat-icon> {{ error }}
          </div>

          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading" class="full-width submit-btn">
            <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
            <span *ngIf="!loading">Sign In</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Create one</a></p>
        </div>
      </div>

      <div class="auth-illustration">
        <div class="illustration-content">
          <mat-icon class="big-icon">support_agent</mat-icon>
          <h2>Grievance Portal</h2>
          <p>Streamlined complaint management for organizations</p>
          <div class="stats">
            <div class="stat">
              <span class="stat-number">24/7</span>
              <span class="stat-label">Support Available</span>
            </div>
            <div class="stat">
              <span class="stat-number">Fast</span>
              <span class="stat-label">Resolution Time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: calc(100vh - 70px);
    }
    .auth-card {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 48px;
      background: white;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    .icon-wrapper mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }
    .auth-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px;
    }
    .auth-header p {
      color: #6b7280;
      margin: 0;
    }
    form {
      max-width: 400px;
      margin: 0 auto;
      width: 100%;
    }
    .submit-btn {
      margin-top: 16px;
      height: 48px !important;
    }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
    }
    .auth-footer p {
      color: #6b7280;
    }
    .auth-illustration {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
    }
    .illustration-content {
      text-align: center;
      color: white;
    }
    .big-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      opacity: 0.9;
    }
    .illustration-content h2 {
      font-size: 36px;
      font-weight: 700;
      margin: 24px 0 12px;
      color: white;
    }
    .illustration-content > p {
      font-size: 16px;
      opacity: 0.9;
    }
    .stats {
      display: flex;
      gap: 40px;
      margin-top: 40px;
      justify-content: center;
    }
    .stat {
      text-align: center;
    }
    .stat-number {
      display: block;
      font-size: 36px;
      font-weight: 700;
    }
    .stat-label {
      font-size: 13px;
      opacity: 0.8;
    }
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    @media (max-width: 900px) {
      .auth-container { grid-template-columns: 1fr; }
      .auth-illustration { display: none; }
    }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error = '';
  hidePassword = true;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.login(this.form.value.email, this.form.value.password).subscribe({
      next: (res) => {
        const routes: Record<string, string> = { User: '/complaints', Staff: '/staff/dashboard', Admin: '/admin/dashboard' };
        this.router.navigate([routes[res.user.role]]);
      },
      error: (err) => {
        this.error = err.error?.message || 'Invalid credentials. Please try again.';
        this.loading = false;
      }
    });
  }
}
