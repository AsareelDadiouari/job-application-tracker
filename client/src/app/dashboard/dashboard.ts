import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  APPLICATION_STATUSES,
  ApplicationsService,
  ApplicationStatus,
  JobApplication,
} from '../applications/applications.service';
import { avatarGradient, initials, STATUS_META } from '../applications/status';
import { I18nService } from '../shared/i18n';
import { Icon, IconName } from '../shared/icon';

export interface StageBreakdown {
  status: ApplicationStatus;
  label: string;
  dot: string;
  count: number;
  percent: number;
}

export interface StalledApplication {
  application: JobApplication;
  daysStalled: number;
  reason: string;
}

export interface ResumePerformance {
  version: string;
  sent: number;
  responded: number;
  responseRate: number;
}

interface KpiCard {
  label: string;
  value: string;
  hint: string;
  icon: IconName;
  tone: string;
}

const STALL_THRESHOLD_DAYS = 14;

function daysSince(isoDateOrTimestamp: string, nowMs = Date.now()): number {
  const parsed = Date.parse(isoDateOrTimestamp);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, Math.floor((nowMs - parsed) / 86_400_000));
}

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly service = inject(ApplicationsService);
  protected readonly i18n = inject(I18nService);

  protected readonly meta = STATUS_META;
  protected readonly avatarGradient = avatarGradient;
  protected readonly initials = initials;

  protected readonly applications = rxResource({ stream: () => this.service.list() });
  private readonly all = computed(() => (this.applications.hasValue() ? this.applications.value() : []));

  protected readonly kpis = computed<KpiCard[]>(() => {
    const all = this.all();
    const k = this.i18n.t().dashboard.kpis;
    const count = (...statuses: ApplicationStatus[]) => all.filter((a) => statuses.includes(a.status)).length;
    const sent = count('Applied', 'Interview', 'Offer', 'Rejected');
    const interviewsOrOffers = count('Interview', 'Offer');
    const offers = count('Offer');
    const responseRate = sent ? Math.round((interviewsOrOffers / sent) * 100) : 0;
    const offerRate = sent ? Math.round((offers / sent) * 100) : 0;
    const stalled = this.stalledApplications().length;

    return [
      {
        label: k.totalLabel,
        value: `${all.length}`,
        hint: k.totalHint(sent, count('ToApply')),
        icon: 'briefcase',
        tone: 'text-sky-500 bg-sky-500/10',
      },
      {
        label: k.responseRateLabel,
        value: `${responseRate}%`,
        hint: k.responseRateHint(interviewsOrOffers),
        icon: 'trend',
        tone: 'text-brand bg-brand-soft',
      },
      {
        label: k.offerConversionLabel,
        value: `${offerRate}%`,
        hint: k.offerConversionHint(offers, sent),
        icon: 'trophy',
        tone: 'text-emerald-500 bg-emerald-500/10',
      },
      {
        label: k.stalledLabel,
        value: `${stalled}`,
        hint: k.stalledHint,
        icon: 'alert',
        tone: stalled > 0 ? 'text-amber-500 bg-amber-500/10' : 'text-slate-400 bg-slate-500/10',
      },
    ];
  });

  protected readonly stageBreakdown = computed<StageBreakdown[]>(() => {
    const all = this.all();
    const stages = this.i18n.t().stages;
    const total = all.length || 1;
    return APPLICATION_STATUSES.map((status) => {
      const count = all.filter((a) => a.status === status).length;
      return {
        status,
        label: stages[status],
        dot: STATUS_META[status].dot,
        count,
        percent: all.length ? Math.round((count / total) * 100) : 0,
      };
    });
  });

  protected readonly conversions = computed(() => {
    const all = this.all();
    const count = (...statuses: ApplicationStatus[]) => all.filter((a) => statuses.includes(a.status)).length;
    const sent = count('Applied', 'Interview', 'Offer', 'Rejected');
    const interviewed = count('Interview', 'Offer');
    const offers = count('Offer');
    const rejected = count('Rejected');
    const stillApplied = count('Applied');

    return {
      appliedToInterview: sent ? Math.round((interviewed / sent) * 100) : 0,
      interviewToOffer: interviewed ? Math.round((offers / interviewed) * 100) : 0,
      rejectionRate: sent ? Math.round((rejected / sent) * 100) : 0,
      awaitingReplyRate: sent ? Math.round((stillApplied / sent) * 100) : 0,
    };
  });

  protected readonly stalledApplications = computed<StalledApplication[]>(() => {
    const nowMs = Date.now();
    const d = this.i18n.t().dashboard;
    return this.all()
      .filter((a) => a.status === 'Applied' || a.status === 'Interview')
      .map((application) => {
        const anchor = application.appliedOn ?? application.updatedAt;
        const daysStalled = Math.max(
          daysSince(anchor, nowMs),
          daysSince(application.updatedAt, nowMs),
        );
        const reason =
          application.status === 'Applied'
            ? d.stalledReasonApplied
            : d.stalledReasonInterview;
        return { application, daysStalled, reason };
      })
      .filter((item) => item.daysStalled >= STALL_THRESHOLD_DAYS)
      .sort((a, b) => b.daysStalled - a.daysStalled);
  });

  protected readonly resumePerformance = computed<ResumePerformance[]>(() => {
    const byVersion = new Map<string, { sent: number; responded: number }>();
    for (const app of this.all()) {
      const version = app.resumeVersion?.trim();
      if (!version || app.status === 'ToApply') continue;
      const entry = byVersion.get(version) ?? { sent: 0, responded: 0 };
      entry.sent += 1;
      if (app.status === 'Interview' || app.status === 'Offer') {
        entry.responded += 1;
      }
      byVersion.set(version, entry);
    }
    return Array.from(byVersion.entries())
      .map(([version, stats]) => ({
        version,
        sent: stats.sent,
        responded: stats.responded,
        responseRate: stats.sent ? Math.round((stats.responded / stats.sent) * 100) : 0,
      }))
      .sort((a, b) => b.responseRate - a.responseRate || b.sent - a.sent);
  });
}
