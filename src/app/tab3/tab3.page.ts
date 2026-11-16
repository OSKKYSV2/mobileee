import { Component, computed, inject, signal } from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { countOpen } from '../models/list-utils';
import { AuthService } from '../services/auth.service';
import { ShoppingListService } from '../services/shopping-list.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab3Page {
  readonly auth = inject(AuthService);
  readonly list = inject(ShoppingListService);

  readonly openCount = computed(() => countOpen(this.list.items()));
  readonly signingOut = signal(false);
  readonly logoutError = signal('');

  async logout(): Promise<void> {
    if (this.signingOut()) {
      return;
    }

    this.logoutError.set('');
    this.signingOut.set(true);
    try {
      await this.auth.logout();
    } catch {
      this.logoutError.set('Odhlášení se nezdařilo. Zkuste to znovu.');
    } finally {
      this.signingOut.set(false);
    }
  }
}
