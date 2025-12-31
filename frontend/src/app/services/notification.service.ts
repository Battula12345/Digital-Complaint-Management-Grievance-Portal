import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  body: string;
  complaint_id?: number;
  type: string;
  is_read: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Poll for notifications every 30 seconds
    interval(30000).subscribe(() => {
      if (localStorage.getItem('token')) {
        this.loadNotifications();
        this.loadUnreadCount();
      }
    });
  }

  getNotifications(limit = 20): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${environment.apiUrl}/notifications?limit=${limit}`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${environment.apiUrl}/notifications/unread-count`);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/notifications/read-all`, {});
  }

  loadNotifications(): void {
    this.getNotifications().subscribe({
      next: (notifications) => this.notificationsSubject.next(notifications),
      error: (err) => console.error('Error loading notifications:', err)
    });
  }

  loadUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (res) => this.unreadCountSubject.next(res.count),
      error: (err) => console.error('Error loading unread count:', err)
    });
  }

  removeToken(): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/notifications/token`);
  }

  requestPermission(): void {
    // No-op since Firebase is removed
  }
}
