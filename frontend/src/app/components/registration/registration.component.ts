import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registration',
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="icon-wrapper">
            <mat-icon>person_add</mat-icon>
          </div>
          <h1>Create Account</h1>
          <p>Join Grievance Portal to submit and track complaints</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Full Name</mat-label>
            <mat-icon matPrefix>person</mat-icon>
            <input matInput formControlName="name" placeholder="Enter your name">
            <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Email Address</mat-label>
            <mat-icon matPrefix>email</mat-icon>
            <input matInput type="email" formControlName="email" placeholder="you@example.com">
            <mat-error *ngIf="form.get('email')?.hasError('email')">Enter a valid email</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Password</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="form.get('password')?.hasError('minlength')">Minimum 6 characters</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Select Role</mat-label>
            <mat-icon matPrefix>badge</mat-icon>
            <mat-select formControlName="role">
              <mat-option value="User">
                <mat-icon class="option-icon">person</mat-icon> User - Submit complaints
              </mat-option>
              <mat-option value="Staff">
                <mat-icon class="option-icon">engineering</mat-icon> Staff - Handle complaints
              </mat-option>
              <mat-option value="Admin">
                <mat-icon class="option-icon">admin_panel_settings</mat-icon> Admin - Manage system
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Contact Info (Optional)</mat-label>
            <mat-icon matPrefix>phone</mat-icon>
            <input matInput formControlName="contact_info" placeholder="Phone number">
          </mat-form-field>

          <div *ngIf="error" class="error-message">
            <mat-icon>error</mat-icon> {{ error }}
          </div>
          <div *ngIf="success" class="success-message">
            <mat-icon>check_circle</mat-icon> {{ success }}
          </div>

          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading" class="full-width submit-btn">
            <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
            <span *ngIf="!loading">Create Account</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Sign in</a></p>
        </div>
      </div>

      <div class="auth-illustration">
        <div class="illustration-content">
          <mat-icon class="big-icon">support_agent</mat-icon>
          <h2>Welcome to Grievance Portal</h2>
          <p>Your one-stop solution for complaint management and resolution tracking</p>
          <div class="features">
            <div class="feature"><mat-icon>check_circle</mat-icon> Easy complaint submission</div>
            <div class="feature"><mat-icon>check_circle</mat-icon> Real-time status tracking</div>
            <div class="feature"><mat-icon>check_circle</mat-icon> Quick resolution</div>
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
    .submit-btn mat-spinner {
      display: inline-block;
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
      font-size: 32px;
      font-weight: 700;
      margin: 24px 0 12px;
      color: white;
    }
    .illustration-content > p {
      font-size: 16px;
      opacity: 0.9;
      max-width: 300px;
      margin: 0 auto;
    }
    .features {
      margin-top: 32px;
      text-align: left;
      display: inline-block;
    }
    .feature {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 12px 0;
      font-size: 15px;
    }
    .feature mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .option-icon {
      vertical-align: middle;
      margin-right: 8px;
      font-size: 20px;
    }
    .error-message, .success-message {
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
export class RegistrationComponent {
  form: FormGroup;
  loading = false;
  error = '';
  success = '';
  hidePassword = true;

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
