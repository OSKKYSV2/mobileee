import { Component, computed, inject, signal } from '@angular/core';
import { IonButton, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

import { countOpen } from '../models/list-utils';
import { AuthService } from '../services/auth.service';
import { ShoppingListService } from '../services/shopping-list.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [IonButton, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar],
})
export class Tab3Page {
  readonly auth = inject(AuthService);
  readonly list = inject(ShoppingListService);

  readonly openCount = computed(() => countOpen(this.list.items()));
  readonly boughtCount = computed(() => this.list.items().length - this.openCount());
  // První písmeno e-mailu do kulatého avataru.
  readonly initial = computed(() => (this.auth.user()?.email ?? '?').charAt(0).toUpperCase());
  readonly signingOut = signal(false);
  readonly logoutError = signal('');

  constructor() {
    addIcons({ logOutOutline });
  }

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
