import { computed, Injectable, signal } from '@angular/core';
import { ApplicationStatus } from '../applications/applications.service';

export type Locale = 'en' | 'fr';

const STORAGE_KEY = 'job-tracker.locale';

export interface Translations {
  appTitle: string;
  nav: {
    board: string;
    dashboard: string;
    languageLabel: string;
  };
  stages: Record<ApplicationStatus, string>;
  board: {
    title: string;
    subtitle: string;
    filterAll: string;
    filterFollowUps: string;
    filterContacts: string;
    searchPlaceholder: string;
    newApplication: string;
    stats: {
      sentLabel: string;
      sentHint: (toApply: number) => string;
      interviewsLabel: string;
      interviewsHint: string;
      offersLabel: string;
      offersHint: (hasOffer: boolean) => string;
      responseRateLabel: string;
      responseRateHint: string;
    };
    apiError: string;
    tryAgain: string;
    followUpsHeading: string;
    markDoneTitle: string;
    done: string;
    overdueDays: (days: number) => string;
    dueToday: string;
    tomorrow: string;
    inDays: (days: number) => string;
    addedPrefix: string;
    postingLink: string;
    dropCardHere: string;
  };
  dialog: {
    editTitle: string;
    newTitle: string;
    editSubtitle: string;
    newSubtitle: string;
    company: string;
    position: string;
    stage: string;
    jobUrl: string;
    appliedOn: string;
    documentsHeading: string;
    resumeVersion: string;
    resumePlaceholder: string;
    coverLetterVersion: string;
    coverLetterPlaceholder: string;
    contactHeading: string;
    contactName: string;
    contactRole: string;
    contactEmail: string;
    followUpHeading: string;
    remindOn: string;
    reminderNote: string;
    reminderPlaceholder: string;
    presets: {
      tomorrow: string;
      in3Days: string;
      in1Week: string;
      in2Weeks: string;
      clear: string;
    };
    notes: string;
    notesPlaceholder: string;
    delete: string;
    confirmDelete: string;
    cancel: string;
    saveChanges: string;
    addApplication: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    backToBoard: string;
    kpis: {
      totalLabel: string;
      totalHint: (sent: number, wishlist: number) => string;
      responseRateLabel: string;
      responseRateHint: (count: number) => string;
      offerConversionLabel: string;
      offerConversionHint: (offers: number, sent: number) => string;
      stalledLabel: string;
      stalledHint: string;
    };
    stageDistributionTitle: string;
    stageDistributionSubtitle: string;
    bottlenecksTitle: string;
    bottlenecksSubtitle: string;
    appliedToInterview: string;
    appliedToInterviewHint: string;
    interviewToOffer: string;
    interviewToOfferHint: string;
    awaitingReply: string;
    awaitingReplyHint: string;
    rejectionRate: string;
    rejectionRateHint: string;
    stalledTitle: string;
    stalledSubtitle: string;
    stalledBadge: (days: number) => string;
    stalledReasonApplied: string;
    stalledReasonInterview: string;
    noStalled: string;
    resumeTitle: string;
    resumeSubtitle: string;
    responseBadge: (rate: number) => string;
    resumeSummary: (responded: number, sent: number) => string;
    noResumeData: string;
  };
}

