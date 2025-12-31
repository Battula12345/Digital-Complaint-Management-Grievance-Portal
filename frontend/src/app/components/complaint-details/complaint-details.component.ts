import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ComplaintService } from '../../services/complaint.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-complaint-details',
  template: `
    <div class="page-container">
      <div class="form-wrapper">
        <div class="form-header">
          <button mat-icon-button routerLink="/complaints" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>Submit New Complaint</h1>
            <p>Fill in the details below to register your complaint</p>
          </div>
        </div>

        <mat-card class="form-card">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-section">
              <h3><mat-icon>info</mat-icon> Basic Information</h3>
              
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Complaint Title</mat-label>
                <input matInput formControlName="title" placeholder="Brief title for your complaint">
                <mat-hint>Keep it short and descriptive</mat-hint>
                <mat-error>Title is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category">
                  <mat-option value="plumbing"><mat-icon class="option-icon">plumbing</mat-icon> Plumbing</mat-option>
                  <mat-option value="electrical"><mat-icon class="option-icon">electrical_services</mat-icon> Electrical</mat-option>
                  <mat-option value="facility"><mat-icon class="option-icon">apartment</mat-icon> Facility</mat-option>
                  <mat-option value="maintenance"><mat-icon class="option-icon">build</mat-icon> Maintenance</mat-option>
                  <mat-option value="cleaning"><mat-icon class="option-icon">cleaning_services</mat-icon> Cleaning</mat-option>
                  <mat-option value="security"><mat-icon class="option-icon">security</mat-icon> Security</mat-option>
                  <mat-option value="internet"><mat-icon class="option-icon">wifi</mat-icon> Internet</mat-option>
                  <mat-option value="parking"><mat-icon class="option-icon">local_parking</mat-icon> Parking</mat-option>
                  <mat-option value="noise"><mat-icon class="option-icon">volume_up</mat-icon> Noise</mat-option>
                  <mat-option value="water"><mat-icon class="option-icon">water_drop</mat-icon> Water</mat-option>
                  <mat-option value="ac"><mat-icon class="option-icon">ac_unit</mat-icon> Air Conditioning</mat-option>
                  <mat-option value="elevator"><mat-icon class="option-icon">elevator</mat-icon> Elevator</mat-option>
                  <mat-option value="garbage"><mat-icon class="option-icon">delete</mat-icon> Garbage</mat-option>
                  <mat-option value="pest"><mat-icon class="option-icon">bug_report</mat-icon> Pest Control</mat-option>
                  <mat-option value="lighting"><mat-icon class="option-icon">lightbulb</mat-icon> Lighting</mat-option>
                  <mat-option value="heating"><mat-icon class="option-icon">thermostat</mat-icon> Heating</mat-option>
                  <mat-option value="ventilation"><mat-icon class="option-icon">air</mat-icon> Ventilation</mat-option>
                  <mat-option value="fire-safety"><mat-icon class="option-icon">local_fire_department</mat-icon> Fire Safety</mat-option>
                  <mat-option value="structural"><mat-icon class="option-icon">foundation</mat-icon> Structural</mat-option>
                  <mat-option value="landscaping"><mat-icon class="option-icon">grass</mat-icon> Landscaping</mat-option>
                  <mat-option value="furniture"><mat-icon class="option-icon">chair</mat-icon> Furniture</mat-option>
                  <mat-option value="appliances"><mat-icon class="option-icon">kitchen</mat-icon> Appliances</mat-option>
                  <mat-option value="doors-windows"><mat-icon class="option-icon">door_front</mat-icon> Doors & Windows</mat-option>
                  <mat-option value="flooring"><mat-icon class="option-icon">texture</mat-icon> Flooring</mat-option>
                  <mat-option value="other"><mat-icon class="option-icon">help_outline</mat-icon> Other</mat-option>
                </mat-select>
                <mat-error>Please select a category</mat-error>
              </mat-form-field>
            </div>

            <div class="form-section">
              <h3><mat-icon>description</mat-icon> Description</h3>
              
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Detailed Description</mat-label>
                <textarea matInput formControlName="description" rows="5" placeholder="Describe your issue in detail..."></textarea>
                <mat-hint>Include location, time, and any relevant details</mat-hint>
                <mat-error>Description is required</mat-error>
              </mat-form-field>
            </div>

            <!-- Location Section -->
            <div class="form-section">
              <h3><mat-icon>location_on</mat-icon> Location</h3>
              
              <div class="location-box">
                <div class="location-status" *ngIf="!location && !locationError && !gettingLocation">
                  <mat-icon>my_location</mat-icon>
                  <p>Add your location to help staff find the issue faster</p>
                  <button mat-raised-button color="primary" type="button" (click)="getLocation()">
                    <mat-icon>gps_fixed</mat-icon> Get My Location
                  </button>
                </div>

                <div class="location-loading" *ngIf="gettingLocation">
                  <mat-spinner diameter="24"></mat-spinner>
                  <span>Getting your location...</span>
                </div>

                <div class="location-error" *ngIf="locationError">
                  <mat-icon>error_outline</mat-icon>
                  <span>{{ locationError }}</span>
                  <button mat-button type="button" (click)="getLocation()">Try Again</button>
                </div>

                <div class="location-success" *ngIf="location">
                  <div class="location-info">
                    <mat-icon>check_circle</mat-icon>
                    <div class="location-details">
                      <span class="location-label">Location captured</span>
                      <span class="location-coords">{{ location.latitude.toFixed(6) }}, {{ location.longitude.toFixed(6) }}</span>
                      <span class="location-address" *ngIf="locationAddress">{{ locationAddress }}</span>
                    </div>
                    <button mat-icon-button type="button" (click)="clearLocation()" matTooltip="Remove location">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                  <div class="map-container">
                    <iframe [src]="mapUrl" frameborder="0" allowfullscreen loading="lazy"></iframe>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3><mat-icon>attach_file</mat-icon> Attachments (Optional)</h3>
              
              <div class="file-upload-area" (click)="fileInput.click()" [class.has-file]="selectedFile">
                <input #fileInput type="file" hidden (change)="onFileSelect($event)" accept="image/*,.pdf,.doc,.docx">
                <mat-icon>{{ selectedFile ? 'insert_drive_file' : 'cloud_upload' }}</mat-icon>
                <p *ngIf="!selectedFile">Click to upload or drag and drop</p>
                <p *ngIf="selectedFile" class="file-name">{{ selectedFile.name }}</p>
                <span class="file-hint">Images, PDF, DOC up to 10MB</span>
              </div>
              <button *ngIf="selectedFile" mat-button type="button" (click)="removeFile($event)" class="remove-file">
                <mat-icon>close</mat-icon> Remove file
              </button>
            </div>

            <div *ngIf="error" class="error-message">
              <mat-icon>error</mat-icon> {{ error }}
            </div>
            <div *ngIf="success" class="success-message">
              <mat-icon>check_circle</mat-icon> {{ success }}
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/complaints">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading">
                <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
                <mat-icon *ngIf="!loading">send</mat-icon>
                <span>{{ loading ? 'Submitting...' : 'Submit Complaint' }}</span>
              </button>
            </div>
          </form>
        </mat-card>
      </div>

      <div class="tips-sidebar">
        <mat-card class="tips-card">
          <h3><mat-icon>lightbulb</mat-icon> Tips for a Good Complaint</h3>
          <ul>
            <li><strong>Be specific</strong> - Include exact location and details</li>
            <li><strong>Add photos</strong> - Visual evidence helps resolution</li>
            <li><strong>Add location</strong> - Helps staff find the issue</li>
            <li><strong>Include timing</strong> - When did the issue start?</li>
          </ul>
        </mat-card>

        <mat-card class="process-card">
          <h3><mat-icon>timeline</mat-icon> What Happens Next?</h3>
          <div class="process-steps">
            <div class="process-step">
              <div class="step-number">1</div>
              <div class="step-text">
                <strong>Submission</strong>
                <span>Your complaint is registered</span>
              </div>
            </div>
            <div class="process-step">
              <div class="step-number">2</div>
              <div class="step-text">
                <strong>Assignment</strong>
                <span>Admin assigns to staff</span>
              </div>
            </div>
            <div class="process-step">
              <div class="step-number">3</div>
              <div class="step-text">
                <strong>Resolution</strong>
                <span>Staff works on your issue</span>
              </div>
            </div>
            <div class="process-step">
              <div class="step-number">4</div>
              <div class="step-text">
                <strong>Closure</strong>
                <span>Issue resolved & closed</span>
              </div>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display: grid; grid-template-columns: 1fr 320px; gap: 24px; padding: 24px; max-width: 1200px; margin: 0 auto; }
    .form-wrapper { min-width: 0; }
    .form-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .back-btn { background: white !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .form-header h1 { font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .form-header p { color: #6b7280; margin: 0; }
    
    .form-card { padding: 32px !important; }
    .form-section { margin-bottom: 32px; }
    .form-section h3 { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; color: #374151; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
    .form-section h3 mat-icon { color: #6366f1; font-size: 20px; width: 20px; height: 20px; }
    
    .option-icon { vertical-align: middle; margin-right: 8px; font-size: 20px; }

    /* Location Styles */
    .location-box { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .location-status { padding: 32px; text-align: center; background: #f9fafb; }
    .location-status mat-icon { font-size: 48px; width: 48px; height: 48px; color: #9ca3af; }
    .location-status p { color: #6b7280; margin: 12px 0 16px; }
    
    .location-loading { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 24px; background: #f9fafb; }
    .location-loading span { color: #6b7280; }
    
    .location-error { display: flex; align-items: center; gap: 12px; padding: 16px; background: #fef2f2; color: #dc2626; }
    .location-error mat-icon { flex-shrink: 0; }
    .location-error span { flex: 1; }
    
    .location-success { background: #f0fdf4; }
    .location-info { display: flex; align-items: center; gap: 12px; padding: 16px; border-bottom: 1px solid #d1fae5; }
    .location-info > mat-icon { color: #10b981; font-size: 24px; width: 24px; height: 24px; }
    .location-details { flex: 1; display: flex; flex-direction: column; }
    .location-label { font-weight: 600; color: #047857; font-size: 14px; }
    .location-coords { font-size: 12px; color: #6b7280; font-family: monospace; }
    .location-address { font-size: 13px; color: #065f46; margin-top: 4px; }
    
    .map-container { height: 200px; }
    .map-container iframe { width: 100%; height: 100%; border: none; }
    
    .file-upload-area { border: 2px dashed #d1d5db; border-radius: 12px; padding: 32px; text-align: center; cursor: pointer; transition: all 0.3s; background: #f9fafb; }
    .file-upload-area:hover { border-color: #6366f1; background: #f5f3ff; }
    .file-upload-area.has-file { border-color: #10b981; background: #ecfdf5; }
    .file-upload-area mat-icon { font-size: 48px; width: 48px; height: 48px; color: #9ca3af; }
    .file-upload-area.has-file mat-icon { color: #10b981; }
    .file-upload-area p { margin: 12px 0 4px; color: #374151; font-weight: 500; }
    .file-upload-area .file-hint { font-size: 12px; color: #9ca3af; }
    .file-name { color: #10b981 !important; }
    .remove-file { margin-top: 8px; color: #ef4444 !important; }
    
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 24px; border-top: 1px solid #e5e7eb; }
    .form-actions button[color="primary"] { height: 48px !important; padding: 0 32px !important; }
    .form-actions button[color="primary"] mat-icon { margin-right: 8px; }
    
    .tips-sidebar { display: flex; flex-direction: column; gap: 16px; }
    .tips-card, .process-card { padding: 24px !important; }
    .tips-card h3, .process-card h3 { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; color: #374151; margin: 0 0 16px; }
    .tips-card h3 mat-icon, .process-card h3 mat-icon { color: #f59e0b; }
    .process-card h3 mat-icon { color: #6366f1; }
    .tips-card ul { margin: 0; padding-left: 20px; }
    .tips-card li { color: #4b5563; font-size: 14px; margin-bottom: 12px; line-height: 1.5; }
    
    .process-steps { display: flex; flex-direction: column; gap: 16px; }
    .process-step { display: flex; align-items: flex-start; gap: 12px; }
    .step-number { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
    .step-text { display: flex; flex-direction: column; }
    .step-text strong { font-size: 14px; color: #111827; }
    .step-text span { font-size: 12px; color: #6b7280; }
    
    .error-message, .success-message { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    
    @media (max-width: 900px) {
      .page-container { grid-template-columns: 1fr; }
      .tips-sidebar { display: none; }
    }
  `]
})
export class ComplaintDetailsComponent implements OnInit {
  form: FormGroup;
  selectedFile: File | null = null;
  loading = false;
  error = '';
  success = '';
  
