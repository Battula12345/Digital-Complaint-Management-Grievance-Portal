import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-chatbot></app-chatbot>
  `
})
export class AppComponent {}
