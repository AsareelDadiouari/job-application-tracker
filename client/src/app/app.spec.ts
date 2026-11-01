import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render title and toggle between English and French', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header')?.textContent).toContain('Job Application Tracker');

    const buttons = Array.from(compiled.querySelectorAll<HTMLButtonElement>('header button'));
    const frBtn = buttons.find((b) => b.textContent?.trim() === 'FR');
    expect(frBtn).toBeTruthy();
    frBtn!.click();
    fixture.detectChanges();

    expect(compiled.querySelector('header')?.textContent).toContain('Suivi de candidatures');
    expect(compiled.querySelector('header')?.textContent).toContain('Tableau');
  });
});
