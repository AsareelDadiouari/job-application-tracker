import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../shared/i18n';
import { Icon } from '../shared/icon';
import { APPLICATION_STATUSES, ApplicationRequest, ApplicationStatus, JobApplication } from './applications.service';
import { STATUS_META } from './status';

export interface ApplicationDialogData {
  application?: JobApplication;
  status?: ApplicationStatus;
  resumeVersions?: string[];
  coverLetterVersions?: string[];
}

export type ApplicationDialogResult = { action: 'save'; request: ApplicationRequest } | { action: 'delete' };

@Component({
  selector: 'app-application-dialog',
  imports: [FormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './application-dialog.html',
})
export class ApplicationDialog {
  private readonly dialogRef = inject<DialogRef<ApplicationDialogResult>>(DialogRef);
  protected readonly data = inject<ApplicationDialogData>(DIALOG_DATA);
  protected readonly i18n = inject(I18nService);

  protected readonly statuses = APPLICATION_STATUSES;
  protected readonly meta = STATUS_META;
  protected readonly isEdit = !!this.data.application;

  protected readonly company = signal(this.data.application?.company ?? '');
  protected readonly position = signal(this.data.application?.position ?? '');
  protected readonly status = signal<ApplicationStatus>(
    this.data.application?.status ?? this.data.status ?? 'ToApply',
  );
  protected readonly jobUrl = signal(this.data.application?.jobUrl ?? '');
  protected readonly appliedOn = signal(this.data.application?.appliedOn ?? '');
  protected readonly followUpOn = signal(this.data.application?.followUpOn ?? '');
  protected readonly followUpNote = signal(this.data.application?.followUpNote ?? '');
  protected readonly contactName = signal(this.data.application?.contactName ?? '');
  protected readonly contactEmail = signal(this.data.application?.contactEmail ?? '');
  protected readonly contactRole = signal(this.data.application?.contactRole ?? '');
  protected readonly resumeVersion = signal(this.data.application?.resumeVersion ?? '');
  protected readonly coverLetterVersion = signal(this.data.application?.coverLetterVersion ?? '');
  protected readonly notes = signal(this.data.application?.notes ?? '');
  protected readonly confirmingDelete = signal(false);

  protected readonly followUpPresets = computed(() => {
    const p = this.i18n.t().dialog.presets;
    return [
      { label: p.tomorrow, days: 1 },
      { label: p.in3Days, days: 3 },
      { label: p.in1Week, days: 7 },
      { label: p.in2Weeks, days: 14 },
    ] as const;
  });

  protected setFollowUpDays(days: number | null) {
    if (days === null) {
      this.followUpOn.set('');
      return;
    }
    const target = new Date();
    target.setDate(target.getDate() + days);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    this.followUpOn.set(`${yyyy}-${mm}-${dd}`);
  }

  protected save() {
    const company = this.company().trim();
    const position = this.position().trim();
    if (!company || !position) return;

    this.dialogRef.close({
      action: 'save',
      request: {
        company,
        position,
        status: this.status(),
        jobUrl: this.jobUrl().trim() || null,
        appliedOn: this.appliedOn() || null,
        followUpOn: this.followUpOn() || null,
        followUpNote: this.followUpNote().trim() || null,
        contactName: this.contactName().trim() || null,
        contactEmail: this.contactEmail().trim() || null,
        contactRole: this.contactRole().trim() || null,
        resumeVersion: this.resumeVersion().trim() || null,
        coverLetterVersion: this.coverLetterVersion().trim() || null,
        notes: this.notes().trim() || null,
      },
    });
  }

  protected delete() {
    if (!this.confirmingDelete()) {
      this.confirmingDelete.set(true);
      return;
    }
    this.dialogRef.close({ action: 'delete' });
  }

  protected close() {
    this.dialogRef.close();
  }
}
