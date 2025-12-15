import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../services/complaint.service';
import { Complaint, User, Analytics } from '../../models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview and management of all complaints</p>
      </div>

      <!-- Analytics Cards -->
      <div class="analytics-grid" *ngIf="analytics">
        <mat-card class="analytics-card status-card">
          <h3><mat-icon>pie_chart</mat-icon> Complaint Status</h3>
          <div class="status-bars">
            <div class="status-bar" *ngFor="let s of analytics.statusCounts">
              <div class="bar-label">
                <span class="status-dot" [ngClass]="getStatusClass(s.status)"></span>
                {{ s.status }}
              </div>
              <div class="bar-track">
                <div class="bar-fill" [ngClass]="getStatusClass(s.status)" [style.width.%]="getPercentage(s.count)"></div>
              </div>
              <span class="bar-value">{{ s.count }}</span>
            </div>
          </div>
        </mat-card>

        <mat-card class="analytics-card category-card">
          <h3><mat-icon>category</mat-icon> By Category</h3>
          <div class="category-grid">
            <div class="category-item" *ngFor="let c of analytics.categoryCounts">
              <div class="category-icon" [ngClass]="c.category">
                <mat-icon>{{ getCategoryIcon(c.category) }}</mat-icon>
              </div>
              <div class="category-info">
                <span class="category-name">{{ c.category | titlecase }}</span>
                <span class="category-count">{{ c.count }} complaints</span>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card class="analytics-card users-card">
          <h3><mat-icon>people</mat-icon> User Statistics</h3>
          <div class="users-grid">
            <div class="user-stat" *ngFor="let u of analytics.totalUsers">
              <div class="user-icon" [ngClass]="u.role.toLowerCase()">
                <mat-icon>{{ getRoleIcon(u.role) }}</mat-icon>
              </div>
              <span class="user-count">{{ u.count }}</span>
              <span class="user-role">{{ u.role }}s</span>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Complaints Section -->
      <div class="section-header">
        <h2>All Complaints</h2>
        <div class="filter-tabs">
          <button mat-button [class.active]="filter === 'all'" (click)="filter = 'all'">All</button>
          <button mat-button [class.active]="filter === 'Open'" (click)="filter = 'Open'">Open</button>
          <button mat-button [class.active]="filter === 'Assigned'" (click)="filter = 'Assigned'">Assigned</button>
          <button mat-button [class.active]="filter === 'In-progress'" (click)="filter = 'In-progress'">In Progress</button>
          <button mat-button [class.active]="filter === 'Resolved'" (click)="filter = 'Resolved'">Resolved</button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <div class="complaints-table" *ngIf="!loading">
        <mat-card class="table-card">
          <table>
            <thead>
              <tr>
                <th>Complaint</th>
                <th>Category</th>
                <th>Submitted By</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filteredComplaints">
                <td class="complaint-cell">
                  <strong>{{ c.title }}</strong>
                  <span class="complaint-date">{{ c.created_at | date:'MMM d, y' }}</span>
                </td>
                <td>
                  <div class="category-badge" [ngClass]="c.category">
                    <mat-icon>{{ getCategoryIcon(c.category) }}</mat-icon>
                    {{ c.category | titlecase }}
                  </div>
                </td>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">{{ c.user_name?.charAt(0) }}</div>
                    {{ c.user_name }}
                  </div>
                </td>
                <td>
                  <span class="status-badge" [ngClass]="getStatusClass(c.status)">{{ c.status }}</span>
                </td>
                <td>
                  <span *ngIf="c.staff_name" class="assigned-name">{{ c.staff_name }}</span>
                  <span *ngIf="!c.staff_name && c.status === 'Open'" class="unassigned">Unassigned</span>
                  <span *ngIf="!c.staff_name && c.status !== 'Open'">-</span>
                </td>
                <td>
                  <div class="action-cell" *ngIf="c.status === 'Open'">
                    <mat-form-field appearance="outline" class="assign-field">
                      <mat-select [(value)]="c.selectedStaff" placeholder="Select staff">
                        <mat-option *ngFor="let s of staffList" [value]="s.id">{{ s.name }}</mat-option>
                      </mat-select>
                    </mat-form-field>
                    <button mat-mini-fab color="primary" (click)="assignComplaint(c)" [disabled]="!c.selectedStaff || assigning === c.id" matTooltip="Assign">
                      <mat-spinner *ngIf="assigning === c.id" diameter="18"></mat-spinner>
                      <mat-icon *ngIf="assigning !== c.id">assignment_ind</mat-icon>
                    </button>
                  </div>
                  <span *ngIf="c.status !== 'Open'" class="no-action">-</span>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div *ngIf="filteredComplaints.length === 0" class="empty-table">
            <mat-icon>search_off</mat-icon>
            <p>No complaints found</p>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 32px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .page-header p { color: #6b7280; margin: 0; }

    .analytics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
    .analytics-card { padding: 24px !important; }
    .analytics-card h3 { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; color: #374151; margin: 0 0 20px; }
    .analytics-card h3 mat-icon { color: #6366f1; }

    .status-bars { display: flex; flex-direction: column; gap: 12px; }
    .status-bar { display: flex; align-items: center; gap: 12px; }
    .bar-label { width: 100px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; }
    .status-dot.status-open { background: #3b82f6; }
    .status-dot.status-assigned { background: #f59e0b; }
    .status-dot.status-in-progress { background: #8b5cf6; }
    .status-dot.status-resolved { background: #10b981; }
    .bar-track { flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
    .bar-fill.status-open { background: #3b82f6; }
    .bar-fill.status-assigned { background: #f59e0b; }
    .bar-fill.status-in-progress { background: #8b5cf6; }
    .bar-fill.status-resolved { background: #10b981; }
    .bar-value { font-size: 14px; font-weight: 600; color: #111827; width: 30px; text-align: right; }

    .category-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .category-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 10px; }
    .category-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .category-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .category-icon.plumbing { background: #dbeafe; color: #1d4ed8; }
    .category-icon.electrical { background: #fef3c7; color: #b45309; }
    .category-icon.facility { background: #d1fae5; color: #047857; }
    .category-icon.other { background: #e5e7eb; color: #374151; }
    .category-name { font-size: 14px; font-weight: 500; color: #111827; display: block; }
    .category-count { font-size: 12px; color: #6b7280; }

    .users-grid { display: flex; justify-content: space-around; }
    .user-stat { text-align: center; }
    .user-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; }
    .user-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .user-icon.user { background: #dbeafe; color: #1d4ed8; }
    .user-icon.staff { background: #d1fae5; color: #047857; }
    .user-icon.admin { background: #ede9fe; color: #7c3aed; }
    .user-count { font-size: 28px; font-weight: 700; color: #111827; display: block; }
    .user-role { font-size: 13px; color: #6b7280; }

    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h2 { font-size: 20px; font-weight: 600; color: #111827; margin: 0; }
    .filter-tabs { display: flex; gap: 4px; background: #f3f4f6; padding: 4px; border-radius: 10px; }
    .filter-tabs button { border-radius: 8px !important; min-width: auto; padding: 0 16px; }
    .filter-tabs button.active { background: white !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

    .loading-state { text-align: center; padding: 60px; }
    .table-card { padding: 0 !important; overflow: hidden; }
    
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 16px 20px; background: #f9fafb; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; }
    td { padding: 16px 20px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
    tr:hover { background: #f9fafb; }
    
    .complaint-cell strong { display: block; color: #111827; font-size: 14px; }
    .complaint-date { font-size: 12px; color: #9ca3af; }
    
    .category-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 16px; }
    .category-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .category-badge.plumbing { background: #dbeafe; color: #1d4ed8; }
    .category-badge.electrical { background: #fef3c7; color: #b45309; }
    .category-badge.facility { background: #d1fae5; color: #047857; }
    .category-badge.other { background: #e5e7eb; color: #374151; }
    
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; }
    
    .status-badge { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 16px; text-transform: uppercase; }
    .status-badge.status-open { background: #dbeafe; color: #1d4ed8; }
    .status-badge.status-assigned { background: #fef3c7; color: #b45309; }
    .status-badge.status-in-progress { background: #ede9fe; color: #6d28d9; }
    .status-badge.status-resolved { background: #d1fae5; color: #047857; }
    
    .assigned-name { color: #374151; }
    .unassigned { color: #ef4444; font-size: 13px; }
    .no-action { color: #9ca3af; }
    
    .action-cell { display: flex; align-items: center; gap: 8px; }
    .assign-field { width: 140px; margin: 0; }
    .assign-field ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    
    .empty-table { text-align: center; padding: 60px; color: #9ca3af; }
    .empty-table mat-icon { font-size: 48px; width: 48px; height: 48px; }

    @media (max-width: 1200px) {
      .analytics-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 900px) {
      .section-header { flex-direction: column; gap: 16px; align-items: flex-start; }
      table { display: block; overflow-x: auto; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  complaints: (Complaint & { selectedStaff?: number })[] = [];
  staffList: User[] = [];
  analytics: Analytics | null = null;
  loading = true;
  filter = 'all';
  assigning: number | null = null;

  constructor(private complaintService: ComplaintService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.complaintService.getAllComplaints().subscribe({
      next: (data) => { this.complaints = data; this.loading = false; },
      error: () => this.loading = false
    });
    this.complaintService.getStaffList().subscribe(data => this.staffList = data);
    this.complaintService.getAnalytics().subscribe(data => this.analytics = data);
  }

  get filteredComplaints(): (Complaint & { selectedStaff?: number })[] {
    if (this.filter === 'all') return this.complaints;
    return this.complaints.filter(c => c.status === this.filter);
  }

  get totalComplaints(): number {
    return this.analytics?.statusCounts.reduce((sum, s) => sum + s.count, 0) || 1;
  }

  getPercentage(count: number): number {
    return (count / this.totalComplaints) * 100;
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '-');
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = { plumbing: 'plumbing', electrical: 'electrical_services', facility: 'apartment', other: 'help_outline' };
    return icons[category] || 'help_outline';
  }

  getRoleIcon(role: string): string {
    const icons: Record<string, string> = { User: 'person', Staff: 'engineering', Admin: 'admin_panel_settings' };
    return icons[role] || 'person';
  }

  assignComplaint(complaint: Complaint & { selectedStaff?: number }): void {
    if (!complaint.selectedStaff) return;
    this.assigning = complaint.id;
    
    this.complaintService.assignComplaint(complaint.id, complaint.selectedStaff).subscribe({
      next: () => {
        this.snackBar.open('✓ Complaint assigned successfully', 'Close', { duration: 3000 });
        this.assigning = null;
        this.loadData();
      },
      error: () => {
        this.snackBar.open('✗ Failed to assign complaint', 'Close', { duration: 3000 });
        this.assigning = null;
      }
    });
  }
}
