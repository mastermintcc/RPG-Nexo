import {Routes} from '@angular/router';
import { AuthComponent } from './auth';
import { DashboardComponent } from './dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent },
];
