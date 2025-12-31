import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Complaint, Analytics, User, Feedback } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  constructor(private http: HttpClient) {}

  createComplaint(data: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/complaints`, data);
  }

  getMyComplaints(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${environment.apiUrl}/complaints/my`);
  }

  getAssignedComplaints(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${environment.apiUrl}/complaints/assigned`);
  }

  getAllComplaints(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${environment.apiUrl}/complaints/all`);
  }

  getComplaint(id: number): Observable<Complaint> {
    return this.http.get<Complaint>(`${environment.apiUrl}/complaints/${id}`);
  }

  assignComplaint(id: number, staffId: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/complaints/${id}/assign`, { staff_id: staffId });
  }

  updateStatus(id: number, status: string, resolutionNotes?: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/complaints/${id}/status`, { status, resolution_notes: resolutionNotes });
  }

  submitFeedback(id: number, rating: number, comment?: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/complaints/${id}/feedback`, { rating, comment });
  }

  getAllFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${environment.apiUrl}/complaints/feedbacks/all`);
  }

  getStaffList(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users/staff`);
  }

  getAnalytics(): Observable<Analytics> {
    return this.http.get<Analytics>(`${environment.apiUrl}/users/analytics`);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/profile`);
  }

  updateProfile(data: { name?: string; contact_info?: string; address?: string; latitude?: number; longitude?: number }): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/profile`, data);
  }
}
