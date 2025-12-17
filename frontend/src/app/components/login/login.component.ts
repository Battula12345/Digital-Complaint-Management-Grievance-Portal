import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-container">
      <div class="auth-left">
        <div class="glass-card">
          <div class="auth-header">
            <div class="icon-wrapper">
              <mat-icon>rocket_launch</mat-icon>
            </div>
            <h1>Welcome Back</h1>
            <p>Enter your credentials to access your account</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <mat-icon matPrefix class="field-icon">alternate_email</mat-icon>
              <input matInput type="email" formControlName="email" placeholder="hello@example.com">
              <mat-error>Enter a valid email</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix class="field-icon">key</mat-icon>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" class="toggle-btn">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error>Password is required</mat-error>
            </mat-form-field>

            <div *ngIf="error" class="error-message">
              <mat-icon>warning_amber</mat-icon> {{ error }}
            </div>

            <button mat-flat-button type="submit" [disabled]="form.invalid || loading" class="submit-btn">
              <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
              <span *ngIf="!loading">
                Sign In
                <mat-icon>arrow_forward</mat-icon>
              </span>
            </button>
          </form>

          <div class="auth-footer">
            <p>Don't have an account? <a routerLink="/register">Create Account</a></p>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
        <div class="illustration-content">
          <div class="logo-badge">
            <mat-icon>hub</mat-icon>
          </div>
          <h2>Grievance Portal</h2>
          <p class="tagline">Modern complaint management platform</p>
          
          <div class="feature-cards">
            <div class="feature-card">
              <mat-icon>speed</mat-icon>
              <div>
                <strong>Lightning Fast</strong>
                <span>Quick resolution times</span>
              </div>
            </div>
            <div class="feature-card">
              <mat-icon>shield</mat-icon>
              <div>
                <strong>Secure</strong>
                <span>Enterprise-grade security</span>
              </div>
            </div>
            <div class="feature-card">
              <mat-icon>insights</mat-icon>
              <div>
                <strong>Analytics</strong>
                <span>Real-time tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .auth-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: calc(100vh - 70px);
      background: #f8f8f8ff;
    }
    .auth-left {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    .glass-card {
      background: white;
      border-radius: 24px;
      padding: 48px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 25px 50px -12px rgba(0, 68, 255, 0.08);
      border: 1px solid rgba(33, 36, 240, 0.5);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 36px;
    }
    .icon-wrapper {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 10px 40px -10px rgba(99, 102, 241, 0.5);
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    .icon-wrapper mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: white;
    }
    .auth-header h1 {
      font-size: 32px;
      font-weight: 800;
      background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 8px;
    }
    .auth-header p {
      color: #64748b;
      margin: 0;
      font-size: 15px;
    }
    form {
      width: 100%;
    }
    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }
    .field-icon {
      color: #94a3b8;
      margin-right: 12px;
    }
    .full-width:focus-within .field-icon {
      color: #6366f1;
    }
    ::ng-deep .mat-mdc-form-field-icon-prefix {
      padding: 0 8px 0 12px !important;
    }
    ::ng-deep .mdc-notched-outline__leading,
    ::ng-deep .mdc-notched-outline__notch,
    ::ng-deep .mdc-notched-outline__trailing {
      border-color: #618cc5ff !important;
    }
    .toggle-btn {
      color: #94a3b8;
    }
    .submit-btn {
      width: 100%;
      height: 52px !important;
      border-radius: 14px !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%) !important;
      color: white !important;
      margin-top: 8px;
      transition: all 0.3s ease !important;
      box-shadow: 0 10px 40px -10px rgba(99, 102, 241, 0.5) !important;
    }
    .submit-btn:hover:not([disabled]) {
      transform: translateY(-2px);
      box-shadow: 0 15px 50px -10px rgba(99, 102, 241, 0.6) !important;
    }
    .submit-btn span {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .submit-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .auth-footer {
      text-align: center;
      margin-top: 28px;
    }
    .auth-footer p {
      color: #64748b;
      font-size: 14px;
    }
    .auth-footer a {
      color: #6366f1;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.2s;
    }
    .auth-footer a:hover {
      color: #4f46e5;
    }
    .auth-right {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      position: relative;
      overflow: hidden;
    }
    .floating-shapes {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }
    .shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.5;
    }
    .shape-1 {
      width: 400px;
      height: 400px;
      background: linear-gradient(135deg, #0ea5e9, #6366f1);
      top: -100px;
      right: -100px;
      animation: float 8s ease-in-out infinite;
    }
    .shape-2 {
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      bottom: -50px;
      left: -50px;
      animation: float 6s ease-in-out infinite reverse;
    }
    .shape-3 {
      width: 200px;
      height: 200px;
      background: linear-gradient(135deg, #10b981, #095c82ff);
      top: 50%;
      left: 50%;
      animation: float 7s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      50% { transform: translate(30px, 30px) rotate(10deg); }
    }
    .illustration-content {
      text-align: center;
      color: white;
      position: relative;
      z-index: 1;
    }
    .logo-badge {
      width: 88px;
      height: 88px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .logo-badge mat-icon {
      font-size: 44px;
      width: 44px;
      height: 44px;
      color: white;
    }
    .illustration-content h2 {
      font-size: 40px;
      font-weight: 800;
      margin: 0 0 12px;
      background: linear-gradient(135deg, #0c6debff 0%, #83a1cbff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .tagline {
      font-size: 17px;
      color: #94a3b8;
      margin: 0 0 40px;
    }
    .feature-cards {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 280px;
      margin: 0 auto;
    }
    .feature-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      text-align: left;
      transition: all 0.3s ease;
    }
    .feature-card:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateX(8px);
    }
    .feature-card mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #0ea5e9;
    }
    .feature-card div {
      display: flex;
      flex-direction: column;
    }
    .feature-card strong {
      font-size: 15px;
      font-weight: 600;
      color: white;
    }
    .feature-card span {
      font-size: 13px;
      color: #94a3b8;
    }
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #0d8d04ff;
      border: 1px solid #fecaca;
      border-radius: 12px;
      color: #dc2626;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .error-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    @media (max-width: 1024px) {
      .auth-container { grid-template-columns: 1fr; }
      .auth-right { display: none; }
      .auth-left { padding: 24px; }
      .glass-card { padding: 32px; }
    }
      .signin-btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

    .signin-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 20px rgba(37, 28, 211, 0.4);
}

.signin-btn:active {
  transform: scale(0.97);
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