const EN: Translations = {
  appTitle: 'Job Application Tracker',
  nav: {
    board: 'Board',
    dashboard: 'Dashboard',
    languageLabel: 'Switch language',
  },
  stages: {
    ToApply: 'To apply',
    Applied: 'Applied',
    Interview: 'Interview',
    Offer: 'Offer',
    Rejected: 'Rejected',
  },
  board: {
    title: 'Your pipeline',
    subtitle: 'Drag cards between stages. Click a card to edit it.',
    filterAll: 'All',
    filterFollowUps: 'Follow-ups',
    filterContacts: 'Contacts',
    searchPlaceholder: 'Search company, role, contact…',
    newApplication: 'New application',
    stats: {
      sentLabel: 'Applications sent',
      sentHint: (toApply) => `${toApply} still to apply`,
      interviewsLabel: 'Interviews',
      interviewsHint: 'in progress',
      offersLabel: 'Offers',
      offersHint: (hasOffer) => (hasOffer ? 'congrats!' : 'keep going'),
      responseRateLabel: 'Response rate',
      responseRateHint: 'interviews + offers',
    },
    apiError: "Couldn't reach the API. Make sure it's running, then",
    tryAgain: 'try again',
    followUpsHeading: 'Follow-up reminders',
    markDoneTitle: 'Mark follow-up as done',
    done: 'Done',
    overdueDays: (days) => `${days}d overdue`,
    dueToday: 'Due today',
    tomorrow: 'Tomorrow',
    inDays: (days) => `In ${days}d`,
    addedPrefix: 'Added',
    postingLink: 'Posting',
    dropCardHere: 'Drop a card here',
  },
  dialog: {
    editTitle: 'Edit application',
    newTitle: 'New application',
    editSubtitle: 'Update the details or move it to another stage.',
    newSubtitle: 'Track a role you want or have applied to.',
    company: 'Company',
    position: 'Position',
    stage: 'Stage',
    jobUrl: 'Job posting link',
    appliedOn: 'Applied on',
    documentsHeading: 'Documents sent',
    resumeVersion: 'Résumé version',
    resumePlaceholder: 'e.g. Backend-v3-EN.pdf',
    coverLetterVersion: 'Cover letter',
    coverLetterPlaceholder: 'e.g. Tailored - Cloud Platform',
    contactHeading: 'Contact / Recruiter',
    contactName: 'Name',
    contactRole: 'Role',
    contactEmail: 'Email',
    followUpHeading: 'Follow-up reminder',
    remindOn: 'Remind on',
    reminderNote: 'Reminder note',
    reminderPlaceholder: 'Send thank-you email, check in on interview…',
    presets: {
      tomorrow: 'Tomorrow',
      in3Days: '+3 days',
      in1Week: '+1 week',
      in2Weeks: '+2 weeks',
      clear: 'Clear',
    },
    notes: 'Notes',
    notesPlaceholder: 'Salary range, tech stack, what you learned in the interview…',
    delete: 'Delete',
    confirmDelete: 'Click again to delete',
    cancel: 'Cancel',
    saveChanges: 'Save changes',
    addApplication: 'Add application',
  },
  dashboard: {
    title: 'Pipeline analytics',
    subtitle: 'Response rates, funnel conversion, and where applications stall.',
    backToBoard: 'Back to board',
    kpis: {
      totalLabel: 'Total tracked',
      totalHint: (sent, wishlist) => `${sent} submitted · ${wishlist} in wishlist`,
      responseRateLabel: 'Response rate',
      responseRateHint: (count) => `${count} reached interview or offer`,
      offerConversionLabel: 'Offer conversion',
      offerConversionHint: (offers, sent) => `${offers} offer${offers === 1 ? '' : 's'} from ${sent} sent`,
      stalledLabel: 'Stalled applications',
      stalledHint: '14+ days without stage update',
    },
    stageDistributionTitle: 'Stage distribution',
    stageDistributionSubtitle: 'Breakdown of applications across every pipeline stage',
    bottlenecksTitle: 'Where applications bottleneck',
    bottlenecksSubtitle: 'Conversion and stall rates across your submitted applications',
    appliedToInterview: 'Applied → Interview',
    appliedToInterviewHint: 'Reach interview stage',
    interviewToOffer: 'Interview → Offer',
    interviewToOfferHint: 'Close into an offer',
    awaitingReply: 'Awaiting reply',
    awaitingReplyHint: 'Still in Applied stage',
    rejectionRate: 'Rejection rate',
    rejectionRateHint: 'Closed as Rejected',
    stalledTitle: 'Stalled applications (14+ days)',
    stalledSubtitle: 'Roles in Applied or Interview that may need a follow-up or closure',
    stalledBadge: (days) => `${days}d stalled`,
    stalledReasonApplied: 'No recruiter response yet',
    stalledReasonInterview: 'In interview stage without recent update',
    noStalled: 'No stalled applications — your pipeline is moving smoothly!',
    resumeTitle: 'Résumé performance',
    resumeSubtitle: 'Response rate by résumé version sent',
    responseBadge: (rate) => `${rate}% response`,
    resumeSummary: (responded, sent) =>
      `${responded} of ${sent} application${sent === 1 ? '' : 's'} reached interview/offer`,
    noResumeData: 'Add a résumé version when creating or editing applications to compare response rates here.',
  },
};

