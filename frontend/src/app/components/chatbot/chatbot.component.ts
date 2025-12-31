import { Component } from '@angular/core';

interface ChatMessage {
  text: string;
  isBot: boolean;
  time: Date;
  options?: string[];
}

@Component({
  selector: 'app-chatbot',
  template: `
    <div class="chatbot-container">
      <!-- Chat Toggle Button -->
      <button class="chat-toggle" (click)="toggleChat()" [class.open]="isOpen">
        <mat-icon *ngIf="!isOpen">smart_toy</mat-icon>
        <mat-icon *ngIf="isOpen">close</mat-icon>
        <span class="pulse" *ngIf="!isOpen && unreadCount > 0"></span>
      </button>

      <!-- Chat Window -->
      <div class="chat-window" *ngIf="isOpen">
        <div class="chat-header">
          <div class="bot-info">
            <div class="bot-avatar">
              <mat-icon>smart_toy</mat-icon>
            </div>
            <div class="bot-details">
              <span class="bot-name">Support Bot</span>
              <span class="bot-status"><span class="status-dot"></span> Online</span>
            </div>
          </div>
          <button mat-icon-button (click)="toggleChat()">
            <mat-icon>remove</mat-icon>
          </button>
        </div>

        <div class="chat-messages" #messagesContainer>
          <div *ngFor="let msg of messages" class="message" [class.bot]="msg.isBot" [class.user]="!msg.isBot">
            <div class="message-bubble">
              <p>{{ msg.text }}</p>
              <span class="message-time">{{ msg.time | date:'shortTime' }}</span>
            </div>
            <div class="quick-options" *ngIf="msg.options && msg.options.length > 0">
              <button *ngFor="let opt of msg.options" (click)="selectOption(opt)" class="option-btn">
                {{ opt }}
              </button>
            </div>
          </div>
          <div class="typing-indicator" *ngIf="isTyping">
            <span></span><span></span><span></span>
          </div>
        </div>

        <div class="chat-input">
          <input type="text" [(ngModel)]="userInput" (keyup.enter)="sendMessage()" 
            placeholder="Type your message..." [disabled]="isTyping">
          <button (click)="sendMessage()" [disabled]="!userInput.trim() || isTyping">
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chatbot-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; }

    .chat-toggle {
      width: 60px; height: 60px; border-radius: 50%; border: none;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white; cursor: pointer; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s ease; position: relative;
    }
    .chat-toggle:hover { transform: scale(1.1); box-shadow: 0 6px 25px rgba(99, 102, 241, 0.5); }
    .chat-toggle.open { background: #64748b; }
    .chat-toggle mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .pulse {
      position: absolute; top: 0; right: 0; width: 14px; height: 14px;
      background: #ef4444; border-radius: 50%; border: 2px solid white;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }

    .chat-window {
      position: absolute; bottom: 80px; right: 0; width: 380px; height: 520px;
      background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      display: flex; flex-direction: column; overflow: hidden;
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .chat-header {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white; padding: 16px 20px; display: flex;
      justify-content: space-between; align-items: center;
    }
    .bot-info { display: flex; align-items: center; gap: 12px; }
    .bot-avatar {
      width: 44px; height: 44px; background: rgba(255,255,255,0.2);
      border-radius: 12px; display: flex; align-items: center; justify-content: center;
    }
    .bot-avatar mat-icon { font-size: 24px; }
    .bot-name { font-weight: 600; font-size: 16px; display: block; }
    .bot-status { font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 6px; }
    .status-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; }
    .chat-header button { color: white; }

    .chat-messages {
      flex: 1; overflow-y: auto; padding: 20px; display: flex;
      flex-direction: column; gap: 16px; background: #f8fafc;
    }

    .message { display: flex; flex-direction: column; max-width: 85%; }
    .message.bot { align-self: flex-start; }
    .message.user { align-self: flex-end; }

    .message-bubble {
      padding: 12px 16px; border-radius: 16px; position: relative;
    }
    .message.bot .message-bubble {
      background: white; color: #1e293b;
      border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .message.user .message-bubble {
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;
      border-bottom-right-radius: 4px;
    }
    .message-bubble p { margin: 0 0 4px; font-size: 14px; line-height: 1.5; }
    .message-time { font-size: 10px; opacity: 0.7; }

    .quick-options { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .option-btn {
      padding: 8px 14px; border: 1px solid #e2e8f0; background: white;
      border-radius: 20px; font-size: 13px; color: #6366f1; cursor: pointer;
      transition: all 0.2s;
    }
    .option-btn:hover { background: #6366f1; color: white; border-color: #6366f1; }

    .typing-indicator {
      display: flex; gap: 4px; padding: 12px 16px; background: white;
      border-radius: 16px; width: fit-content; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .typing-indicator span {
      width: 8px; height: 8px; background: #94a3b8; border-radius: 50%;
      animation: typing 1.4s infinite;
    }
    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-8px); }
    }

    .chat-input {
      padding: 16px; background: white; border-top: 1px solid #e2e8f0;
      display: flex; gap: 12px;
    }
    .chat-input input {
      flex: 1; padding: 12px 16px; border: 1px solid #e2e8f0;
      border-radius: 24px; font-size: 14px; outline: none; transition: border-color 0.2s;
    }
    .chat-input input:focus { border-color: #6366f1; }
    .chat-input button {
      width: 44px; height: 44px; border: none; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s;
    }
    .chat-input button:hover:not(:disabled) { transform: scale(1.05); }
    .chat-input button:disabled { opacity: 0.5; cursor: not-allowed; }
    .chat-input button mat-icon { font-size: 20px; width: 20px; height: 20px; }

    @media (max-width: 480px) {
      .chat-window { width: calc(100vw - 32px); right: -8px; height: 70vh; }
    }
  `]
})
export class ChatbotComponent {
  isOpen = false;
  isTyping = false;
  userInput = '';
  unreadCount = 1;
  messages: ChatMessage[] = [];

