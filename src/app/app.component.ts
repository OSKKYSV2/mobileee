import { Component, inject, signal } from '@angular/core';
import { FormsModule, type NgForm } from '@angular/forms';
import {
  IonApp,
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonRouterOutlet,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { FirebaseError } from 'firebase/app';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    FormsModule,
    IonApp,
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonRouterOutlet,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class AppComponent {
  readonly auth = inject(AuthService);
  readonly busy = signal(false);
  readonly errorMessage = signal('');
  registering = false;
  email = '';
  password = '';

  toggleMode(): void {
    this.registering = !this.registering;
    this.errorMessage.set('');
    this.password = '';
  }

  async submit(form: NgForm): Promise<void> {
    const email = this.email.trim();
    if (form.invalid || !email) {
      return;
    }

    await this.run(() =>
      this.registering ? this.auth.register(email, this.password) : this.auth.login(email, this.password),
    );
  }

  // Blokuje další odeslání během čekání a po dokončení znovu povolí formulář.
  private async run(action: () => Promise<void>): Promise<void> {
    if (this.busy()) {
      return;
    }

    this.errorMessage.set('');
    this.busy.set(true);
    try {
      await action();
      this.password = '';
      this.registering = false;
    } catch (error) {
      this.errorMessage.set(messageFor(error));
    } finally {
      this.busy.set(false);
    }
  }
}

// Převod chybových kódů Firebase na text pro uživatele.
export function messageFor(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Zadejte platnou e-mailovou adresu.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Zkontrolujte e-mail a heslo.';
    case 'auth/email-already-in-use':
      return 'Účet se nepodařilo vytvořit. Pokud ho už máte, přihlaste se.';
    case 'auth/weak-password':
    case 'auth/password-does-not-meet-requirements':
      return 'Heslo musí mít alespoň 6 znaků.';
    case 'auth/network-request-failed':
      return 'Zkontrolujte připojení k internetu a zkuste to znovu.';
    case 'auth/operation-not-allowed':
      return 'Přihlášení e-mailem není ve Firebase projektu zapnuté.';
    default:
      return 'Akci se nepodařilo dokončit.';
  }
}
