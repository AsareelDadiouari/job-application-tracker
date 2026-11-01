import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Dialog } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Icon, IconName } from '../shared/icon';
import { ApplicationDialog, ApplicationDialogData, ApplicationDialogResult } from './application-dialog';
import {
  APPLICATION_STATUSES,
  ApplicationRequest,
  ApplicationsService,
  ApplicationStatus,
  JobApplication,
} from './applications.service';
import { avatarGradient, initials, STATUS_META } from './status';

export type FollowUpUrgency = 'overdue' | 'today' | 'upcoming';
export type BoardFilter = 'all' | 'follow-ups' | 'contacts';

export interface FollowUpItem {
  application: JobApplication;
  urgency: FollowUpUrgency;
  label: string;
  badgeClass: string;
}

interface Stat {
  label: string;
  value: string;
  hint: string;
  icon: IconName;
  tone: string;
}

function todayIso(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function diffDays(dateIso: string, baseIso: string): number {
  const [y1, m1, d1] = dateIso.split('-').map(Number);
  const [y2, m2, d2] = baseIso.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc1 - utc2) / 86_400_000);
}

@Component({
  selector: 'app-applications-board',
  imports: [FormsModule, DatePipe, Icon, CdkDropListGroup, CdkDropList, CdkDrag, CdkDragPlaceholder],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './applications-board.html',
})
export class ApplicationsBoard {
  private readonly service = inject(ApplicationsService);
  private readonly dialog = inject(Dialog);

  protected readonly meta = STATUS_META;
  protected readonly avatarGradient = avatarGradient;
  protected readonly initials = initials;

  protected readonly applications = rxResource({ stream: () => this.service.list() });
  protected readonly search = signal('');
  protected readonly filter = signal<BoardFilter>('all');

  private readonly all = computed(() => (this.applications.hasValue() ? this.applications.value() : []));

  protected readonly followUps = computed<FollowUpItem[]>(() => {
    const today = todayIso();
    return this.all()
      .filter((a): a is JobApplication & { followUpOn: string } => !!a.followUpOn)
      .sort((a, b) => a.followUpOn.localeCompare(b.followUpOn))
      .map((application) => this.describeFollowUp(application, today));
  });

  protected readonly contactsCount = computed(() =>
    this.all().filter((a) => !!(a.contactName || a.contactEmail)).length,
  );

  protected readonly columns = computed(() => {
    const term = this.search().trim().toLowerCase();
    const activeFilter = this.filter();
    const items = this.all().filter((a) => {
      if (activeFilter === 'follow-ups' && !a.followUpOn) return false;
      if (activeFilter === 'contacts' && !a.contactName && !a.contactEmail) return false;
      if (!term) return true;
      const haystack = [
        a.company,
        a.position,
        a.notes ?? '',
        a.contactName ?? '',
        a.contactRole ?? '',
        a.contactEmail ?? '',
        a.followUpNote ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
    return APPLICATION_STATUSES.map((status) => ({
      status,
      items: items.filter((a) => a.status === status),
    }));
  });

  protected describeFollowUp(application: JobApplication, today = todayIso()): FollowUpItem {
    const dateIso = application.followUpOn ?? today;
    const days = diffDays(dateIso, today);
    if (days < 0) {
      const overdueDays = Math.abs(days);
      return {
        application,
        urgency: 'overdue',
        label: overdueDays === 1 ? '1d overdue' : `${overdueDays}d overdue`,
        badgeClass: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300',
      };
    }
    if (days === 0) {
      return {
        application,
        urgency: 'today',
        label: 'Due today',
        badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
      };
    }
    return {
      application,
      urgency: 'upcoming',
      label: days === 1 ? 'Tomorrow' : days <= 14 ? `In ${days}d` : dateIso,
      badgeClass: 'border-brand/30 bg-brand-soft text-brand',
    };
  }

  protected completeFollowUp(application: JobApplication, event?: Event) {
    event?.stopPropagation();
    this.applications.value.update((list) =>
      list?.map((a) => (a.id === application.id ? { ...a, followUpOn: null, followUpNote: null } : a)),
    );
    const request: ApplicationRequest = {
      ...application,
      followUpOn: null,
      followUpNote: null,
    };
    this.service.update(application.id, request).subscribe({
      error: () => this.applications.reload(),
    });
  }

  protected readonly stats = computed<Stat[]>(() => {
    const all = this.all();
    const count = (...statuses: ApplicationStatus[]) => all.filter((a) => statuses.includes(a.status)).length;
    const sent = count('Applied', 'Interview', 'Offer', 'Rejected');
    const responded = count('Interview', 'Offer');
    const rate = sent ? Math.round((responded / sent) * 100) : 0;

    return [
      { label: 'Applications sent', value: `${sent}`, hint: `${count('ToApply')} still to apply`, icon: 'send', tone: 'text-sky-500 bg-sky-500/10' },
      { label: 'Interviews', value: `${count('Interview')}`, hint: 'in progress', icon: 'messages', tone: 'text-amber-500 bg-amber-500/10' },
      { label: 'Offers', value: `${count('Offer')}`, hint: count('Offer') ? 'congrats!' : 'keep going', icon: 'trophy', tone: 'text-emerald-500 bg-emerald-500/10' },
      { label: 'Response rate', value: `${rate}%`, hint: 'interviews + offers', icon: 'trend', tone: 'text-brand bg-brand-soft' },
    ];
  });

  protected open(data: ApplicationDialogData = {}) {
    const ref = this.dialog.open<ApplicationDialogResult, ApplicationDialogData>(ApplicationDialog, {
      data,
      backdropClass: 'cdk-overlay-dark-backdrop',
    });

    ref.closed.subscribe((result) => {
      if (!result) return;
      const existing = data.application;
      if (result.action === 'delete' && existing) {
        this.service.delete(existing.id).subscribe(() => this.applications.reload());
      } else if (result.action === 'save') {
        const request$ = existing ? this.service.update(existing.id, result.request) : this.service.create(result.request);
        request$.subscribe(() => this.applications.reload());
      }
    });
  }

  protected drop(event: CdkDragDrop<ApplicationStatus, ApplicationStatus, JobApplication>) {
    const application = event.item.data;
    const status = event.container.data;
    if (application.status === status) return;

    // Move the card right away, then persist.
    this.applications.value.update((list) =>
      list?.map((a) => (a.id === application.id ? { ...a, status } : a)),
    );
    const request: ApplicationRequest = { ...application, status };
    this.service.update(application.id, request).subscribe({
      error: () => this.applications.reload(),
    });
  }
}
