import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../services/complaint.service';
import { Complaint, Status } from '../../models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-staff-dashboard',
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-text">
          <h1>Staff Dashboard</h1>
          <p>Manage and resolve assigned complaints</p>
        </div>
        
        <div class="stats-row">
          <div class="stat-card assigned">
            <mat-icon>assignment</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ getStatusCount('Assigned') }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
          <div class="stat-card progress">
            <mat-icon>autorenew</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ getStatusCount('In-progress') }}</span>
              <span class="stat-label">In Progress</span>
            </div>
          </div>
          <div class="stat-card resolved">
            <mat-icon>check_circle</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ getStatusCount('Resolved') }}</span>
              <span class="stat-label">Resolved</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Loading complaints...</p>
      </div>

      <div *ngIf="!loading && complaints.length === 0" class="empty-state">
        <mat-icon>inbox</mat-icon>
        <h3>No complaints assigned</h3>
        <p>You don't have any complaints assigned to you yet</p>
      </div>

      <div class="complaints-list" *ngIf="!loading && complaints.length > 0">
        <mat-card *ngFor="let c of complaints" class="complaint-card" [class.resolved]="c.status === 'Resolved'">
          <div class="card-left">
            <div class="category-icon" [ngClass]="c.category">
              <mat-icon>{{ getCategoryIcon(c.category) }}</mat-icon>
            </div>
          </div>
          
          <div class="card-content">
            <div class="card-top">
              <div class="complaint-info">
                <h3>{{ c.title }}</h3>
                <p class="complaint-desc">{{ c.description }}</p>
              </div>
              <div class="status-badge" [ngClass]="getStatusClass(c.status)">
                {{ c.status }}
              </div>
            </div>
            
            <div class="complaint-meta">
              <div class="meta-item">
                <mat-icon>person</mat-icon>
                <span>{{ c.user_name }}</span>
              </div>
              <div class="meta-item" *ngIf="c.contact_info">
                <mat-icon>phone</mat-icon>
                <span>{{ c.contact_info }}</span>
              </div>
              <div class="meta-item">
                <mat-icon>calendar_today</mat-icon>
                <span>{{ c.created_at | date:'MMM d, y' }}</span>
              </div>
              <div class="meta-item">
                <mat-icon>category</mat-icon>
                <span>{{ c.category | titlecase }}</span>
              </div>
            </div>

            <div class="action-section" *ngIf="c.status !== 'Resolved'">
              <mat-form-field appearance="outline">
                <mat-label>Update Status</mat-label>
                <mat-select [(value)]="c.newStatus">
                  <mat-option value="In-progress">
                    <mat-icon class="option-icon">autorenew</mat-icon> Mark In Progress
                  </mat-option>
                  <mat-option value="Resolved">
                    <mat-icon class="option-icon">check_circle</mat-icon> Mark Resolved
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="notes-field" *ngIf="c.newStatus === 'Resolved'">
                <mat-label>Resolution Notes</mat-label>
                <textarea matInput [(ngModel)]="c.notes" rows="2" placeholder="Describe how the issue was resolved..."></textarea>
              </mat-form-field>

              <button mat-raised-button color="primary" (click)="updateStatus(c)" [disabled]="!c.newStatus || updating === c.id">
                <mat-spinner *ngIf="updating === c.id" diameter="18"></mat-spinner>
                <mat-icon *ngIf="updating !== c.id">save</mat-icon>
                {{ updating === c.id ? 'Updating...' : 'Update Status' }}
              </button>
            </div>

            <div class="resolution-box" *ngIf="c.resolution_notes">
              <mat-icon>task_alt</mat-icon>
              <div>
                <strong>Resolution Notes</strong>
                <p>{{ c.resolution_notes }}</p>
              </div>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 32px; }
    .header-text { margin-bottom: 24px; }
    .header-text h1 { font-size: 32px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .header-text p { color: #6b7280; margin: 0; }
    
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .stat-card { background: white; border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-card mat-icon { font-size: 32px; width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .stat-card.assigned mat-icon { background: #fef3c7; color: #d97706; }
    .stat-card.progress mat-icon { background: #ede9fe; color: #7c3aed; }
    .stat-card.resolved mat-icon { background: #d1fae5; color: #059669; }
    .stat-value { font-size: 28px; font-weight: 700; color: #111827; display: block; }
    .stat-label { font-size: 14px; color: #6b7280; }

    .loading-state, .empty-state { text-align: center; padding: 80px 20px; background: white; border-radius: 16px; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: #d1d5db; }
    .empty-state h3 { color: #374151; margin: 16px 0 8px; }
    .empty-state p { color: #6b7280; }

    .complaints-list { display: flex; flex-direction: column; gap: 16px; }
    .complaint-card { display: flex; gap: 20px; padding: 24px !important; }
    .complaint-card.resolved { opacity: 0.7; }
    .complaint-card:hover { transform: translateY(-2px); }
    
    .card-left { flex-shrink: 0; }
    .category-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .category-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .category-icon.plumbing { background: #dbeafe; color: #1d4ed8; }
    .category-icon.electrical { background: #fef3c7; color: #b45309; }
    .category-icon.facility { background: #d1fae5; color: #047857; }
    .category-icon.other { background: #e5e7eb; color: #374151; }
    
    .card-content { flex: 1; min-width: 0; }
    .card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 12px; }
    .complaint-info h3 { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 6px; }
    .complaint-desc { color: #4b5563; font-size: 14px; margin: 0; line-height: 1.5; }
    
    .status-badge { font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
    .status-badge.status-assigned { background: #fef3c7; color: #b45309; }
    .status-badge.status-in-progress { background: #ede9fe; color: #6d28d9; }
    .status-badge.status-resolved { background: #d1fae5; color: #047857; }

    .complaint-meta { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
    .meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; }
    .meta-item mat-icon { font-size: 16px; width: 16px; height: 16px; color: #9ca3af; }

    .action-section { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start; background: #f9fafb; padding: 16px; border-radius: 12px; margin-top: 16px; }
    .action-section mat-form-field { margin-bottom: 0; }
    .notes-field { flex: 1; min-width: 200px; }
    .action-section button { height: 56px; }
    .action-section button mat-icon { margin-right: 8px; }
    .option-icon { vertical-align: middle; margin-right: 8px; }

    .resolution-box { display: flex; gap: 12px; background: #ecfdf5; padding: 16px; border-radius: 12px; margin-top: 16px; border-left: 4px solid #10b981; }
    .resolution-box mat-icon { color: #10b981; flex-shrink: 0; }
    .resolution-box strong { display: block; color: #047857; font-size: 13px; margin-bottom: 4px; }
    .resolution-box p { margin: 0; color: #065f46; font-size: 14px; }

    @media (max-width: 768px) {
      .stats-row { grid-template-columns: 1fr; }
      .complaint-card { flex-direction: column; }
      .card-top { flex-direction: column; }
    }
  `]
})
export class StaffDashboardComponent implements OnInit {
  complaints: (Complaint & { newStatus?: Status; notes?: string })[] = [];
  loading = true;
  updating: number | null = null;

  constructor(private complaintService: ComplaintService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.complaintService.getAssignedComplaints().subscribe({
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

  updateStatus(complaint: Complaint & { newStatus?: Status; notes?: string }): void {
    if (!complaint.newStatus) return;
    this.updating = complaint.id;
    
    this.complaintService.updateStatus(complaint.id, complaint.newStatus, complaint.notes).subscribe({
      next: () => {
        this.snackBar.open('✓ Status updated successfully', 'Close', { duration: 3000, panelClass: 'success-snackbar' });
        this.updating = null;
        this.loadComplaints();
      },
      error: () => {
        this.snackBar.open('✗ Failed to update status', 'Close', { duration: 3000, panelClass: 'error-snackbar' });
        this.updating = null;
      }
    });
  }
}
