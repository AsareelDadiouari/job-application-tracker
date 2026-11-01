import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./applications/applications-board').then((m) => m.ApplicationsBoard),
    title: 'Job Application Tracker',
  },
  { path: '**', redirectTo: '' },
];
