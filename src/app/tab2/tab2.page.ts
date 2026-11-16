import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { camera, search } from 'ionicons/icons';

import type { ProductSuggestion } from '../models/product-suggestion';
import { CATEGORIES } from '../models/shopping-item';
import { PhotoService } from '../services/photo.service';
import { ProductApiService } from '../services/product-api.service';
import { ShoppingListService } from '../services/shopping-list.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    FormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonImg,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page {
  private readonly list = inject(ShoppingListService);
  private readonly productApi = inject(ProductApiService);
  readonly photos = inject(PhotoService);

  readonly categories = CATEGORIES;

  // Formulář
  name = '';
  quantity = 1;
  category = CATEGORIES[0];
  readonly photoFile = signal<string | null>(null);
  readonly photoError = signal('');
  readonly savedMessage = signal('');

  // Návrhy produktů z API
  readonly suggestions = signal<ProductSuggestion[]>([]);
  readonly searching = signal(false);
  readonly searched = signal(false);
  readonly searchError = signal('');

  constructor() {
    addIcons({ camera, search });
  }

  async findProducts(): Promise<void> {
    const term = this.name.trim();
    if (term.length < 2 || this.searching()) {
      return;
    }

    this.searching.set(true);
    this.searchError.set('');
    this.suggestions.set([]);

    try {
      this.suggestions.set(await this.productApi.search(term));
    } catch (error) {
      console.error('Produkty se nepodařilo načíst.', error);
      this.searchError.set('Návrhy se nepodařilo načíst. Zkontrolujte připojení.');
    } finally {
      this.searching.set(false);
      this.searched.set(true);
    }
  }

  pickSuggestion(product: ProductSuggestion): void {
    this.name = product.brand ? `${product.name} (${product.brand})` : product.name;
    this.clearSuggestions();
  }

  increase(): void {
    this.quantity++;
  }

  decrease(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  async takePhoto(): Promise<void> {
    this.photoError.set('');

    try {
      const previous = this.photoFile();
      this.photoFile.set(await this.photos.takePhoto());
      await this.photos.delete(previous);
    } catch (error) {
      // Zrušení fotoaparátu uživatelem také skončí chybou, proto jen krátká zpráva.
      console.warn('Fotku se nepodařilo pořídit.', error);
      this.photoError.set('Fotka nebyla pořízena.');
    }
  }

  async removePhoto(): Promise<void> {
    await this.photos.delete(this.photoFile());
    this.photoFile.set(null);
  }

  async save(): Promise<void> {
    const name = this.name.trim();
    if (!name) {
      return;
    }

    await this.list.add({
      id: crypto.randomUUID(),
      name,
      quantity: this.quantity,
      category: this.category,
      bought: false,
      createdAt: new Date().toISOString(),
      photoFile: this.photoFile(),
    });

    this.savedMessage.set(`„${name}“ přidáno do seznamu.`);
    this.name = '';
    this.quantity = 1;
    this.photoFile.set(null);
    this.photoError.set('');
    this.clearSuggestions();
  }

  private clearSuggestions(): void {
    this.suggestions.set([]);
    this.searched.set(false);
    this.searchError.set('');
  }
}