  // Location
  location: { latitude: number; longitude: number } | null = null;
  locationAddress = '';
  locationError = '';
  gettingLocation = false;
  mapUrl: SafeResourceUrl | null = null;

  constructor(
    private fb: FormBuilder, 
    private complaintService: ComplaintService, 
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load user's saved location from profile
    this.loadUserLocation();
  }

  loadUserLocation(): void {
    this.complaintService.getProfile().subscribe({
      next: (user) => {
        if (user.latitude && user.longitude) {
          this.location = {
            latitude: user.latitude,
            longitude: user.longitude
          };
          this.locationAddress = user.address || '';
          this.updateMapUrl();
        }
      },
      error: () => {}
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
        this.location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        this.gettingLocation = false;
        this.updateMapUrl();
        this.reverseGeocode();
      },
      (error) => {
        this.gettingLocation = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.locationError = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            this.locationError = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            this.locationError = 'Location request timed out. Please try again.';
            break;
          default:
            this.locationError = 'An error occurred getting your location.';
        }
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
    );
  }

  updateMapUrl(): void {
    if (this.location) {
      // Using OpenStreetMap embed which is more reliable
      const url = `https://www.openstreetmap.org/export/embed.html?bbox=${this.location.longitude - 0.005},${this.location.latitude - 0.005},${this.location.longitude + 0.005},${this.location.latitude + 0.005}&layer=mapnik&marker=${this.location.latitude},${this.location.longitude}`;
      this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  reverseGeocode(): void {
    if (!this.location) return;
    
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.location.latitude}&lon=${this.location.longitude}`)
      .then(res => res.json())
      .then(data => {
        if (data.display_name) {
          this.locationAddress = data.display_name;
        }
      })
      .catch(() => {});
  }

  clearLocation(): void {
    this.location = null;
    this.locationAddress = '';
    this.mapUrl = null;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile = input.files[0];
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const formData = new FormData();
    Object.keys(this.form.value).forEach(key => formData.append(key, this.form.value[key]));
    if (this.selectedFile) formData.append('attachment', this.selectedFile);
    
    // Add location data
    if (this.location) {
      formData.append('latitude', this.location.latitude.toString());
      formData.append('longitude', this.location.longitude.toString());
      if (this.locationAddress) {
        formData.append('location_address', this.locationAddress);
      }
    }

    this.complaintService.createComplaint(formData).subscribe({
      next: () => {
        this.success = 'Complaint submitted successfully!';
        setTimeout(() => this.router.navigate(['/complaints']), 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to submit complaint';
        this.loading = false;
      }
    });
  }
}
