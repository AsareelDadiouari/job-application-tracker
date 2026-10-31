import { Routes } from '@angular/router';
import { ApplicationsBoard } from './applications/applications-board';

export const routes: Routes = [
  { path: '', component: ApplicationsBoard, title: 'Job Application Tracker' },
  { path: '**', redirectTo: '' },
];
