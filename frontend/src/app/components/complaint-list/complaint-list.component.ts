import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../services/complaint.service';
import { Complaint } from '../../models';

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
              <div class="timeline-step" [class.active]="isStatusActive(c.status, 'Resolved')" [class.completed]="isStatusCompleted(c.status, 'Resolved')">
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

    .resolution-box { background: #ecfdf5; border-radius: 8px; padding: 12px 16px; border-left: 4px solid #10b981; }
    .resolution-header { display: flex; align-items: center; gap: 6px; font-weight: 600; color: #047857; font-size: 13px; margin-bottom: 4px; }
    .resolution-header mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .resolution-box p { margin: 0; font-size: 13px; color: #065f46; }

    .status-timeline { display: flex; align-items: center; padding: 16px 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
    .timeline-step { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .step-dot { width: 12px; height: 12px; border-radius: 50%; background: #d1d5db; transition: all 0.3s; }
    .timeline-step span { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }
    .timeline-step.active .step-dot { background: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.2); }
    .timeline-step.active span { color: #6366f1; font-weight: 600; }
    .timeline-step.completed .step-dot { background: #10b981; }
    .timeline-step.completed span { color: #10b981; }
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
  complaints: Complaint[] = [];
  loading = true;

  constructor(private complaintService: ComplaintService) {}

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
}