  private responses: { [key: string]: { text: string; options?: string[] } } = {
    'greeting': {
      text: 'Hello! 👋 I\'m your Support Bot. How can I help you today?',
      options: ['Submit a complaint', 'Track my complaint', 'How does it work?', 'Contact support']
    },
    'submit a complaint': {
      text: 'To submit a complaint:\n\n1. Login to your account\n2. Click "New Complaint" button\n3. Fill in the title, category, and description\n4. Add your location (optional)\n5. Attach any photos if needed\n6. Click Submit!\n\nWould you like me to help with something else?',
      options: ['Track my complaint', 'View categories', 'Go to login']
    },
    'track my complaint': {
      text: 'To track your complaint:\n\n1. Login to your account\n2. Go to "My Complaints"\n3. You\'ll see all your complaints with their current status\n\nStatus meanings:\n• Open - Just submitted\n• Assigned - Staff assigned\n• In-progress - Being worked on\n• Resolved - Completed!',
      options: ['Submit a complaint', 'Contact support', 'Main menu']
    },
    'how does it work?': {
      text: 'Here\'s how our complaint portal works:\n\n1️⃣ You submit a complaint\n2️⃣ Admin reviews and assigns to staff\n3️⃣ Staff works on resolving it\n4️⃣ You get notified of updates\n5️⃣ Once resolved, you can give feedback\n\nYou can also chat directly with assigned staff!',
      options: ['Submit a complaint', 'Track my complaint', 'Main menu']
    },
    'contact support': {
      text: 'You can reach our support team:\n\n📧 Email: support@complaints.com\n📞 Phone: +91 9876543210\n⏰ Hours: Mon-Sat, 9AM-6PM\n\nOr use the in-app chat feature to talk directly with assigned staff on your complaint.',
      options: ['Submit a complaint', 'Main menu']
    },
    'view categories': {
      text: 'We handle complaints in these categories:\n\n🔧 Plumbing\n⚡ Electrical\n🏢 Facility\n🧹 Cleaning\n🔒 Security\n📶 Internet\n🅿️ Parking\n💧 Water\n❄️ AC/Heating\n🛗 Elevator\n...and more!',
      options: ['Submit a complaint', 'Main menu']
    },
    'main menu': {
      text: 'What would you like to know?',
      options: ['Submit a complaint', 'Track my complaint', 'How does it work?', 'Contact support']
    },
    'go to login': {
      text: 'You can login or register at the top right corner of the page. Click "Login" if you have an account, or "Register" to create a new one.',
      options: ['How to register?', 'Forgot password?', 'Main menu']
    },
    'how to register?': {
      text: 'To register:\n\n1. Click "Register" or "Create Account"\n2. Enter your name, email, password\n3. Select your role (User)\n4. Add phone number (optional)\n5. Click Create Account!\n\nYou\'ll be able to login immediately.',
      options: ['Go to login', 'Main menu']
    },
    'forgot password?': {
      text: 'If you forgot your password, please contact support to reset it:\n\n📧 support@complaints.com\n📞 +91 9876543210\n\nProvide your registered email and we\'ll help you reset it.',
      options: ['Contact support', 'Main menu']
    },
    'default': {
      text: 'I\'m not sure I understand. Let me help you with some common options:',
      options: ['Submit a complaint', 'Track my complaint', 'How does it work?', 'Contact support']
    }
  };

