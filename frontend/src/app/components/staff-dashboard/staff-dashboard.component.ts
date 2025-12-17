import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../services/complaint.service';
import { Complaint, Status } from '../../models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-staff-dashboard',
  template: `
    <div class="dashboard-wrapper">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <mat-icon>engineering</mat-icon>
            <span>Staff Panel</span>
          </div>
        </div>
        <nav class="sidebar-nav">
          <a class="nav-item active">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a class="nav-item">
            <mat-icon>assignment</mat-icon>
            <span>My Tasks</span>
          </a>
          <a class="nav-item">
            <mat-icon>history</mat-icon>
            <span>History</span>
          </a>
          <a class="nav-item">
            <mat-icon>notifications</mat-icon>
            <span>Notifications</span>
          </a>
          <a class="nav-item">
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="staff-profile">
            <div class="profile-avatar">S</div>
            <div class="profile-info">
              <span class="profile-name">Staff Member</span>
              <span class="profile-role">Support Team</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Top Header -->
        <header class="top-header">
          <div class="header-left">
            <h1>My Assigned Tasks</h1>
            <p>Manage and resolve complaints assigned to you</p>
          </div>
          <div class="header-right">
            <div class="date-display">
              <mat-icon>calendar_today</mat-icon>
              <span>{{ today | date:'EEEE, MMM d, y' }}</span>
            </div>
          </div>
        </header>

        <!-- Stats Overview -->
        <div class="stats-overview">
          <div class="stat-card pending">
            <div class="stat-visual">
              <div class="stat-ring">
                <svg viewBox="0 0 36 36">
                  <circle class="ring-bg" cx="18" cy="18" r="15.9"></circle>
                  <circle class="ring-fill" cx="18" cy="18" r="15.9" 
                    [attr.stroke-dasharray]="getPendingPercentage() + ' 100'"
                    stroke-dashoffset="25"></circle>
                </svg>
                <span class="ring-value">{{ getStatusCount('Assigned') }}</span>
              </div>
            </div>
            <div class="stat-info">
              <span class="stat-label">Pending</span>
              <span class="stat-desc">Awaiting action</span>
            </div>
          </div>

          <div class="stat-card progress">
            <div class="stat-visual">
              <div class="stat-ring">
                <svg viewBox="0 0 36 36">
                  <circle class="ring-bg" cx="18" cy="18" r="15.9"></circle>
                  <circle class="ring-fill" cx="18" cy="18" r="15.9"
                    [attr.stroke-dasharray]="getProgressPercentage() + ' 100'"
                    stroke-dashoffset="25"></circle>
                </svg>
                <span class="ring-value">{{ getStatusCount('In-progress') }}</span>
              </div>
            </div>
            <div class="stat-info">
              <span class="stat-label">In Progress</span>
              <span class="stat-desc">Currently working</span>
            </div>
          </div>

          <div class="stat-card resolved">
            <div class="stat-visual">
              <div class="stat-ring">
                <svg viewBox="0 0 36 36">
                  <circle class="ring-bg" cx="18" cy="18" r="15.9"></circle>
                  <circle class="ring-fill" cx="18" cy="18" r="15.9"
                    [attr.stroke-dasharray]="getResolvedPercentage() + ' 100'"
                    stroke-dashoffset="25"></circle>
                </svg>
                <span class="ring-value">{{ getStatusCount('Resolved') }}</span>
              </div>
            </div>
            <div class="stat-info">
              <span class="stat-label">Resolved</span>
              <span class="stat-desc">Completed tasks</span>
            </div>
          </div>

          <div class="stat-card total">
            <div class="stat-visual">
              <mat-icon>assignment</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ complaints.length }}</span>
              <span class="stat-label">Total Assigned</span>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-state">
          <div class="loader">
            <mat-spinner diameter="48"></mat-spinner>
          </div>
          <p>Loading your tasks...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && complaints.length === 0" class="empty-state">
          <div class="empty-icon">
            <mat-icon>inbox</mat-icon>
          </div>
          <h3>No tasks assigned yet</h3>
          <p>When complaints are assigned to you, they'll appear here</p>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-section" *ngIf="!loading && complaints.length > 0">
          <div class="filter-tabs">
            <button class="tab" [class.active]="activeFilter === 'all'" (click)="activeFilter = 'all'">
              <mat-icon>list</mat-icon> All Tasks
            </button>
            <button class="tab" [class.active]="activeFilter === 'Assigned'" (click)="activeFilter = 'Assigned'">
              <mat-icon>pending_actions</mat-icon> Pending
            </button>
            <button class="tab" [class.active]="activeFilter === 'In-progress'" (click)="activeFilter = 'In-progress'">
              <mat-icon>autorenew</mat-icon> In Progress
            </button>
            <button class="tab" [class.active]="activeFilter === 'Resolved'" (click)="activeFilter = 'Resolved'">
              <mat-icon>check_circle</mat-icon> Resolved
            </button>
          </div>
        </div>

        <!-- Complaints Grid -->
        <div class="complaints-grid" *ngIf="!loading && complaints.length > 0">
          <div *ngFor="let c of filteredComplaints" class="complaint-card" [class.resolved]="c.status === 'Resolved'">
            <!-- Card Header -->
            <div class="card-header">
              <div class="category-badge" [ngClass]="c.category">
                <mat-icon>{{ getCategoryIcon(c.category) }}</mat-icon>
                <span>{{ c.category | titlecase }}</span>
              </div>
              <div class="status-tag" [ngClass]="getStatusClass(c.status)">
                <span class="status-dot"></span>
                {{ c.status }}
              </div>
            </div>

            <!-- Card Body -->
            <div class="card-body">
              <h3 class="complaint-title">{{ c.title }}</h3>
              <p class="complaint-desc">{{ c.description }}</p>
              
              <!-- Complainant Info -->
              <div class="complainant-info">
                <div class="info-row">
                  <div class="info-item">
                    <mat-icon>person</mat-icon>
                    <span>{{ c.user_name }}</span>
                  </div>
                  <div class="info-item" *ngIf="c.contact_info">
                    <mat-icon>phone</mat-icon>
                    <span>{{ c.contact_info }}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-item">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ c.created_at | date:'MMM d, y • h:mm a' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Section -->
            <div class="card-actions" *ngIf="c.status !== 'Resolved'">
              <div class="action-row">
                <mat-form-field appearance="outline" class="status-select">
                  <mat-label>Update Status</mat-label>
                  <mat-select [(value)]="c.newStatus">
                    <mat-option value="In-progress">
                      <div class="option-content">
                        <mat-icon>autorenew</mat-icon>
                        <span>Mark In Progress</span>
                      </div>
                    </mat-option>
                    <mat-option value="Resolved">
                      <div class="option-content">
                        <mat-icon>check_circle</mat-icon>
                        <span>Mark Resolved</span>
                      </div>
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="notes-row" *ngIf="c.newStatus === 'Resolved'">
                <mat-form-field appearance="outline" class="notes-field">
                  <mat-label>Resolution Notes</mat-label>
                  <textarea matInput [(ngModel)]="c.notes" rows="3" placeholder="Describe how the issue was resolved..."></textarea>
                </mat-form-field>
              </div>

              <button class="update-btn" (click)="updateStatus(c)" [disabled]="!c.newStatus || updating === c.id">
                <mat-spinner *ngIf="updating === c.id" diameter="18"></mat-spinner>
                <ng-container *ngIf="updating !== c.id">
                  <mat-icon>send</mat-icon>
                  <span>Update Status</span>
                </ng-container>
              </button>
            </div>

            <!-- Resolution Display -->
            <div class="resolution-display" *ngIf="c.resolution_notes">
              <div class="resolution-header">
                <mat-icon>task_alt</mat-icon>
                <span>Resolution Notes</span>
              </div>
              <p class="resolution-text">{{ c.resolution_notes }}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* Dashboard Layout */
    .dashboard-wrapper { display: flex; min-height: 100vh; background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%); }
    
    /* Sidebar */
    .sidebar { width: 260px; background: linear-gradient(180deg, #059669 0%, #047857 100%); color: white; position: fixed; height: 100vh; display: flex; flex-direction: column; z-index: 100; }
    .sidebar-header { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.15); }
    .logo { display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 700; }
    .logo mat-icon { background: rgba(255,255,255,0.2); padding: 8px; border-radius: 10px; font-size: 24px; width: 24px; height: 24px; }
    
    .sidebar-nav { padding: 16px 12px; flex: 1; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px; color: rgba(255,255,255,0.7); text-decoration: none; margin-bottom: 4px; cursor: pointer; transition: all 0.2s; }
    .nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
    .nav-item.active { background: rgba(255,255,255,0.2); color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .nav-item mat-icon { font-size: 20px; width: 20px; height: 20px; }
    
    .sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.15); }
    .staff-profile { display: flex; align-items: center; gap: 12px; }
    .profile-avatar { width: 42px; height: 42px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 18px; }
    .profile-info { flex: 1; }
    .profile-name { display: block; font-weight: 600; font-size: 14px; }
    .profile-role { display: block; font-size: 12px; color: rgba(255,255,255,0.7); }
    
    /* Main Content */
    .main-content { flex: 1; margin-left: 260px; padding: 24px 32px; }
    
    /* Top Header */
    .top-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .header-left h1 { font-size: 28px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
    .header-left p { color: #64748b; margin: 0; font-size: 14px; }
    .date-display { display: flex; align-items: center; gap: 8px; background: white; padding: 12px 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); color: #475569; font-size: 14px; }
    .date-display mat-icon { color: #059669; font-size: 20px; }
    
    /* Stats Overview */
    .stats-overview { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }
    .stat-card { background: white; border-radius: 20px; padding: 24px; display: flex; align-items: center; gap: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s; }
    .stat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    
    .stat-visual { position: relative; }
    .stat-ring { width: 70px; height: 70px; position: relative; }
    .stat-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .stat-ring circle { fill: none; stroke-width: 3; stroke-linecap: round; }
    .ring-bg { stroke: #e2e8f0; }
    .pending .ring-fill { stroke: #f59e0b; }
    .progress .ring-fill { stroke: #8b5cf6; }
    .resolved .ring-fill { stroke: #10b981; }
    .ring-value { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 20px; font-weight: 700; color: #1e293b; }
    
    .stat-card.total .stat-visual { width: 70px; height: 70px; background: linear-gradient(135deg, #059669, #10b981); border-radius: 16px; display: flex; align-items: center; justify-content: center; }
    .stat-card.total .stat-visual mat-icon { font-size: 32px; width: 32px; height: 32px; color: white; }
    .stat-card.total .stat-value { font-size: 28px; font-weight: 700; color: #1e293b; display: block; }
    
    .stat-info { }
    .stat-label { font-size: 15px; font-weight: 600; color: #1e293b; display: block; }
    .stat-desc { font-size: 12px; color: #94a3b8; }
    
    /* Loading & Empty States */
    .loading-state { text-align: center; padding: 80px 20px; background: white; border-radius: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .loading-state p { color: #64748b; margin-top: 16px; }
    
    .empty-state { text-align: center; padding: 80px 20px; background: white; border-radius: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .empty-icon { width: 100px; height: 100px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    .empty-icon mat-icon { font-size: 48px; width: 48px; height: 48px; color: #059669; }
    .empty-state h3 { font-size: 20px; color: #1e293b; margin: 0 0 8px; }
    .empty-state p { color: #64748b; margin: 0; }
    
    /* Filter Section */
    .filter-section { margin-bottom: 24px; }
    .filter-tabs { display: flex; gap: 8px; background: white; padding: 8px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .tab { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border: none; background: transparent; border-radius: 12px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; transition: all 0.2s; }
    .tab:hover { background: #f1f5f9; color: #1e293b; }
    .tab.active { background: linear-gradient(135deg, #059669, #10b981); color: white; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); }
    .tab mat-icon { font-size: 18px; width: 18px; height: 18px; }
    
    /* Complaints Grid */
    .complaints-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .complaint-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s; }
    .complaint-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
    .complaint-card.resolved { opacity: 0.75; }
    
    /* Card Header */
    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-bottom: 1px solid #e2e8f0; }
    .category-badge { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; }
    .category-badge mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .category-badge.plumbing { background: #dbeafe; color: #1d4ed8; }
    .category-badge.electrical { background: #fef3c7; color: #b45309; }
    .category-badge.facility { background: #d1fae5; color: #047857; }
    .category-badge.other { background: #f1f5f9; color: #475569; }
    
    .status-tag { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; }
    .status-tag.status-assigned { background: #fef3c7; color: #b45309; }
    .status-tag.status-assigned .status-dot { background: #b45309; }
    .status-tag.status-in-progress { background: #ede9fe; color: #7c3aed; }
    .status-tag.status-in-progress .status-dot { background: #7c3aed; }
    .status-tag.status-resolved { background: #d1fae5; color: #059669; }
    .status-tag.status-resolved .status-dot { background: #059669; }
    
    /* Card Body */
    .card-body { padding: 24px; }
    .complaint-title { font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 8px; line-height: 1.4; }
    .complaint-desc { font-size: 14px; color: #64748b; margin: 0 0 20px; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    
    .complainant-info { background: #f8fafc; border-radius: 12px; padding: 16px; }
    .info-row { display: flex; flex-wrap: wrap; gap: 16px; }
    .info-row + .info-row { margin-top: 10px; }
    .info-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #475569; }
    .info-item mat-icon { font-size: 16px; width: 16px; height: 16px; color: #059669; }
    
    /* Card Actions */
    .card-actions { padding: 0 24px 24px; }
    .action-row { margin-bottom: 12px; }
    .status-select { width: 100%; }
    .status-select ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    .option-content { display: flex; align-items: center; gap: 10px; }
    .option-content mat-icon { font-size: 18px; width: 18px; height: 18px; color: #059669; }
    
    .notes-row { margin-bottom: 16px; }
    .notes-field { width: 100%; }
    .notes-field ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    
    .update-btn { width: 100%; padding: 14px 24px; border: none; border-radius: 12px; background: linear-gradient(135deg, #059669, #10b981); color: white; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; }
    .update-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(5, 150, 105, 0.35); }
    .update-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .update-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    
    /* Resolution Display */
    .resolution-display { margin: 0 24px 24px; padding: 16px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 12px; border-left: 4px solid #10b981; }
    .resolution-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .resolution-header mat-icon { font-size: 20px; width: 20px; height: 20px; color: #059669; }
    .resolution-header span { font-size: 13px; font-weight: 600; color: #047857; }
    .resolution-text { font-size: 14px; color: #065f46; margin: 0; line-height: 1.5; }
    
    /* Responsive */
    @media (max-width: 1200px) {
      .stats-overview { grid-template-columns: repeat(2, 1fr); }
      .complaints-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 900px) {
      .sidebar { display: none; }
      .main-content { margin-left: 0; }
    }
    @media (max-width: 600px) {
      .stats-overview { grid-template-columns: 1fr; }
      .top-header { flex-direction: column; gap: 16px; align-items: flex-start; }
      .filter-tabs { flex-wrap: wrap; }
    }
  `]
})
export class StaffDashboardComponent implements OnInit {
  complaints: (Complaint & { newStatus?: Status; notes?: string })[] = [];
  loading = true;
  updating: number | null = null;
  activeFilter = 'all';
  today = new Date();

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

  get filteredComplaints(): (Complaint & { newStatus?: Status; notes?: string })[] {
    if (this.activeFilter === 'all') return this.complaints;
    return this.complaints.filter(c => c.status === this.activeFilter);
  }

  getStatusCount(status: string): number {
    return this.complaints.filter(c => c.status === status).length;
  }

  getPendingPercentage(): number {
    const total = this.complaints.length || 1;
    return (this.getStatusCount('Assigned') / total) * 100;
  }

  getProgressPercentage(): number {
    const total = this.complaints.length || 1;
    return (this.getStatusCount('In-progress') / total) * 100;
  }

  getResolvedPercentage(): number {
    const total = this.complaints.length || 1;
    return (this.getStatusCount('Resolved') / total) * 100;
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
