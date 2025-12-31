import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../services/complaint.service';
import { Complaint } from '../../models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-complaint-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>My Complaints</h1>
            <p>Track and manage your submitted complaints</p>
          </div>
          <button mat-raised-button color="primary" routerLink="/complaints/new" class="new-btn">
            <mat-icon>add</mat-icon> New Complaint
          </button>
        </div>
        
        <div class="stats-row">
          <div class="stat-card">
            <mat-icon class="stat-icon open">pending</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ getStatusCount('Open') }}</span>
              <span class="stat-label">Open</span>
            </div>
          </div>
          <div class="stat-card">
            <mat-icon class="stat-icon assigned">assignment_ind</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ getStatusCount('Assigned') }}</span>
              <span class="stat-label">Assigned</span>
            </div>
          </div>
          <div class="stat-card">
            <mat-icon class="stat-icon progress">autorenew</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ getStatusCount('In-progress') }}</span>
              <span class="stat-label">In Progress</span>
            </div>
          </div>
          <div class="stat-card">
            <mat-icon class="stat-icon resolved">check_circle</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ getStatusCount('Resolved') }}</span>
              <span class="stat-label">Resolved</span>
            </div>
          </div>
        </div>
      </div>

      <div class="content">
        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Loading complaints...</p>
        </div>

        <div *ngIf="!loading && complaints.length === 0" class="empty-state">
          <mat-icon>inbox</mat-icon>
          <h3>No complaints yet</h3>
          <p>Submit your first complaint to get started</p>
          <button mat-raised-button color="primary" routerLink="/complaints/new">
            <mat-icon>add</mat-icon> Submit Complaint
          </button>
        </div>

        <div class="complaints-grid" *ngIf="!loading && complaints.length > 0">
          <mat-card *ngFor="let c of complaints" class="complaint-card">
            <div class="card-header">
              <div class="category-badge" [ngClass]="c.category">
                <mat-icon>{{ getCategoryIcon(c.category) }}</mat-icon>
                {{ c.category | titlecase }}
              </div>
              <div class="status-badge" [ngClass]="getStatusClass(c.status)">
                {{ c.status }}
              </div>
            </div>
            
            <mat-card-content>
              <h3 class="complaint-title">{{ c.title }}</h3>
              <p class="complaint-desc">{{ c.description }}</p>
              
              <div class="complaint-meta">
                <div class="meta-item">
                  <mat-icon>calendar_today</mat-icon>
                  {{ c.created_at | date:'MMM d, y' }}
                </div>
                <div class="meta-item" *ngIf="c.staff_name">
                  <mat-icon>person</mat-icon>
                  {{ c.staff_name }}
                </div>
              </div>

              <div class="resolution-box" *ngIf="c.resolution_notes">
                <div class="resolution-header">
                  <mat-icon>task_alt</mat-icon> Resolution
                </div>
                <p>{{ c.resolution_notes }}</p>
              </div>

              <!-- Feedback Section for Resolved Complaints -->
              <div class="feedback-section" *ngIf="c.status === 'Resolved'">
                <div *ngIf="c.feedback_rating" class="feedback-submitted">
                  <div class="feedback-header">
                    <mat-icon>rate_review</mat-icon> Your Feedback
                  </div>
                  <div class="stars-display">
                    <mat-icon *ngFor="let star of [1,2,3,4,5]" [class.filled]="star <= (c.feedback_rating || 0)">
                      {{ star <= (c.feedback_rating || 0) ? 'star' : 'star_border' }}
                    </mat-icon>
                  </div>
                  <p *ngIf="c.feedback_comment" class="feedback-comment">{{ c.feedback_comment }}</p>
                </div>

                <div *ngIf="!c.feedback_rating" class="feedback-form">
                  <div class="feedback-header">
                    <mat-icon>rate_review</mat-icon> Rate this resolution
                  </div>
                  <div class="stars-input">
                    <mat-icon *ngFor="let star of [1,2,3,4,5]" 
                      (click)="setRating(c, star)"
                      [class.filled]="star <= (c.tempRating || 0)">
                      {{ star <= (c.tempRating || 0) ? 'star' : 'star_border' }}
                    </mat-icon>
                  </div>
                  <mat-form-field appearance="outline" class="feedback-input" *ngIf="c.tempRating">
                    <mat-label>Comment (optional)</mat-label>
                    <textarea matInput [(ngModel)]="c.tempComment" rows="2" placeholder="Share your experience..."></textarea>
                  </mat-form-field>
                  <button mat-raised-button color="primary" *ngIf="c.tempRating" 
                    (click)="submitFeedback(c)" [disabled]="c.submittingFeedback" class="submit-feedback-btn">
                    <mat-spinner *ngIf="c.submittingFeedback" diameter="18"></mat-spinner>
                    <span *ngIf="!c.submittingFeedback">Submit Feedback</span>
                  </button>
                </div>
              </div>

              <!-- Chat Section for Assigned/In-Progress Complaints -->
              <app-chat *ngIf="c.staff_id && c.status !== 'Open'" [complaintId]="c.id"></app-chat>
            </mat-card-content>

            <div class="status-timeline">
              <div class="timeline-step" [class.active]="isStatusActive(c.status, 'Open')" [class.completed]="isStatusCompleted(c.status, 'Open')">
                <div class="step-dot"></div>
                <span>Open</span>
              </div>
              <div class="timeline-line" [class.active]="isStatusCompleted(c.status, 'Open')"></div>
              <div class="timeline-step" [class.active]="isStatusActive(c.status, 'Assigned')" [class.completed]="isStatusCompleted(c.status, 'Assigned')">
                <div class="step-dot"></div>
                <span>Assigned</span>
              </div>
              <div class="timeline-line" [class.active]="isStatusCompleted(c.status, 'Assigned')"></div>
              <div class="timeline-step" [class.active]="isStatusActive(c.status, 'In-progress')" [class.completed]="isStatusCompleted(c.status, 'In-progress')">
                <div class="step-dot"></div>
                <span>In Progress</span>
              </div>
              <div class="timeline-line" [class.active]="isStatusCompleted(c.status, 'In-progress')"></div>
              <div class="timeline-step" [class.resolved-active]="isStatusActive(c.status, 'Resolved')" [class.completed]="isStatusCompleted(c.status, 'Resolved')">
                <div class="step-dot"></div>
                <span>Resolved</span>
              </div>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 32px; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .header-text h1 { font-size: 32px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .header-text p { color: #6b7280; margin: 0; }
    .new-btn { height: 48px !important; padding: 0 24px !important; }
    .new-btn mat-icon { margin-right: 8px; }
    
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .stat-card { background: white; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-icon { font-size: 28px; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.open { background: #dbeafe; color: #2563eb; }
    .stat-icon.assigned { background: #fef3c7; color: #d97706; }
    .stat-icon.progress { background: #ede9fe; color: #7c3aed; }
    .stat-icon.resolved { background: #d1fae5; color: #059669; }
    .stat-value { font-size: 24px; font-weight: 700; color: #111827; display: block; }
    .stat-label { font-size: 13px; color: #6b7280; }

    .loading-state, .empty-state { text-align: center; padding: 80px 20px; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: #d1d5db; }
    .empty-state h3 { color: #374151; margin: 16px 0 8px; }
    .empty-state p { color: #6b7280; margin-bottom: 24px; }

    .complaints-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
    .complaint-card { padding: 0 !important; overflow: hidden; }
    .complaint-card:hover { transform: translateY(-4px); }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
    .category-badge { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; padding: 6px 12px; border-radius: 20px; }
    .category-badge mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .category-badge.plumbing { background: #dbeafe; color: #1d4ed8; }
    .category-badge.electrical { background: #fef3c7; color: #b45309; }
    .category-badge.facility { background: #d1fae5; color: #047857; }
    .category-badge.other { background: #e5e7eb; color: #374151; }
    
    .status-badge { font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-badge.status-open { background: #dbeafe; color: #1d4ed8; }
    .status-badge.status-assigned { background: #fef3c7; color: #b45309; }
    .status-badge.status-in-progress { background: #ede9fe; color: #6d28d9; }
    .status-badge.status-resolved { background: #d1fae5; color: #047857; }

    mat-card-content { padding: 20px !important; }
    .complaint-title { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 8px; }
    .complaint-desc { color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    
    .complaint-meta { display: flex; gap: 20px; margin-bottom: 16px; }
    .meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; }
    .meta-item mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .resolution-box { background: #ecfdf5; border-radius: 8px; padding: 12px 16px; border-left: 4px solid #10b981; margin-bottom: 16px; }
    .resolution-header { display: flex; align-items: center; gap: 6px; font-weight: 600; color: #047857; font-size: 13px; margin-bottom: 4px; }
    .resolution-header mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .resolution-box p { margin: 0; font-size: 13px; color: #065f46; }

    /* Location Section */
    .location-section { background: #f0f9ff; border-radius: 8px; overflow: hidden; margin-bottom: 16px; border: 1px solid #bae6fd; }
    .location-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px; cursor: pointer; transition: background 0.2s; }
    .location-header:hover { background: #e0f2fe; }
    .location-header mat-icon { color: #0284c7; font-size: 18px; width: 18px; height: 18px; }
    .location-header span { flex: 1; font-size: 13px; color: #0369a1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .location-header .expand-icon { color: #64748b; }
    .map-container { padding: 16px; background: #e0f2fe; }
    .map-info { }
    .coords-display { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #0369a1; margin-bottom: 12px; font-family: monospace; }
    .coords-display mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .view-map-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: #0284c7; color: white; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; transition: background 0.2s; }
    .view-map-btn:hover { background: #0369a1; }
    .view-map-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* Feedback Styles */
    .feedback-section { background: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0; }
    .feedback-header { display: flex; align-items: center; gap: 6px; font-weight: 600; color: #475569; font-size: 13px; margin-bottom: 12px; }
    .feedback-header mat-icon { font-size: 18px; width: 18px; height: 18px; color: #6366f1; }
    
    .stars-input, .stars-display { display: flex; gap: 4px; margin-bottom: 12px; }
    .stars-input mat-icon { cursor: pointer; font-size: 28px; width: 28px; height: 28px; color: #d1d5db; transition: all 0.2s; }
    .stars-input mat-icon:hover { color: #fbbf24; transform: scale(1.1); }
    .stars-input mat-icon.filled { color: #f59e0b; }
    .stars-display mat-icon { font-size: 24px; width: 24px; height: 24px; color: #d1d5db; }
    .stars-display mat-icon.filled { color: #f59e0b; }
    
    .feedback-input { width: 100%; margin-bottom: 8px; }
    .feedback-comment { font-size: 13px; color: #475569; margin: 0; font-style: italic; }
    .submit-feedback-btn { min-width: 140px; }

    .status-timeline { display: flex; align-items: center; padding: 16px 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
    .timeline-step { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .step-dot { width: 12px; height: 12px; border-radius: 50%; background: #d1d5db; transition: all 0.3s; }
    .timeline-step span { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }
    .timeline-step.active .step-dot { background: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.2); }
    .timeline-step.active span { color: #6366f1; font-weight: 600; }
    .timeline-step.completed .step-dot { background: #10b981; }
    .timeline-step.completed span { color: #10b981; }
    .timeline-step.resolved-active .step-dot { background: #10b981; box-shadow: 0 0 0 4px rgba(16,185,129,0.2); }
    .timeline-step.resolved-active span { color: #10b981; font-weight: 600; }
    .timeline-line { flex: 1; height: 2px; background: #e5e7eb; margin: 0 4px; }
    .timeline-line.active { background: #10b981; }

    @media (max-width: 900px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .complaints-grid { grid-template-columns: 1fr; }
      .header-content { flex-direction: column; gap: 16px; }
    }
  `]
})
export class ComplaintListComponent implements OnInit {
  complaints: (Complaint & { tempRating?: number; tempComment?: string; submittingFeedback?: boolean; showMap?: boolean })[] = [];
  loading = true;

  constructor(
    private complaintService: ComplaintService, 
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.complaintService.getMyComplaints().subscribe({
      next: (data) => { this.complaints = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getStatusCount(status: string): number {
    return this.complaints.filter(c => c.status === status).length;
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '-');
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = { plumbing: 'plumbing', electrical: 'electrical_services', facility: 'apartment', other: 'help_outline' };
    return icons[category] || 'help_outline';
  }

  isStatusActive(current: string, check: string): boolean {
    return current === check;
  }

  isStatusCompleted(current: string, check: string): boolean {
    const order = ['Open', 'Assigned', 'In-progress', 'Resolved'];
    return order.indexOf(current) > order.indexOf(check);
  }

  setRating(complaint: Complaint & { tempRating?: number }, rating: number): void {
    complaint.tempRating = rating;
  }

  toggleMap(complaint: Complaint & { showMap?: boolean }): void {
    complaint.showMap = !complaint.showMap;
  }

  getMapUrl(complaint: Complaint): SafeResourceUrl {
    // Using OpenStreetMap static image
    const url = `https://staticmap.openstreetmap.de/staticmap.php?center=${complaint.latitude},${complaint.longitude}&zoom=15&size=400x200&markers=${complaint.latitude},${complaint.longitude},red-pushpin`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  submitFeedback(complaint: Complaint & { tempRating?: number; tempComment?: string; submittingFeedback?: boolean }): void {
    if (!complaint.tempRating) return;
    
    complaint.submittingFeedback = true;
    this.complaintService.submitFeedback(complaint.id, complaint.tempRating, complaint.tempComment).subscribe({
      next: () => {
        complaint.feedback_rating = complaint.tempRating;
        complaint.feedback_comment = complaint.tempComment;
        complaint.submittingFeedback = false;
        this.snackBar.open('Thank you for your feedback!', 'Close', { duration: 3000 });
      },
      error: () => {
        complaint.submittingFeedback = false;
        this.snackBar.open('Failed to submit feedback', 'Close', { duration: 3000 });
      }
    });
  }
}
