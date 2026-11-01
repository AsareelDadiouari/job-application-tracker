import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApplicationsService, JobApplication } from '../applications/applications.service';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  const sampleApps: JobApplication[] = [
    {
      id: '1',
      company: 'Globex',
      position: 'Platform Engineer',
      status: 'Interview',
      jobUrl: null,
      notes: null,
      appliedOn: '2026-09-01',
      followUpOn: null,
      followUpNote: null,
      contactName: 'Sarah Jenkins',
      contactEmail: null,
      contactRole: null,
      resumeVersion: 'Backend-v3-EN.pdf',
      coverLetterVersion: null,
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-09-01T10:00:00Z',
    },
    {
      id: '2',
      company: 'Initech',
      position: 'Backend Developer',
      status: 'Rejected',
      jobUrl: null,
      notes: null,
      appliedOn: '2026-10-15',
      followUpOn: null,
      followUpNote: null,
      contactName: null,
      contactEmail: null,
      contactRole: null,
      resumeVersion: 'Backend-v3-EN.pdf',
      coverLetterVersion: null,
      createdAt: '2026-10-15T10:00:00Z',
      updatedAt: '2026-10-15T10:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        {
          provide: ApplicationsService,
          useValue: { list: vi.fn().mockReturnValue(of(sampleApps)) },
        },
      ],
    }).compileComponents();
  });

  it('computes response rate, stalled applications, and resume performance', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Pipeline analytics');
    expect(text).toContain('50%');
    expect(text).toContain('Backend-v3-EN.pdf');
    expect(text).toContain('Globex');
  });
});
