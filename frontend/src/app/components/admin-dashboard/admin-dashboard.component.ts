import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../services/complaint.service';
import { Complaint, User, Analytics, Feedback } from '../../models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="dashboard-wrapper">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <mat-icon>dashboard</mat-icon>
            <span>Admin Panel</span>
          </div>
        </div>
        <nav class="sidebar-nav">
          <a class="nav-item" [class.active]="currentView === 'dashboard'" (click)="currentView = 'dashboard'">
            <mat-icon>home</mat-icon>
            <span>Dashboard</span>
          </a>
          <a class="nav-item" [class.active]="currentView === 'complaints'" (click)="currentView = 'complaints'">
            <mat-icon>report_problem</mat-icon>
            <span>Complaints</span>
          </a>
          <a class="nav-item" [class.active]="currentView === 'feedbacks'" (click)="currentView = 'feedbacks'; loadFeedbacks()">
            <mat-icon>rate_review</mat-icon>
            <span>Feedbacks</span>
          </a>
          <a class="nav-item">
            <mat-icon>people</mat-icon>
            <span>Users</span>
          </a>
          <a class="nav-item">
            <mat-icon>engineering</mat-icon>
            <span>Staff</span>
          </a>
          <a class="nav-item">
            <mat-icon>analytics</mat-icon>
            <span>Reports</span>
          </a>
          <a class="nav-item">
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Top Header -->
        <header class="top-header">
          <div class="header-left">
            <h1>{{ currentView === 'feedbacks' ? 'User Feedbacks' : 'Dashboard Overview' }}</h1>
            <p>{{ currentView === 'feedbacks' ? 'View feedback from users on resolved complaints' : 'Welcome back! Here\\'s what\\'s happening today.' }}</p>
          </div>
          <div class="header-right">
            <div class="search-box">
              <mat-icon>search</mat-icon>
              <input type="text" placeholder="Search complaints...">
            </div>
            <button class="notification-btn">
              <mat-icon>notifications</mat-icon>
              <span class="badge">3</span>
            </button>
            <div class="admin-profile">
              <div class="avatar">A</div>
              <span>Admin</span>
            </div>
          </div>
        </header>

        <!-- Feedbacks View -->
        <div *ngIf="currentView === 'feedbacks'" class="feedbacks-section">
          <div *ngIf="loadingFeedbacks" class="loading-state">
            <mat-spinner diameter="48"></mat-spinner>
          </div>
          
          <div *ngIf="!loadingFeedbacks && feedbacks.length === 0" class="empty-state">
            <mat-icon>rate_review</mat-icon>
            <h4>No feedbacks yet</h4>
            <p>Feedbacks will appear here when users rate resolved complaints</p>
          </div>

          <div class="feedbacks-grid" *ngIf="!loadingFeedbacks && feedbacks.length > 0">
            <div class="feedback-card" *ngFor="let f of feedbacks">
              <div class="feedback-header">
                <div class="user-info">
                  <div class="user-avatar" [style.background]="getAvatarColor(f.user_name)">
                    {{ f.user_name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="user-details">
                    <span class="user-name">{{ f.user_name }}</span>
                    <span class="feedback-date">{{ f.created_at | date:'MMM d, y' }}</span>
                  </div>
                </div>
                <div class="rating-stars">
                  <mat-icon *ngFor="let star of [1,2,3,4,5]" [class.filled]="star <= f.rating">
                    {{ star <= f.rating ? 'star' : 'star_border' }}
                  </mat-icon>
                </div>
              </div>
              <div class="feedback-body">
                <div class="complaint-ref">
                  <mat-icon>description</mat-icon>
                  <span>{{ f.complaint_title }}</span>
                </div>
                <p class="feedback-comment" *ngIf="f.comment">{{ f.comment }}</p>
                <p class="no-comment" *ngIf="!f.comment">No comment provided</p>
              </div>
              <div class="feedback-footer" *ngIf="f.staff_name">
                <mat-icon>engineering</mat-icon>
                <span>Resolved by {{ f.staff_name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard View -->
        <ng-container *ngIf="currentView === 'dashboard' || currentView === 'complaints'">
        <!-- Stats Cards -->
        <div class="stats-grid" *ngIf="analytics">
          <div class="stat-card gradient-blue">
            <div class="stat-icon">
              <mat-icon>folder_open</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-number">{{ getStatusCountValue('Open') }}</span>
              <span class="stat-label">Open Complaints</span>
            </div>
            <div class="stat-trend up">
              <mat-icon>trending_up</mat-icon>
              <span>+12%</span>
            </div>
          </div>
          
          <div class="stat-card gradient-orange">
            <div class="stat-icon">
              <mat-icon>assignment_ind</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-number">{{ getStatusCountValue('Assigned') }}</span>
              <span class="stat-label">Assigned</span>
            </div>
            <div class="stat-trend up">
              <mat-icon>trending_up</mat-icon>
              <span>+8%</span>
            </div>
          </div>
          
          <div class="stat-card gradient-purple">
            <div class="stat-icon">
              <mat-icon>autorenew</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-number">{{ getStatusCountValue('In-progress') }}</span>
              <span class="stat-label">In Progress</span>
            </div>
            <div class="stat-trend down">
              <mat-icon>trending_down</mat-icon>
              <span>-3%</span>
            </div>
          </div>
          
          <div class="stat-card gradient-green">
            <div class="stat-icon">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-details">
              <span class="stat-number">{{ getStatusCountValue('Resolved') }}</span>
              <span class="stat-label">Resolved</span>
            </div>
            <div class="stat-trend up">
              <mat-icon>trending_up</mat-icon>
              <span>+24%</span>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row" *ngIf="analytics">
          <!-- Category Distribution -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>Category Distribution</h3>
              <button class="more-btn"><mat-icon>more_vert</mat-icon></button>
            </div>
            <div class="donut-chart">
              <div class="donut-ring">
                <svg viewBox="0 0 36 36">
                  <circle class="donut-segment plumbing" cx="18" cy="18" r="15.9" 
                    [attr.stroke-dasharray]="getCategoryPercentage('plumbing') + ' ' + (100 - getCategoryPercentage('plumbing'))"
                    stroke-dashoffset="25"></circle>
                  <circle class="donut-segment electrical" cx="18" cy="18" r="15.9"
                    [attr.stroke-dasharray]="getCategoryPercentage('electrical') + ' ' + (100 - getCategoryPercentage('electrical'))"
                    [attr.stroke-dashoffset]="100 - getCategoryPercentage('plumbing') + 25"></circle>
                  <circle class="donut-segment facility" cx="18" cy="18" r="15.9"
                    [attr.stroke-dasharray]="getCategoryPercentage('facility') + ' ' + (100 - getCategoryPercentage('facility'))"
                    [attr.stroke-dashoffset]="100 - getCategoryPercentage('plumbing') - getCategoryPercentage('electrical') + 25"></circle>
                </svg>
                <div class="donut-center">
                  <span class="total-count">{{ totalComplaints }}</span>
                  <span class="total-label">Total</span>
                </div>
              </div>
              <div class="chart-legend">
                <div class="legend-item" *ngFor="let c of analytics.categoryCounts">
                  <span class="legend-dot" [ngClass]="c.category"></span>
                  <span class="legend-label">{{ c.category | titlecase }}</span>
                  <span class="legend-value">{{ c.count }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- User Statistics -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>User Statistics</h3>
              <button class="more-btn"><mat-icon>more_vert</mat-icon></button>
            </div>
            <div class="users-stats">
              <div class="user-stat-item" *ngFor="let u of analytics.totalUsers">
                <div class="user-stat-icon" [ngClass]="u.role.toLowerCase()">
                  <mat-icon>{{ getRoleIcon(u.role) }}</mat-icon>
                </div>
                <div class="user-stat-info">
                  <span class="user-stat-role">{{ u.role }}s</span>
                  <div class="user-stat-bar">
                    <div class="bar-fill" [ngClass]="u.role.toLowerCase()" [style.width.%]="getUserPercentage(u.count)"></div>
                  </div>
                </div>
                <span class="user-stat-count">{{ u.count }}</span>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="chart-card activity-card">
            <div class="chart-header">
              <h3>Recent Activity</h3>
              <button class="more-btn"><mat-icon>more_vert</mat-icon></button>
            </div>
            <div class="activity-list">
              <div class="activity-item" *ngFor="let c of complaints.slice(0, 5)">
                <div class="activity-icon" [ngClass]="getStatusClass(c.status)">
                  <mat-icon>{{ getActivityIcon(c.status) }}</mat-icon>
                </div>
                <div class="activity-info">
                  <span class="activity-title">{{ c.title }}</span>
                  <span class="activity-meta">{{ c.user_name }} • {{ c.created_at | date:'MMM d' }}</span>
                </div>
                <span class="activity-status" [ngClass]="getStatusClass(c.status)">{{ c.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Complaints Table Section -->
        <div class="table-section">
          <div class="table-header">
            <h3>All Complaints</h3>
            <div class="table-actions">
              <div class="filter-chips">
                <button class="chip" [class.active]="filter === 'all'" (click)="filter = 'all'">All</button>
                <button class="chip" [class.active]="filter === 'Open'" (click)="filter = 'Open'">Open</button>
                <button class="chip" [class.active]="filter === 'Assigned'" (click)="filter = 'Assigned'">Assigned</button>
                <button class="chip" [class.active]="filter === 'In-progress'" (click)="filter = 'In-progress'">In Progress</button>
                <button class="chip" [class.active]="filter === 'Resolved'" (click)="filter = 'Resolved'">Resolved</button>
              </div>
            </div>
          </div>

          <div *ngIf="loading" class="loading-state">
            <mat-spinner diameter="48"></mat-spinner>
          </div>

          <div class="modern-table" *ngIf="!loading">
            <table>
              <thead>
                <tr>
                  <th>Complaint Details</th>
                  <th>Category</th>
                  <th>Submitted By</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of filteredComplaints" class="table-row">
                  <td>
                    <div class="complaint-info">
                      <span class="complaint-title">{{ c.title }}</span>
                      <span class="complaint-date">{{ c.created_at | date:'MMM d, y • h:mm a' }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="category-tag" [ngClass]="c.category">
                      <mat-icon>{{ getCategoryIcon(c.category) }}</mat-icon>
                      {{ c.category | titlecase }}
                    </div>
                  </td>
                  <td>
                    <div class="user-info">
                      <div class="user-avatar" [style.background]="getAvatarColor(c.user_name)">
                        {{ c.user_name?.charAt(0)?.toUpperCase() }}
                      </div>
                      <span>{{ c.user_name }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="status-pill" [ngClass]="getStatusClass(c.status)">
                      <span class="status-dot"></span>
                      {{ c.status }}
                    </span>
                  </td>
                  <td>
                    <span *ngIf="c.staff_name" class="staff-name">{{ c.staff_name }}</span>
                    <span *ngIf="!c.staff_name && c.status === 'Open'" class="unassigned-badge">
                      <mat-icon>person_add</mat-icon> Unassigned
                    </span>
                    <span *ngIf="!c.staff_name && c.status !== 'Open'" class="na-text">—</span>
                  </td>
                  <td>
                    <div class="action-buttons" *ngIf="c.status === 'Open'">
                      <mat-form-field appearance="outline" class="staff-select">
                        <mat-select [(value)]="c.selectedStaff" placeholder="Select">
                          <mat-option *ngFor="let s of staffList" [value]="s.id">{{ s.name }}</mat-option>
                        </mat-select>
                      </mat-form-field>
                      <button class="assign-btn" (click)="assignComplaint(c)" [disabled]="!c.selectedStaff || assigning === c.id">
                        <mat-spinner *ngIf="assigning === c.id" diameter="16"></mat-spinner>
                        <mat-icon *ngIf="assigning !== c.id">send</mat-icon>
                      </button>
                    </div>
                    <span *ngIf="c.status !== 'Open'" class="na-text">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div *ngIf="filteredComplaints.length === 0" class="empty-state">
              <mat-icon>inbox</mat-icon>
              <h4>No complaints found</h4>
              <p>There are no complaints matching your filter criteria</p>
            </div>
          </div>
        </div>
        </ng-container>
      </main>
    </div>
  `,
  styles: [`
    /* Dashboard Layout */
    .dashboard-wrapper { display: flex; min-height: 100vh; background: #f0f2f5; }
    
    /* Sidebar Styles */
    .sidebar { width: 260px; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); color: white; position: fixed; height: 100vh; overflow-y: auto; z-index: 100; }
    .sidebar-header { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .logo { display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 700; }
    .logo mat-icon { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 8px; border-radius: 10px; font-size: 24px; width: 24px; height: 24px; }
    
    .sidebar-nav { padding: 16px 12px; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px; color: #94a3b8; text-decoration: none; margin-bottom: 4px; cursor: pointer; transition: all 0.2s; }
    .nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
    .nav-item.active { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
    .nav-item mat-icon { font-size: 20px; width: 20px; height: 20px; }
    
    /* Main Content */
    .main-content { flex: 1; margin-left: 260px; padding: 24px 32px; }
    
    /* Top Header */
    .top-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .header-left h1 { font-size: 28px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
    .header-left p { color: #64748b; margin: 0; font-size: 14px; }
    .header-right { display: flex; align-items: center; gap: 16px; }
    
    .search-box { display: flex; align-items: center; gap: 8px; background: white; padding: 10px 16px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .search-box mat-icon { color: #94a3b8; font-size: 20px; }
    .search-box input { border: none; outline: none; font-size: 14px; width: 200px; }
    
    .notification-btn { position: relative; background: white; border: none; padding: 10px; border-radius: 12px; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .notification-btn .badge { position: absolute; top: -4px; right: -4px; background: #ef4444; color: white; font-size: 10px; padding: 2px 6px; border-radius: 10px; }
    
    .admin-profile { display: flex; align-items: center; gap: 10px; background: white; padding: 8px 16px 8px 8px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .admin-profile .avatar { width: 36px; height: 36px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }
    .admin-profile span { font-weight: 500; color: #1e293b; }
    
    /* Stats Grid */
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }
    .stat-card { background: white; border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); position: relative; overflow: hidden; }
    .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; }
    .stat-card.gradient-blue::before { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
    .stat-card.gradient-orange::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .stat-card.gradient-purple::before { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
    .stat-card.gradient-green::before { background: linear-gradient(90deg, #10b981, #34d399); }
    
    .stat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }
    .gradient-blue .stat-icon { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
    .gradient-orange .stat-icon { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
    .gradient-purple .stat-icon { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
    .gradient-green .stat-icon { background: linear-gradient(135deg, #10b981, #34d399); }
    
    .stat-details { flex: 1; }
    .stat-number { font-size: 32px; font-weight: 700; color: #1e293b; display: block; line-height: 1; }
    .stat-label { font-size: 13px; color: #64748b; margin-top: 4px; display: block; }
    
    .stat-trend { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 8px; }
    .stat-trend.up { background: #d1fae5; color: #059669; }
    .stat-trend.down { background: #fee2e2; color: #dc2626; }
    .stat-trend mat-icon { font-size: 14px; width: 14px; height: 14px; }
    
    /* Charts Row */
    .charts-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 28px; }
    .chart-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .chart-header h3 { font-size: 16px; font-weight: 600; color: #1e293b; margin: 0; }
    .more-btn { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px; border-radius: 6px; }
    .more-btn:hover { background: #f1f5f9; }
    
    /* Donut Chart */
    .donut-chart { display: flex; align-items: center; gap: 24px; }
    .donut-ring { position: relative; width: 140px; height: 140px; }
    .donut-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .donut-segment { fill: none; stroke-width: 3; stroke-linecap: round; }
    .donut-segment.plumbing { stroke: #3b82f6; }
    .donut-segment.electrical { stroke: #f59e0b; }
    .donut-segment.facility { stroke: #10b981; }
    .donut-segment.other { stroke: #6b7280; }
    .donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
    .total-count { font-size: 28px; font-weight: 700; color: #1e293b; display: block; }
    .total-label { font-size: 12px; color: #64748b; }
    
    .chart-legend { flex: 1; }
    .legend-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .legend-item:last-child { border-bottom: none; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
    .legend-dot.plumbing { background: #3b82f6; }
    .legend-dot.electrical { background: #f59e0b; }
    .legend-dot.facility { background: #10b981; }
    .legend-dot.other { background: #6b7280; }
    .legend-label { flex: 1; font-size: 13px; color: #475569; }
    .legend-value { font-size: 14px; font-weight: 600; color: #1e293b; }
    
    /* User Statistics */
    .users-stats { display: flex; flex-direction: column; gap: 16px; }
    .user-stat-item { display: flex; align-items: center; gap: 14px; }
    .user-stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .user-stat-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .user-stat-icon.user { background: #dbeafe; color: #2563eb; }
    .user-stat-icon.staff { background: #d1fae5; color: #059669; }
    .user-stat-icon.admin { background: #ede9fe; color: #7c3aed; }
    .user-stat-info { flex: 1; }
    .user-stat-role { font-size: 13px; color: #64748b; display: block; margin-bottom: 6px; }
    .user-stat-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .user-stat-bar .bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
    .user-stat-bar .bar-fill.user { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
    .user-stat-bar .bar-fill.staff { background: linear-gradient(90deg, #10b981, #34d399); }
    .user-stat-bar .bar-fill.admin { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
    .user-stat-count { font-size: 18px; font-weight: 700; color: #1e293b; min-width: 40px; text-align: right; }
    
    /* Activity List */
    .activity-card { }
    .activity-list { display: flex; flex-direction: column; gap: 12px; }
    .activity-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 10px; transition: background 0.2s; }
    .activity-item:hover { background: #f8fafc; }
    .activity-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .activity-icon mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .activity-icon.status-open { background: #dbeafe; color: #2563eb; }
    .activity-icon.status-assigned { background: #fef3c7; color: #d97706; }
    .activity-icon.status-in-progress { background: #ede9fe; color: #7c3aed; }
    .activity-icon.status-resolved { background: #d1fae5; color: #059669; }
    .activity-info { flex: 1; min-width: 0; }
    .activity-title { font-size: 13px; font-weight: 500; color: #1e293b; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .activity-meta { font-size: 11px; color: #94a3b8; }
    .activity-status { font-size: 10px; font-weight: 600; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }
    .activity-status.status-open { background: #dbeafe; color: #2563eb; }
    .activity-status.status-assigned { background: #fef3c7; color: #d97706; }
    .activity-status.status-in-progress { background: #ede9fe; color: #7c3aed; }
    .activity-status.status-resolved { background: #d1fae5; color: #059669; }
    
    /* Table Section */
    .table-section { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .table-header h3 { font-size: 18px; font-weight: 600; color: #1e293b; margin: 0; }
    
    .filter-chips { display: flex; gap: 8px; }
    .chip { padding: 8px 16px; border-radius: 20px; border: 1px solid #e2e8f0; background: white; font-size: 13px; color: #64748b; cursor: pointer; transition: all 0.2s; }
    .chip:hover { border-color: #6366f1; color: #6366f1; }
    .chip.active { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-color: transparent; }
    
    .loading-state { text-align: center; padding: 60px; }
    
    /* Modern Table */
    .modern-table { overflow-x: auto; }
    .modern-table table { width: 100%; border-collapse: collapse; }
    .modern-table th { text-align: left; padding: 14px 16px; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    .modern-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .table-row { transition: background 0.2s; }
    .table-row:hover { background: #f8fafc; }
    
    .complaint-info { }
    .complaint-title { font-size: 14px; font-weight: 500; color: #1e293b; display: block; margin-bottom: 2px; }
    .complaint-date { font-size: 12px; color: #94a3b8; }
    
    .category-tag { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; }
    .category-tag mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .category-tag.plumbing { background: #dbeafe; color: #1d4ed8; }
    .category-tag.electrical { background: #fef3c7; color: #b45309; }
    .category-tag.facility { background: #d1fae5; color: #047857; }
    .category-tag.other { background: #f1f5f9; color: #475569; }
    
    .user-info { display: flex; align-items: center; gap: 10px; }
    .user-avatar { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: 600; }
    .user-info span { font-size: 14px; color: #1e293b; }
    
    .status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; }
    .status-pill.status-open { background: #dbeafe; color: #1d4ed8; }
    .status-pill.status-open .status-dot { background: #1d4ed8; }
    .status-pill.status-assigned { background: #fef3c7; color: #b45309; }
    .status-pill.status-assigned .status-dot { background: #b45309; }
    .status-pill.status-in-progress { background: #ede9fe; color: #6d28d9; }
    .status-pill.status-in-progress .status-dot { background: #6d28d9; }
    .status-pill.status-resolved { background: #d1fae5; color: #047857; }
    .status-pill.status-resolved .status-dot { background: #047857; }
    
    .staff-name { font-size: 14px; color: #1e293b; font-weight: 500; }
    .unassigned-badge { display: inline-flex; align-items: center; gap: 4px; color: #ef4444; font-size: 12px; }
    .unassigned-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .na-text { color: #cbd5e1; }
    
    .action-buttons { display: flex; align-items: center; gap: 8px; }
    .staff-select { width: 120px; margin: 0; }
    .staff-select ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    .assign-btn { width: 36px; height: 36px; border-radius: 10px; border: none; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; }
    .assign-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); }
    .assign-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .assign-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    
    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-state mat-icon { font-size: 56px; width: 56px; height: 56px; color: #cbd5e1; }
    .empty-state h4 { font-size: 18px; color: #475569; margin: 16px 0 8px; }
    .empty-state p { color: #94a3b8; font-size: 14px; margin: 0; }
    
    /* Responsive */
    @media (max-width: 1400px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr 1fr; }
      .activity-card { grid-column: span 2; }
    }
    @media (max-width: 1024px) {
      .sidebar { display: none; }
      .main-content { margin-left: 0; }
      .charts-row { grid-template-columns: 1fr; }
      .activity-card { grid-column: span 1; }
    }
    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: 1fr; }
      .top-header { flex-direction: column; gap: 16px; align-items: flex-start; }
      .header-right { width: 100%; justify-content: space-between; }
      .filter-chips { flex-wrap: wrap; }
    }

    /* Feedbacks Section */
    .feedbacks-section { }
    .feedbacks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .feedback-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; }
    .feedback-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .feedback-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .feedback-header .user-info { display: flex; align-items: center; gap: 12px; }
    .feedback-header .user-avatar { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: 600; }
    .feedback-header .user-details { display: flex; flex-direction: column; }
    .feedback-header .user-name { font-size: 15px; font-weight: 600; color: #1e293b; }
    .feedback-header .feedback-date { font-size: 12px; color: #94a3b8; }
    .rating-stars { display: flex; gap: 2px; }
    .rating-stars mat-icon { font-size: 20px; width: 20px; height: 20px; color: #e2e8f0; }
    .rating-stars mat-icon.filled { color: #f59e0b; }
    .feedback-body { }
    .complaint-ref { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: #f8fafc; border-radius: 8px; margin-bottom: 12px; }
    .complaint-ref mat-icon { font-size: 18px; width: 18px; height: 18px; color: #64748b; }
    .complaint-ref span { font-size: 13px; color: #475569; font-weight: 500; }
    .feedback-comment { font-size: 14px; color: #334155; line-height: 1.6; margin: 0; }
    .no-comment { font-size: 13px; color: #94a3b8; font-style: italic; margin: 0; }
    .feedback-footer { display: flex; align-items: center; gap: 6px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f1f5f9; }
    .feedback-footer mat-icon { font-size: 16px; width: 16px; height: 16px; color: #10b981; }
    .feedback-footer span { font-size: 12px; color: #64748b; }
    .loading-state { text-align: center; padding: 60px; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  complaints: (Complaint & { selectedStaff?: number })[] = [];
  staffList: User[] = [];
  analytics: Analytics | null = null;
  feedbacks: Feedback[] = [];
  loading = true;
  loadingFeedbacks = false;
  filter = 'all';
  assigning: number | null = null;
  currentView: 'dashboard' | 'complaints' | 'feedbacks' = 'dashboard';

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

  loadFeedbacks(): void {
    if (this.feedbacks.length > 0) return;
    this.loadingFeedbacks = true;
    this.complaintService.getAllFeedbacks().subscribe({
      next: (data) => { this.feedbacks = data; this.loadingFeedbacks = false; },
      error: () => this.loadingFeedbacks = false
    });
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

  getStatusCountValue(status: string): number {
    return this.analytics?.statusCounts.find(s => s.status === status)?.count || 0;
  }

  getCategoryPercentage(category: string): number {
    const count = this.analytics?.categoryCounts.find(c => c.category === category)?.count || 0;
    return (count / this.totalComplaints) * 100;
  }

  getUserPercentage(count: number): number {
    const total = this.analytics?.totalUsers.reduce((sum, u) => sum + u.count, 0) || 1;
    return (count / total) * 100;
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

  getActivityIcon(status: string): string {
    const icons: Record<string, string> = { 'Open': 'folder_open', 'Assigned': 'assignment_ind', 'In-progress': 'autorenew', 'Resolved': 'check_circle' };
    return icons[status] || 'info';
  }

  getAvatarColor(name: string | undefined): string {
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
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
