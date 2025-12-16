import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registration',
  template: `
    <div class="auth-container">
      <div class="auth-left">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
        <div class="illustration-content">
          <div class="logo-badge">
            <mat-icon>diversity_3</mat-icon>
          </div>
          <h2>Join Our Community</h2>
          <p class="tagline">Start your journey with us today</p>
          
          <div class="steps">
            <div class="step" [class.active]="currentStep >= 1">
              <div class="step-icon"><mat-icon>person_add</mat-icon></div>
              <div class="step-info">
                <strong>Create Account</strong>
                <span>Fill in your details</span>
              </div>
            </div>
            <div class="step-line"></div>
            <div class="step" [class.active]="currentStep >= 2">
              <div class="step-icon"><mat-icon>verified_user</mat-icon></div>
              <div class="step-info">
                <strong>Verify Email</strong>
                <span>Confirm your identity</span>
              </div>
            </div>
            <div class="step-line"></div>
            <div class="step" [class.active]="currentStep >= 3">
              <div class="step-icon"><mat-icon>celebration</mat-icon></div>
              <div class="step-info">
                <strong>Get Started</strong>
                <span>Submit complaints</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="glass-card">
          <div class="auth-header">
            <div class="icon-wrapper">
              <mat-icon>auto_awesome</mat-icon>
            </div>
            <h1>Create Account</h1>
            <p>Join thousands of users managing complaints efficiently</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <mat-icon matPrefix class="field-icon">badge</mat-icon>
              <input matInput formControlName="name" placeholder="John Doe">
              <mat-error>Name is required</mat-error>
            </mat-form-field>

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
              <mat-error>Minimum 6 characters</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Select Role</mat-label>
              <mat-icon matPrefix class="field-icon">work</mat-icon>
              <mat-select formControlName="role">
                <mat-option value="User">User - Submit complaints</mat-option>
                <mat-option value="Staff">Staff - Handle complaints</mat-option>
                <mat-option value="Admin">Admin - Manage system</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Phone (Optional)</mat-label>
              <mat-icon matPrefix class="field-icon">call</mat-icon>
              <input matInput formControlName="contact_info" placeholder="+1 234 567 8900">
            </mat-form-field>

            <div *ngIf="error" class="error-message">
              <mat-icon>warning_amber</mat-icon> {{ error }}
            </div>
            <div *ngIf="success" class="success-message">
              <mat-icon>check_circle</mat-icon> {{ success }}
            </div>

            <button mat-flat-button type="submit" [disabled]="form.invalid || loading" class="submit-btn">
              <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
              <span *ngIf="!loading">
                Create Account
                <mat-icon>arrow_forward</mat-icon>
              </span>
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <a routerLink="/login">Sign In</a></p>
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
      background: #ffffffff;
    }
    .auth-left {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      position: relative;
      overflow: hidden;
    }
      .glass-card {
      background: white;
      border-radius: 24px;
      padding: 48px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 25px 50px -12px rgba(26, 255, 0, 0.58);
      border: 1px solid rgba(26, 214, 51, 0.5);
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
      background: linear-gradient(135deg, #10b981, #0ea5e9);
      top: -100px;
      left: -100px;
      animation: float 8s ease-in-out infinite;
    }
    .shape-2 {
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      bottom: -50px;
      right: -50px;
      animation: float 6s ease-in-out infinite reverse;
    }
    .shape-3 {
      width: 200px;
      height: 200px;
      background: linear-gradient(135deg, #f59e0b, #ef4444);
      top: 50%;
      right: 30%;
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
      font-size: 36px;
      font-weight: 800;
      margin: 0 0 12px;
      background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .tagline {
      font-size: 17px;
      color: #94a3b8;
      margin: 0 0 48px;
    }
    .steps {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 260px;
      margin: 0 auto;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      transition: all 0.3s ease;
      opacity: 0.5;
    }
    .step.active {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
      opacity: 1;
    }
    .step-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .step-icon mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: white;
    }
    .step-info {
      text-align: left;
    }
    .step-info strong {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: white;
    }
    .step-info span {
      font-size: 12px;
      color: #94a3b8;
    }
    .step-line {
      width: 2px;
      height: 20px;
      background: rgba(255, 255, 255, 0.1);
      margin-left: 37px;
    }
    .auth-right {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    .glass-card {
      background: white;
      border-radius: 24px;
      padding: 40px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(18, 231, 22, 0.84);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .icon-wrapper {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      background: linear-gradient(135deg, #10b981 0%, #0ea5e9 50%, #6366f1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 10px 40px -10px rgba(16, 185, 129, 0.5);
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
      font-size: 28px;
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
      font-size: 14px;
    }
    form {
      width: 100%;
    }
    .full-width {
      width: 100%;
      margin-bottom: 4px;
    }
    .field-icon {
      color: #94a3b8;
      margin-right: 12px;
    }
    .full-width:focus-within .field-icon {
      color: #10b981;
    }
    ::ng-deep .mat-mdc-form-field-icon-prefix {
      padding: 0 8px 0 12px !important;
    }
    ::ng-deep .mdc-notched-outline__leading,
    ::ng-deep .mdc-notched-outline__notch,
    ::ng-deep .mdc-notched-outline__trailing {
      border-color: #16c61cff !important;
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
      background: linear-gradient(135deg, #10b981 0%, #0ea5e9 50%, #6366f1 100%) !important;
      color: white !important;
      margin-top: 8px;
      transition: all 0.3s ease !important;
      box-shadow: 0 10px 40px -10px rgba(16, 185, 129, 0.5) !important;
    }
    .submit-btn:hover:not([disabled]) {
      transform: translateY(-2px);
      box-shadow: 0 15px 50px -10px rgba(16, 185, 129, 0.6) !important;
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
      margin-top: 24px;
    }
    .auth-footer p {
      color: #64748b;
      font-size: 14px;
    }
    .auth-footer a {
      color: #10b981;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.2s;
    }
    .auth-footer a:hover {
      color: #059669;
    }
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      color: #dc2626;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .success-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #29d25bff;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      color: #16a34a;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .error-message mat-icon, .success-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    @media (max-width: 1024px) {
      .auth-container { grid-template-columns: 1fr; }
      .auth-left { display: none; }
      .auth-right { padding: 24px; }
      .glass-card { padding: 32px; }
    }
     input, select {
  border: 1.5px solid #c7d2fe; /* light indigo/blue */
  border-radius: 8px;
}


  `]
})
export class RegistrationComponent {
  form: FormGroup;
  loading = false;
  error = '';
  success = '';
  hidePassword = true;
  currentStep = 1;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['User', Validators.required],
      contact_info: ['']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.success = 'Account created successfully! Redirecting...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