const FR: Translations = {
  appTitle: 'Suivi de candidatures',
  nav: {
    board: 'Tableau',
    dashboard: 'Analytique',
    languageLabel: 'Changer de langue',
  },
  stages: {
    ToApply: 'À postuler',
    Applied: 'Postulé',
    Interview: 'Entretien',
    Offer: 'Offre',
    Rejected: 'Refusé',
  },
  board: {
    title: 'Votre pipeline',
    subtitle: 'Glissez les cartes entre les étapes. Cliquez sur une carte pour la modifier.',
    filterAll: 'Toutes',
    filterFollowUps: 'Relances',
    filterContacts: 'Contacts',
    searchPlaceholder: 'Rechercher entreprise, poste, contact…',
    newApplication: 'Nouvelle candidature',
    stats: {
      sentLabel: 'Candidatures envoyées',
      sentHint: (toApply) => `${toApply} à postuler`,
      interviewsLabel: 'Entretiens',
      interviewsHint: 'en cours',
      offersLabel: 'Offres',
      offersHint: (hasOffer) => (hasOffer ? 'félicitations !' : 'continuez ainsi'),
      responseRateLabel: 'Taux de réponse',
      responseRateHint: 'entretiens + offres',
    },
    apiError: "Impossible de joindre l'API. Vérifiez qu'elle est démarrée, puis",
    tryAgain: 'réessayez',
    followUpsHeading: 'Rappels de relance',
    markDoneTitle: 'Marquer la relance comme effectuée',
    done: 'Fait',
    overdueDays: (days) => `En retard de ${days}j`,
    dueToday: "Aujourd'hui",
    tomorrow: 'Demain',
    inDays: (days) => `Dans ${days}j`,
    addedPrefix: 'Ajouté le',
    postingLink: 'Offre',
    dropCardHere: 'Déposez une carte ici',
  },
  dialog: {
    editTitle: 'Modifier la candidature',
    newTitle: 'Nouvelle candidature',
    editSubtitle: 'Mettez à jour les détails ou changez son étape.',
    newSubtitle: 'Suivez un poste qui vous intéresse ou auquel vous avez postulé.',
    company: 'Entreprise',
    position: 'Poste',
    stage: 'Étape',
    jobUrl: "Lien de l'offre",
    appliedOn: 'Postulé le',
    documentsHeading: 'Documents envoyés',
    resumeVersion: 'Version du CV',
    resumePlaceholder: 'ex. CV-Backend-v3-FR.pdf',
    coverLetterVersion: 'Lettre de motivation',
    coverLetterPlaceholder: 'ex. Personnalisée - Cloud',
    contactHeading: 'Contact / Recruteur',
    contactName: 'Nom',
    contactRole: 'Rôle',
    contactEmail: 'Courriel',
    followUpHeading: 'Rappel de relance',
    remindOn: 'Relancer le',
    reminderNote: 'Note de rappel',
    reminderPlaceholder: 'Envoyer un courriel de remerciement, relancer…',
    presets: {
      tomorrow: 'Demain',
      in3Days: '+3 jours',
      in1Week: '+1 sem.',
      in2Weeks: '+2 sem.',
      clear: 'Effacer',
    },
    notes: 'Notes',
    notesPlaceholder: 'Fourchette salariale, stack technique, notes d’entretien…',
    delete: 'Supprimer',
    confirmDelete: 'Cliquez à nouveau pour supprimer',
    cancel: 'Annuler',
    saveChanges: 'Enregistrer',
    addApplication: 'Ajouter',
  },
  dashboard: {
    title: 'Analytique du pipeline',
    subtitle: 'Taux de réponse, conversion et candidatures en attente.',
    backToBoard: 'Retour au tableau',
    kpis: {
      totalLabel: 'Total suivi',
      totalHint: (sent, wishlist) => `${sent} envoyées · ${wishlist} à postuler`,
      responseRateLabel: 'Taux de réponse',
      responseRateHint: (count) => `${count} en entretien ou offre`,
      offerConversionLabel: "Taux d'offre",
      offerConversionHint: (offers, sent) => `${offers} offre${offers > 1 ? 's' : ''} sur ${sent} envoyées`,
      stalledLabel: 'Candidatures stagnantes',
      stalledHint: '14+ jours sans mise à jour',
    },
    stageDistributionTitle: 'Répartition par étape',
    stageDistributionSubtitle: 'Distribution des candidatures à chaque étape du pipeline',
    bottlenecksTitle: 'Points de blocage',
    bottlenecksSubtitle: 'Taux de conversion et de stagnation des candidatures envoyées',
    appliedToInterview: 'Postulé → Entretien',
    appliedToInterviewHint: "Atteignent l'étape d'entretien",
    interviewToOffer: 'Entretien → Offre',
    interviewToOfferHint: 'Aboutissent à une offre',
    awaitingReply: 'En attente de réponse',
    awaitingReplyHint: 'Toujours au statut Postulé',
    rejectionRate: 'Taux de refus',
    rejectionRateHint: 'Clôturées comme Refusé',
    stalledTitle: 'Candidatures stagnantes (14+ jours)',
    stalledSubtitle: 'Postes en Postulé ou Entretien pouvant nécessiter une relance',
    stalledBadge: (days) => `${days}j sans suivi`,
    stalledReasonApplied: 'Aucune réponse du recruteur',
    stalledReasonInterview: 'En entretien sans mise à jour récente',
    noStalled: 'Aucune candidature stagnante — votre pipeline avance bien !',
    resumeTitle: 'Performance des CV',
    resumeSubtitle: 'Taux de réponse par version de CV envoyée',
    responseBadge: (rate) => `${rate}% de réponse`,
    resumeSummary: (responded, sent) =>
      `${responded} sur ${sent} candidature${sent > 1 ? 's' : ''} en entretien/offre`,
    noResumeData: 'Ajoutez une version de CV sur vos candidatures pour comparer leurs taux de réponse ici.',
  },
};

const DICTIONARIES: Record<Locale, Translations> = {
  en: EN,
  fr: FR,
};

function detectInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'fr') return saved;
  } catch {
    // Ignore storage errors in restricted environments
  }
  return 'en';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly locale = signal<Locale>(detectInitialLocale());
  readonly t = computed<Translations>(() => DICTIONARIES[this.locale()]);

  setLocale(locale: Locale) {
    this.locale.set(locale);
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Ignore storage errors
    }
  }

  toggleLocale() {
    this.setLocale(this.locale() === 'en' ? 'fr' : 'en');
  }
}
