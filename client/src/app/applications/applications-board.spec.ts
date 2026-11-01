import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApplicationsBoard } from './applications-board';
import { ApplicationsService, JobApplication } from './applications.service';

describe('ApplicationsBoard', () => {
  const sampleApps: JobApplication[] = [
    {
      id: '1',
      company: 'Globex',
      position: 'Platform Engineer',
      status: 'Interview',
      jobUrl: 'https://globex.example/jobs/1',
      notes: 'Panel interview scheduled',
      appliedOn: '2026-10-25',
      followUpOn: '2026-10-20',
      followUpNote: 'Send thank-you note to Sarah',
      contactName: 'Sarah Jenkins',
      contactEmail: 'sarah@globex.example',
      contactRole: 'Technical Recruiter',
      resumeVersion: 'Backend-v3-EN.pdf',
      coverLetterVersion: 'Globex-Cover.pdf',
      createdAt: '2026-10-25T10:00:00Z',
      updatedAt: '2026-10-25T10:00:00Z',
    },
    {
      id: '2',
      company: 'Initech',
      position: 'Backend Developer',
      status: 'Applied',
      jobUrl: null,
      notes: null,
      appliedOn: '2026-10-28',
      followUpOn: null,
      followUpNote: null,
      contactName: null,
      contactEmail: null,
      contactRole: null,
      resumeVersion: null,
      coverLetterVersion: null,
      createdAt: '2026-10-28T10:00:00Z',
      updatedAt: '2026-10-28T10:00:00Z',
    },
  ];

  let serviceSpy: {
    list: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    serviceSpy = {
      list: vi.fn().mockReturnValue(of(sampleApps)),
      update: vi.fn().mockImplementation((id, req) => of({ ...sampleApps[0], id, ...req })),
      create: vi.fn(),
      delete: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ApplicationsBoard],
      providers: [{ provide: ApplicationsService, useValue: serviceSpy }],
    }).compileComponents();
  });

  it('renders follow-up reminders and contact details on the board', async () => {
    const fixture = TestBed.createComponent(ApplicationsBoard);
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Follow-up reminders');
    expect(text).toContain('Send thank-you note to Sarah');
    expect(text).toContain('Sarah Jenkins');
    expect(text).toContain('Backend-v3-EN.pdf');
    expect(text).toContain('Globex-Cover.pdf');
  });

  it('clears follow-up reminder when marked done', async () => {
    const fixture = TestBed.createComponent(ApplicationsBoard);
    await fixture.whenStable();
    fixture.detectChanges();

    const doneBtn = (fixture.nativeElement as HTMLElement).querySelector(
      'button[title="Mark follow-up as done"]',
    ) as HTMLButtonElement;
    expect(doneBtn).toBeTruthy();

    doneBtn.click();
    fixture.detectChanges();

    expect(serviceSpy.update).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        company: 'Globex',
        followUpOn: null,
        followUpNote: null,
      }),
    );
  });
});
