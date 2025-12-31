import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComplaintService } from '../../services/complaint.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <button mat-icon-button (click)="goBack()" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>My Profile</h1>
      </div>

      <div class="profile-content" *ngIf="!loading">
        <div class="profile-card">
          <div class="avatar-section">
            <div class="large-avatar" [style.background]="getAvatarGradient()">
              {{ user?.name?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="role-badge" [ngClass]="user?.role?.toLowerCase()">
              {{ user?.role }}
            </div>
          </div>

          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter your name">
              <mat-icon matPrefix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput [value]="user?.email" disabled>
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="contact_info" placeholder="+91 9876543210">
              <mat-icon matPrefix>phone</mat-icon>
            </mat-form-field>

            <div class="info-row">
              <div class="info-item">
                <mat-icon>calendar_today</mat-icon>
                <div class="info-text">
                  <span class="info-label">Member Since</span>
                  <span class="info-value">{{ user?.created_at | date:'MMM d, yyyy' }}</span>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="saving || !profileForm.dirty">
                <mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
                <span *ngIf="!saving">Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Loading profile...</p>
      </div>
    </div>
  `,
  styles: [`
    .profile-container { padding: 24px; max-width: 600px; margin: 0 auto; }
    .profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .profile-header h1 { font-size: 28px; font-weight: 700; color: #1e293b; margin: 0; }
    .back-btn { color: #64748b; }

    .profile-card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    
    .avatar-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 32px; }
    .large-avatar { width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 700; color: white; margin-bottom: 12px; }
    
    .role-badge { padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .role-badge.user { background: #dbeafe; color: #1d4ed8; }
    .role-badge.staff { background: #d1fae5; color: #047857; }
    .role-badge.admin { background: #ede9fe; color: #6d28d9; }

    .profile-form { display: flex; flex-direction: column; gap: 16px; }
    .full-width { width: 100%; }

    .location-section { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 8px 0; }
    .location-section h3 { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
    .location-section h3 mat-icon { color: #6366f1; }
    .location-hint { font-size: 13px; color: #64748b; margin: 0 0 16px; }

    .location-actions { margin-top: 12px; display: flex; gap: 12px; flex-wrap: wrap; }
    .location-actions button { display: flex; align-items: center; gap: 8px; }

    .location-error { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 10px; background: #fef2f2; border-radius: 8px; color: #dc2626; font-size: 13px; }

    .map-preview { margin-top: 16px; background: #f0fdf4; padding: 16px; border-radius: 12px; border: 1px solid #bbf7d0; }
    .coords { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; margin-bottom: 12px; font-family: monospace; }
    .coords mat-icon { font-size: 18px; width: 18px; height: 18px; color: #10b981; }
    .open-map-link { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: #10b981; color: white; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; transition: background 0.2s; }
    .open-map-link:hover { background: #059669; }
    .open-map-link mat-icon { font-size: 18px; width: 18px; height: 18px; }
    
    .info-row { display: flex; gap: 24px; padding: 16px 0; border-top: 1px solid #e2e8f0; margin-top: 8px; }
    .info-item { display: flex; align-items: center; gap: 12px; }
    .info-item mat-icon { color: #64748b; }
    .info-text { display: flex; flex-direction: column; }
    .info-label { font-size: 12px; color: #94a3b8; }
    .info-value { font-size: 14px; color: #1e293b; font-weight: 500; }

    .form-actions { display: flex; justify-content: flex-end; margin-top: 16px; }
    .form-actions button { min-width: 140px; height: 44px; }

    .loading-state { text-align: center; padding: 80px 20px; }
    .loading-state p { color: #64748b; margin-top: 16px; }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  loading = true;
  saving = false;
  gettingLocation = false;
  searchingAddress = false;
  locationError = '';
  mapUrl: SafeResourceUrl | null = null;

  constructor(
    private fb: FormBuilder,
    private complaintService: ComplaintService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      contact_info: [''],
      address: [''],
      latitude: [null],
      longitude: [null]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.complaintService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          name: user.name,
          contact_info: user.contact_info || '',
          address: user.address || '',
          latitude: user.latitude || null,
          longitude: user.longitude || null
        });
        this.updateMapUrl();
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  getLocation(): void {
    if (!navigator.geolocation) {
      this.locationError = 'Geolocation is not supported by your browser';
      return;
    }

    this.gettingLocation = true;
    this.locationError = '';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.profileForm.patchValue({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        this.profileForm.markAsDirty();
        this.gettingLocation = false;
        this.updateMapUrl();
        this.reverseGeocode(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        this.gettingLocation = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.locationError = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            this.locationError = 'Location unavailable';
            break;
          case error.TIMEOUT:
            this.locationError = 'Location request timed out';
            break;
          default:
            this.locationError = 'Error getting location';
        }
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
    );
  }

  reverseGeocode(lat: number, lng: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        if (data.display_name) {
          this.profileForm.patchValue({ address: data.display_name });
        }
      })
      .catch(() => {});
  }

  searchAddress(): void {
    const address = this.profileForm.get('address')?.value;
    if (!address) {
      this.locationError = 'Please enter an address first';
      return;
    }

    this.searchingAddress = true;
    this.locationError = '';

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`)
      .then(res => res.json())
      .then(data => {
        this.searchingAddress = false;
        if (data && data.length > 0) {
          const result = data[0];
          this.profileForm.patchValue({
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            address: result.display_name
          });
          this.profileForm.markAsDirty();
          this.updateMapUrl();
        } else {
          this.locationError = 'Address not found. Try a more specific address.';
        }
      })
      .catch(() => {
        this.searchingAddress = false;
        this.locationError = 'Failed to search address. Please try again.';
      });
  }

  updateMapUrl(): void {
    const lat = this.profileForm.get('latitude')?.value;
    const lng = this.profileForm.get('longitude')?.value;
    if (lat && lng) {
      // Using OpenStreetMap embed which is more reliable
      const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`;
      this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;
    
    this.saving = true;
    this.complaintService.updateProfile(this.profileForm.value).subscribe({
      next: (user) => {
        this.user = user;
        this.saving = false;
        this.profileForm.markAsPristine();
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        
        const stored = localStorage.getItem('user');
        if (stored) {
          const currentUser = JSON.parse(stored);
          currentUser.name = user.name;
          currentUser.contact_info = user.contact_info;
          currentUser.address = user.address;
          currentUser.latitude = user.latitude;
          currentUser.longitude = user.longitude;
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
      }
    });
  }

  getAvatarGradient(): string {
    const gradients: Record<string, string> = {
      'User': 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      'Staff': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      'Admin': 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
    };
    return gradients[this.user?.role || 'User'] || gradients['User'];
  }

  goBack(): void {
    const role = this.authService.currentUser?.role;
    if (role === 'Admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === 'Staff') {
      this.router.navigate(['/staff/dashboard']);
    } else {
      this.router.navigate(['/complaints']);
    }
  }
}
