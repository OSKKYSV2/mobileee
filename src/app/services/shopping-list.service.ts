import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

import { firestore } from '../firebase.client';
import type { ShoppingItem } from '../models/shopping-item';

import { AuthService } from './auth.service';
import { PhotoService } from './photo.service';

@Injectable({ providedIn: 'root' })
export class ShoppingListService {
  private readonly auth = inject(AuthService);
  private readonly photos = inject(PhotoService);
  private readonly itemsState = signal<ShoppingItem[]>([]);
  private readonly initializedState = signal(false);
  private readonly errorState = signal('');
  private readonly owner = signal<string | null>(null);

  // Při změně účtu hned schováme položky předchozího uživatele.
  readonly initialized = computed(() => this.owner() === this.auth.userId() && this.initializedState());
  readonly items = computed(() => (this.initialized() ? this.itemsState() : []));
  readonly errorMessage = computed(() => (this.owner() === this.auth.userId() ? this.errorState() : ''));

  constructor() {
    // Efekt sleduje UID: po přihlášení připojí posluchač, po odhlášení ho odpojí.
    effect((onCleanup) => {
      const uid = this.auth.userId();
      this.owner.set(uid);
      this.itemsState.set([]);
      this.initializedState.set(false);
      this.errorState.set('');

      if (uid !== null) {
        const unsubscribe = this.connect(uid);
        if (unsubscribe) {
          onCleanup(unsubscribe);
        }
      }
    });
  }

  async add(item: ShoppingItem): Promise<void> {
    await this.write('Položku se nepodařilo uložit.', (uid) => setDoc(doc(this.userItems(uid), item.id), item));
  }

  async setBought(item: ShoppingItem, bought: boolean): Promise<void> {
    await this.write('Položku se nepodařilo změnit.', (uid) =>
      updateDoc(doc(this.userItems(uid), item.id), { bought }),
    );
  }

  async changeQuantity(item: ShoppingItem, delta: number): Promise<void> {
    const quantity = item.quantity + delta;
    if (quantity < 1) {
      return;
    }

    await this.write('Množství se nepodařilo změnit.', (uid) =>
      updateDoc(doc(this.userItems(uid), item.id), { quantity }),
    );
  }

  async remove(item: ShoppingItem): Promise<void> {
    await this.write('Položku se nepodařilo odstranit.', (uid) => deleteDoc(doc(this.userItems(uid), item.id)));
    await this.photos.delete(item.photoFile);
  }

  async removeBought(): Promise<void> {
    const bought = this.items().filter((item) => item.bought);
    if (bought.length === 0) {
      return;
    }

    // Dávka smaže všechny dokumenty najednou: buď všechny, nebo žádný.
    await this.write('Koupené položky se nepodařilo odstranit.', (uid) => {
      const batch = writeBatch(firestore);
      for (const item of bought) {
        batch.delete(doc(this.userItems(uid), item.id));
      }
      return batch.commit();
    });

    for (const item of bought) {
      await this.photos.delete(item.photoFile);
    }
  }

  private userItems(uid: string) {
    return collection(firestore, 'users', uid, 'items');
  }

  // Společná obsluha zápisu: kontrola přihlášení a chybová zpráva.
  private async write(message: string, action: (uid: string) => Promise<void>): Promise<void> {
    const uid = this.auth.userId();
    if (uid === null) {
      return;
    }

    this.errorState.set('');

    try {
      await action(uid);
    } catch (error) {
      console.error(error);
      if (this.auth.userId() === uid) {
        this.errorState.set(message);
      }
    }
  }

  private connect(uid: string) {
    try {
      const itemsQuery = query(this.userItems(uid), orderBy('createdAt', 'desc'));

      // Seznam mění pouze tento callback, zápisy ho samy neupravují.
      return onSnapshot(
        itemsQuery,
        (snapshot) => {
          const items = snapshot.docs.map((item) => item.data() as ShoppingItem);
          this.itemsState.set(items);
          this.initializedState.set(true);
        },
        (error) => {
          console.error(error);
          this.errorState.set('Seznam se nepodařilo načíst.');
          this.initializedState.set(true);
        },
      );
    } catch (error) {
      console.error(error);
      this.errorState.set('Připojení k seznamu se nezdařilo.');
      this.initializedState.set(true);
      return undefined;
    }
  }
}
