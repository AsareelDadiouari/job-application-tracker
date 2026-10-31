import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  APPLICATION_STATUSES,
  ApplicationsService,
  ApplicationStatus,
  JobApplication,
} from './applications.service';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  ToApply: 'To apply',
  Applied: 'Applied',
  Interview: 'Interview',
  Offer: 'Offer',
  Rejected: 'Rejected',
};

@Component({
  selector: 'app-applications-board',
  imports: [FormsModule],
  templateUrl: './applications-board.html',
  styleUrl: './applications-board.scss',
})
export class ApplicationsBoard {
  private readonly service = inject(ApplicationsService);

  protected readonly statuses = APPLICATION_STATUSES;
  protected readonly labels = STATUS_LABELS;
  protected readonly applications = rxResource({ stream: () => this.service.list() });

  protected readonly columns = computed(() => {
    const items = this.applications.hasValue() ? this.applications.value() : [];
    return this.statuses.map((status) => ({
      status,
      items: items.filter((a) => a.status === status),
    }));
  });

  protected readonly company = signal('');
  protected readonly position = signal('');

  protected add() {
    const company = this.company().trim();
    const position = this.position().trim();
    if (!company || !position) return;

    this.service
      .create({ company, position, status: 'ToApply', jobUrl: null, notes: null, appliedOn: null })
      .subscribe(() => {
        this.company.set('');
        this.position.set('');
        this.applications.reload();
      });
  }

  protected move(application: JobApplication, status: ApplicationStatus) {
    this.service.update(application.id, { ...application, status }).subscribe(() => this.applications.reload());
  }

  protected remove(application: JobApplication) {
    this.service.delete(application.id).subscribe(() => this.applications.reload());
  }
}
