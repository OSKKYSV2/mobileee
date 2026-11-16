import { signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ShoppingItem } from '../../models/shopping-item';
import { PhotoService } from '../../services/photo.service';

import { ShoppingItemComponent } from './shopping-item.component';

describe('ShoppingItemComponent', () => {
  let component: ShoppingItemComponent;
  let fixture: ComponentFixture<ShoppingItemComponent>;

  const bread: ShoppingItem = {
    id: 'bread',
    name: 'Chleba',
    quantity: 1,
    category: 'Pečivo',
    bought: false,
    createdAt: '2026-11-16T10:00:00.000Z',
    photoFile: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PhotoService, useValue: { urls: signal({}), load: vi.fn() } }],
    });

    fixture = TestBed.createComponent(ShoppingItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', bread);
    fixture.detectChanges();
  });

  it('should show the item name and quantity', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Chleba');
    expect(text).toContain('1×');
  });

  it('should emit the new bought state', () => {
    const emitted: boolean[] = [];
    component.toggled.subscribe((value) => emitted.push(value));

    component.toggle();

    expect(emitted).toEqual([true]);
  });

  it('should not go below quantity one', () => {
    const emitted: number[] = [];
    component.quantityChanged.subscribe((value) => emitted.push(value));

    component.decrease();
    component.increase();

    expect(emitted).toEqual([1]);
  });
});