  constructor() {
    this.addBotMessage(this.responses['greeting'].text, this.responses['greeting'].options);
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    this.unreadCount = 0;
  }

  selectOption(option: string): void {
    this.userInput = option;
    this.sendMessage();
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    const userText = this.userInput.trim();
    this.messages.push({ text: userText, isBot: false, time: new Date() });
    this.userInput = '';
    this.isTyping = true;

    setTimeout(() => {
      this.isTyping = false;
      const response = this.getResponse(userText.toLowerCase());
      this.addBotMessage(response.text, response.options);
    }, 1000 + Math.random() * 500);
  }

  private addBotMessage(text: string, options?: string[]): void {
    this.messages.push({ text, isBot: true, time: new Date(), options });
  }

  private getResponse(input: string): { text: string; options?: string[] } {
    const key = Object.keys(this.responses).find(k => 
      input.includes(k) || k.split(' ').every(word => input.includes(word))
    );
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return this.responses['greeting'];
    }
    if (input.includes('submit') || input.includes('new complaint') || input.includes('raise')) {
      return this.responses['submit a complaint'];
    }
    if (input.includes('track') || input.includes('status') || input.includes('check')) {
      return this.responses['track my complaint'];
    }
    if (input.includes('work') || input.includes('process') || input.includes('how')) {
      return this.responses['how does it work?'];
    }
    if (input.includes('contact') || input.includes('support') || input.includes('help')) {
      return this.responses['contact support'];
    }
    if (input.includes('category') || input.includes('categories') || input.includes('type')) {
      return this.responses['view categories'];
    }
    if (input.includes('login') || input.includes('sign in')) {
      return this.responses['go to login'];
    }
    if (input.includes('register') || input.includes('sign up') || input.includes('create account')) {
      return this.responses['how to register?'];
    }
    if (input.includes('forgot') || input.includes('password') || input.includes('reset')) {
      return this.responses['forgot password?'];
    }
    if (input.includes('thank')) {
      return { text: 'You\'re welcome! 😊 Is there anything else I can help you with?', options: ['Main menu', 'No, thanks'] };
    }
    if (input.includes('no') && input.includes('thank')) {
      return { text: 'Alright! Feel free to chat anytime you need help. Have a great day! 👋' };
    }
    
    return key ? this.responses[key] : this.responses['default'];
  }
}
