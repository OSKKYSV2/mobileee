import { signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../services/auth.service';
import { ShoppingListService } from '../services/shopping-list.service';

import { Tab3Page } from './tab3.page';

describe('Tab3Page', () => {
  let component: Tab3Page;
  let fixture: ComponentFixture<Tab3Page>;
  const logoutMock = vi.fn();

  beforeEach(() => {
    logoutMock.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { user: signal({ email: 'test@example.com' }), logout: logoutMock },
        },
        { provide: ShoppingListService, useValue: { items: signal([]) } },
      ],
    });

    fixture = TestBed.createComponent(Tab3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show the account e-mail', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('test@example.com');
  });

  it('should show a message when logout fails', async () => {
    logoutMock.mockRejectedValue(new Error('offline'));

    await component.logout();

    expect(component.logoutError()).toBe('Odhlášení se nezdařilo. Zkuste to znovu.');
    expect(component.signingOut()).toBe(false);
  });
});
