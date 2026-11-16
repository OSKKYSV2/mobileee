import { signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PhotoService } from '../services/photo.service';
import { ProductApiService } from '../services/product-api.service';
import { ShoppingListService } from '../services/shopping-list.service';

import { Tab2Page } from './tab2.page';

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;
  const addMock = vi.fn();
  const searchMock = vi.fn();

  beforeEach(() => {
    addMock.mockReset().mockResolvedValue(undefined);
    searchMock.mockReset();

    TestBed.configureTestingModule({
      providers: [
        { provide: ShoppingListService, useValue: { add: addMock } },
        { provide: ProductApiService, useValue: { search: searchMock } },
        { provide: PhotoService, useValue: { urls: signal({}), delete: vi.fn() } },
      ],
    });

    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not save an item without a name', async () => {
    component.name = '   ';

    await component.save();

    expect(addMock).not.toHaveBeenCalled();
  });

  it('should save the item and reset the form', async () => {
    component.name = ' Mléko ';
    component.increase();
    component.category = 'Mléčné výrobky';

    await component.save();

    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Mléko',
        quantity: 2,
        category: 'Mléčné výrobky',
        bought: false,
        photoFile: null,
      }),
    );
    expect(component.name).toBe('');
    expect(component.quantity).toBe(1);
  });

  it('should show an error when the product search fails', async () => {
    searchMock.mockRejectedValue(new Error('offline'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    component.name = 'mléko';

    await component.findProducts();

    expect(component.searchError()).toContain('nepodařilo');
    expect(component.searching()).toBe(false);
    errorSpy.mockRestore();
  });

  it('should fill the name from a picked suggestion', () => {
    component.pickSuggestion({ code: '1', name: 'Mléko', brand: 'Madeta' });

    expect(component.name).toBe('Mléko (Madeta)');
  });
});
