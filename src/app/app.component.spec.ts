import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { describe, expect, it } from 'vitest';

import { AppComponent, messageFor } from './app.component';
import { AuthService } from './services/auth.service';

describe('AppComponent', () => {
  it('should show the login form when nobody is logged in', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: { ready: signal(true), user: signal(null) } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Přihlášení');
  });

  it('should translate Firebase errors to Czech messages', () => {
    expect(messageFor(new FirebaseError('auth/invalid-credential', ''))).toBe('Zkontrolujte e-mail a heslo.');
    expect(messageFor(new Error('něco jiného'))).toBe('Akci se nepodařilo dokončit.');
  });
});
