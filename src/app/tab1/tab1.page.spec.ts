import { signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ShoppingItem } from '../models/shopping-item';
import { PhotoService } from '../services/photo.service';
import { ShoppingListService } from '../services/shopping-list.service';

import { Tab1Page } from './tab1.page';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  const items = signal<ShoppingItem[]>([]);

  function item(id: string, bought: boolean): ShoppingItem {
    return {
      id,
      name: id,
      quantity: 1,
      category: 'Pečivo',
      bought,
      createdAt: '2026-11-16T10:00:00.000Z',
      photoFile: null,
    };
  }

  beforeEach(() => {
    items.set([]);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ShoppingListService,
          useValue: { items, initialized: signal(true), errorMessage: signal('') },
        },
        { provide: PhotoService, useValue: { urls: signal({}), load: vi.fn() } },
      ],
    });

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show the empty state', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Seznam je prázdný');
  });

  it('should count items and apply the filter', () => {
    items.set([item('rohlik', false), item('chleba', true)]);

    expect(component.openCount()).toBe(1);
    expect(component.progress()).toBe(50);
    expect(component.openLabel()).toBe('1 věc');
    expect(component.boughtCount()).toBe(1);

    component.filter.set('bought');
    expect(component.groups()[0].items.map((value) => value.id)).toEqual(['chleba']);
  });
});
