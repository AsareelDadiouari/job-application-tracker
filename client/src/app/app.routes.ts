import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./applications/applications-board').then((m) => m.ApplicationsBoard),
    title: 'Job Application Tracker',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard · Job Application Tracker',
  },
  { path: '**', redirectTo: '' },
];
