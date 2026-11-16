import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';

import { ShoppingItemComponent } from '../components/shopping-item/shopping-item.component';
import type { ItemFilter } from '../models/list-utils';
import { countOpen, filterItems, groupByCategory } from '../models/list-utils';
import type { ShoppingItem } from '../models/shopping-item';
import { categoryIcon } from '../models/shopping-item';
import { ShoppingListService } from '../services/shopping-list.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonSpinner,
    IonTitle,
    IonToolbar,
    ShoppingItemComponent,
  ],
})
export class Tab1Page {
  readonly list = inject(ShoppingListService);
  private readonly alerts = inject(AlertController);
  private readonly router = inject(Router);

  readonly filter = signal<ItemFilter>('all');
  readonly filters: { value: ItemFilter; label: string }[] = [
    { value: 'all', label: 'Vše' },
    { value: 'open', label: 'Koupit' },
    { value: 'bought', label: 'Koupené' },
  ];

  // Odvozené hodnoty se přepočítají při změně seznamu nebo filtru.
  readonly groups = computed(() => groupByCategory(filterItems(this.list.items(), this.filter())));
  readonly openCount = computed(() => countOpen(this.list.items()));
  readonly boughtCount = computed(() => this.list.items().length - this.openCount());
  readonly progress = computed(() => {
    const total = this.list.items().length;
    return total === 0 ? 0 : Math.round((this.boughtCount() / total) * 100);
  });
  // Česká koncovka: 1 věc, 2–4 věci, 5 a více věcí.
  readonly openLabel = computed(() => {
    const count = this.openCount();
    const word = count === 1 ? 'věc' : count < 5 ? 'věci' : 'věcí';
    return `${count} ${word}`;
  });

  constructor() {
    addIcons({ add });
  }

  icon(category: string): string {
    return categoryIcon(category);
  }

  async goToAdd(): Promise<void> {
    await this.router.navigateByUrl('/tabs/tab2');
  }

  async toggle(item: ShoppingItem, bought: boolean): Promise<void> {
    await this.list.setBought(item, bought);
  }

  async changeQuantity(item: ShoppingItem, delta: number): Promise<void> {
    await this.list.changeQuantity(item, delta);
  }

  async remove(item: ShoppingItem): Promise<void> {
    if (await this.confirm(`Odstranit položku „${item.name}“?`)) {
      await this.list.remove(item);
    }
  }

  async removeBought(): Promise<void> {
    if (await this.confirm(`Odstranit všechny koupené položky (${this.boughtCount()})?`)) {
      await this.list.removeBought();
    }
  }

  // Potvrzovací dialog; vrátí true, pokud uživatel klikl na Odstranit.
  private async confirm(message: string): Promise<boolean> {
    const alert = await this.alerts.create({
      header: 'Potvrzení',
      message,
      buttons: [
        { text: 'Zrušit', role: 'cancel' },
        { text: 'Odstranit', role: 'confirm' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }
}
