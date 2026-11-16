import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ShoppingItem } from '../models/shopping-item';

import { AuthService } from './auth.service';
import { PhotoService } from './photo.service';
import { ShoppingListService } from './shopping-list.service';

// Firestore nahradíme mockem, testy nezapisují do skutečné databáze.
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => 'collection'),
  doc: vi.fn((_collection: unknown, id: string) => `doc-${id}`),
  query: vi.fn(() => 'query'),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(() => () => undefined),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  writeBatch: vi.fn(),
}));

describe('ShoppingListService', () => {
  let service: ShoppingListService;
  const userId = signal<string | null>('user-1');
  const deletePhoto = vi.fn();

  const milk: ShoppingItem = {
    id: 'milk',
    name: 'Mléko',
    quantity: 2,
    category: 'Mléčné výrobky',
    bought: false,
    createdAt: '2026-11-16T10:00:00.000Z',
    photoFile: 'photo-1.jpeg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(setDoc).mockResolvedValue(undefined);
    vi.mocked(updateDoc).mockResolvedValue(undefined);
    vi.mocked(deleteDoc).mockResolvedValue(undefined);
    userId.set('user-1');

    TestBed.configureTestingModule({
      providers: [
        ShoppingListService,
        { provide: AuthService, useValue: { userId } },
        { provide: PhotoService, useValue: { delete: deletePhoto } },
      ],
    });

    service = TestBed.inject(ShoppingListService);
  });

  it('should save a new item as a document with its id', async () => {
    await service.add(milk);

    expect(setDoc).toHaveBeenCalledWith('doc-milk', milk);
  });

  it('should not write anything when nobody is logged in', async () => {
    userId.set(null);

    await service.add(milk);

    expect(setDoc).not.toHaveBeenCalled();
  });

  it('should mark an item as bought', async () => {
    await service.setBought(milk, true);

    expect(updateDoc).toHaveBeenCalledWith('doc-milk', { bought: true });
  });

  it('should change the quantity but never below one', async () => {
    await service.changeQuantity(milk, 1);
    expect(updateDoc).toHaveBeenCalledWith('doc-milk', { quantity: 3 });

    vi.mocked(updateDoc).mockClear();
    await service.changeQuantity({ ...milk, quantity: 1 }, -1);
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it('should delete the item together with its photo', async () => {
    await service.remove(milk);

    expect(deleteDoc).toHaveBeenCalledWith('doc-milk');
    expect(deletePhoto).toHaveBeenCalledWith('photo-1.jpeg');
  });

  it('should show an error message when saving fails', async () => {
    vi.mocked(setDoc).mockRejectedValue(new Error('permission-denied'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.tick();

    await service.add(milk);

    expect(service.errorMessage()).toBe('Položku se nepodařilo uložit.');
    errorSpy.mockRestore();
  });
});
