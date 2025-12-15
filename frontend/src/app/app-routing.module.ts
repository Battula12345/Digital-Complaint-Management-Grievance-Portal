import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RegistrationComponent } from './components/registration/registration.component';
import { LoginComponent } from './components/login/login.component';
import { ComplaintListComponent } from './components/complaint-list/complaint-list.component';
import { ComplaintDetailsComponent } from './components/complaint-details/complaint-details.component';
import { StaffDashboardComponent } from './components/staff-dashboard/staff-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'register', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'complaints', component: ComplaintListComponent, canActivate: [AuthGuard], data: { roles: ['User'] } },
  { path: 'complaints/new', component: ComplaintDetailsComponent, canActivate: [AuthGuard], data: { roles: ['User'] } },
  { path: 'staff/dashboard', component: StaffDashboardComponent, canActivate: [AuthGuard], data: { roles: ['Staff'] } },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
