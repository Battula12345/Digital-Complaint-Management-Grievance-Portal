import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ChatMessage } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCount.asObservable();

  constructor(private http: HttpClient) {
    this.pollUnreadCount();
  }

  getMessages(complaintId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${environment.apiUrl}/chat/${complaintId}`);
  }

  sendMessage(complaintId: number, message: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${environment.apiUrl}/chat/${complaintId}`, { message });
  }

  getUnreadCount(complaintId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${environment.apiUrl}/chat/${complaintId}/unread`);
  }

  getTotalUnread(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${environment.apiUrl}/chat/unread/total`);
  }

  private pollUnreadCount(): void {
    setInterval(() => {
      this.getTotalUnread().subscribe({
        next: (res) => this.unreadCount.next(res.count),
        error: () => {}
      });
    }, 30000);
  }

  refreshUnreadCount(): void {
    this.getTotalUnread().subscribe({
      next: (res) => this.unreadCount.next(res.count),
      error: () => {}
    });
  }
}
