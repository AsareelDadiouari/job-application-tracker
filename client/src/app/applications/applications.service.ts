import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export const APPLICATION_STATUSES = ['ToApply', 'Applied', 'Interview', 'Offer', 'Rejected'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  jobUrl: string | null;
  notes: string | null;
  appliedOn: string | null;
  followUpOn: string | null;
  followUpNote: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactRole: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationRequest = Pick<
  JobApplication,
  | 'company'
  | 'position'
  | 'status'
  | 'jobUrl'
  | 'notes'
  | 'appliedOn'
  | 'followUpOn'
  | 'followUpNote'
  | 'contactName'
  | 'contactEmail'
  | 'contactRole'
>;

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/applications`;

  list() {
    return this.http.get<JobApplication[]>(this.baseUrl);
  }

  create(request: ApplicationRequest) {
    return this.http.post<JobApplication>(this.baseUrl, request);
  }

  update(id: string, request: ApplicationRequest) {
    return this.http.put<JobApplication>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
