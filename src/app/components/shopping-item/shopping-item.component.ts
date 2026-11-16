import { Component, computed, effect, inject, input, output } from '@angular/core';
import { IonButton, IonIcon, IonImg, IonItem, IonLabel } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircle, ellipseOutline, trashOutline } from 'ionicons/icons';

import type { ShoppingItem } from '../../models/shopping-item';
import { PhotoService } from '../../services/photo.service';

@Component({
  selector: 'app-shopping-item',
  templateUrl: './shopping-item.component.html',
  styleUrls: ['./shopping-item.component.scss'],
  imports: [IonButton, IonIcon, IonImg, IonItem, IonLabel],
})
export class ShoppingItemComponent {
  private readonly photos = inject(PhotoService);

  readonly item = input.required<ShoppingItem>();
  readonly toggled = output<boolean>();
  readonly quantityChanged = output<number>();
  readonly removed = output<void>();

  // Data URL fotky, pokud je soubor v tomto zařízení.
  readonly photoUrl = computed(() => {
    const file = this.item().photoFile;
    return file ? this.photos.urls()[file] : undefined;
  });

  constructor() {
    addIcons({ checkmarkCircle, ellipseOutline, trashOutline });

    // Při zobrazení položky s fotkou načteme soubor z úložiště.
    effect(() => {
      const file = this.item().photoFile;
      if (file) {
        void this.photos.load(file);
      }
    });
  }

  toggle(): void {
    this.toggled.emit(!this.item().bought);
  }

  increase(): void {
    this.quantityChanged.emit(1);
  }

  decrease(): void {
    if (this.item().quantity > 1) {
      this.quantityChanged.emit(-1);
    }
  }
}
