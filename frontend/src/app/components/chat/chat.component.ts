import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ChatMessage } from '../../models';

@Component({
  selector: 'app-chat',
  template: `
    <div class="chat-container" [class.open]="isOpen">
      <div class="chat-header" (click)="toggleChat()">
        <div class="header-left">
          <mat-icon>chat</mat-icon>
          <span>Chat</span>
          <span class="unread-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
        </div>
        <mat-icon class="toggle-icon">{{ isOpen ? 'expand_more' : 'expand_less' }}</mat-icon>
      </div>

      <div class="chat-body" *ngIf="isOpen">
        <div class="messages-container" #messagesContainer>
          <div *ngIf="loading" class="loading-messages">
            <mat-spinner diameter="24"></mat-spinner>
          </div>

          <div *ngIf="!loading && messages.length === 0" class="no-messages">
            <mat-icon>forum</mat-icon>
            <p>No messages yet. Start the conversation!</p>
          </div>

          <div *ngFor="let msg of messages" class="message" [class.own]="msg.sender_id === currentUserId">
            <div class="message-bubble">
              <div class="message-header">
                <span class="sender-name">{{ msg.sender_name }}</span>
                <span class="sender-role">({{ msg.sender_role }})</span>
              </div>
              <p class="message-text">{{ msg.message }}</p>
              <span class="message-time">{{ msg.created_at | date:'MMM d, h:mm a' }}</span>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <input type="text" [(ngModel)]="newMessage" placeholder="Type a message..." 
            (keyup.enter)="sendMessage()" [disabled]="sending">
          <button (click)="sendMessage()" [disabled]="!newMessage.trim() || sending">
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container { 
      border: 1px solid #e2e8f0; 
      border-radius: 12px; 
      overflow: hidden; 
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      margin-top: 16px;
    }

    .chat-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 12px 16px; 
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white; 
      cursor: pointer;
      transition: background 0.2s;
    }
    .chat-header:hover { background: linear-gradient(135deg, #4f46e5, #7c3aed); }

    .header-left { display: flex; align-items: center; gap: 8px; }
    .header-left mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .header-left span { font-weight: 600; font-size: 14px; }

    .unread-badge { 
      background: #ef4444; 
      color: white; 
      font-size: 11px; 
      padding: 2px 8px; 
      border-radius: 10px; 
      font-weight: 600;
    }

    .toggle-icon { transition: transform 0.2s; }

    .chat-body { border-top: 1px solid #e2e8f0; }

    .messages-container { 
      height: 250px; 
      overflow-y: auto; 
      padding: 16px; 
      background: #f8fafc;
    }

    .loading-messages, .no-messages { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      height: 100%; 
      color: #94a3b8;
    }
    .no-messages mat-icon { font-size: 40px; width: 40px; height: 40px; margin-bottom: 8px; }
    .no-messages p { margin: 0; font-size: 13px; }

    .message { 
      display: flex; 
      margin-bottom: 12px; 
    }
    .message.own { justify-content: flex-end; }

    .message-bubble { 
      max-width: 75%; 
      padding: 10px 14px; 
      border-radius: 16px; 
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .message.own .message-bubble { 
      background: linear-gradient(135deg, #6366f1, #8b5cf6); 
      color: white; 
    }

    .message-header { margin-bottom: 4px; }
    .sender-name { font-weight: 600; font-size: 12px; }
    .sender-role { font-size: 11px; opacity: 0.7; margin-left: 4px; }

    .message-text { margin: 0 0 4px; font-size: 14px; line-height: 1.4; word-wrap: break-word; }

    .message-time { font-size: 10px; opacity: 0.6; }

    .chat-input { 
      display: flex; 
      gap: 8px; 
      padding: 12px; 
      background: white;
      border-top: 1px solid #e2e8f0;
    }
    .chat-input input { 
      flex: 1; 
      padding: 10px 14px; 
      border: 1px solid #e2e8f0; 
      border-radius: 20px; 
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .chat-input input:focus { border-color: #6366f1; }

    .chat-input button { 
      width: 40px; 
      height: 40px; 
      border: none; 
      border-radius: 50%; 
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white; 
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, opacity 0.2s;
    }
    .chat-input button:hover:not(:disabled) { transform: scale(1.05); }
    .chat-input button:disabled { opacity: 0.5; cursor: not-allowed; }
    .chat-input button mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() complaintId!: number;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isOpen = false;
  messages: ChatMessage[] = [];
  newMessage = '';
  loading = false;
  sending = false;
  unreadCount = 0;
  currentUserId: number = 0;
  private pollInterval: any;

  constructor(private chatService: ChatService, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) this.currentUserId = user.id;
    this.loadUnreadCount();
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadMessages();
      this.startPolling();
    } else {
      this.stopPolling();
    }
  }

  loadMessages(): void {
    this.loading = true;
    this.chatService.getMessages(this.complaintId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.loading = false;
        this.unreadCount = 0;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => this.loading = false
    });
  }

  loadUnreadCount(): void {
    this.chatService.getUnreadCount(this.complaintId).subscribe({
      next: (res) => this.unreadCount = res.count,
      error: () => {}
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.sending) return;
    
    this.sending = true;
    this.chatService.sendMessage(this.complaintId, this.newMessage.trim()).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.newMessage = '';
        this.sending = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => this.sending = false
    });
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  private startPolling(): void {
    this.pollInterval = setInterval(() => this.loadMessages(), 5000);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
