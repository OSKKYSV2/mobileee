import { Injectable, signal } from '@angular/core';
import { Camera } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  // Název souboru → data URL pro <ion-img>. Prázdný řetězec = soubor v tomto zařízení není.
  private readonly urlsState = signal<Record<string, string>>({});
  readonly urls = this.urlsState.asReadonly();

  // Vyfotí produkt, uloží fotku do soukromé složky aplikace a vrátí název souboru.
  async takePhoto(): Promise<string> {
    const photo = await Camera.takePhoto({
      quality: 60,
      targetWidth: 800,
      targetHeight: 800,
      correctOrientation: true,
    });

    if (!photo.webPath) {
      throw new Error('Fotoaparát nevrátil fotografii.');
    }

    const dataUrl = await this.dataUrlFromPath(photo.webPath);
    const filename = `photo-${Date.now()}.jpeg`;

    await Filesystem.writeFile({
      path: filename,
      data: dataUrl,
      directory: Directory.Data,
    });

    this.urlsState.update((urls) => ({ ...urls, [filename]: dataUrl }));
    return filename;
  }

  // Načte fotku ze souboru, pokud ji ještě nemáme v paměti.
  async load(filename: string): Promise<void> {
    if (filename in this.urls()) {
      return;
    }

    let url = '';
    try {
      const { data } = await Filesystem.readFile({ path: filename, directory: Directory.Data });
      url = await this.fileDataToUrl(data);
    } catch {
      // Fotka byla pořízena na jiném zařízení, proto tu soubor není.
    }

    this.urlsState.update((urls) => ({ ...urls, [filename]: url }));
  }

  async delete(filename: string | null): Promise<void> {
    if (!filename) {
      return;
    }

    try {
      await Filesystem.deleteFile({ path: filename, directory: Directory.Data });
    } catch {
      // Soubor v tomto zařízení není, není co mazat.
    }

    this.urlsState.update((urls) => {
      const rest = { ...urls };
      delete rest[filename];
      return rest;
    });
  }

  private async dataUrlFromPath(path: string): Promise<string> {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Fotografii nelze načíst: HTTP ${response.status}.`);
    }

    return this.blobToDataUrl(await response.blob());
  }

  // Na webu vrací Filesystem Blob, na Androidu base64 řetězec.
  private async fileDataToUrl(data: string | Blob): Promise<string> {
    if (data instanceof Blob) {
      return this.blobToDataUrl(data);
    }

    return data.startsWith('data:') ? data : `data:image/jpeg;base64,${data}`;
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Obrazová data nelze přečíst.'));
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Obrazová data nemají očekávaný formát.'));
        }
      };
      reader.readAsDataURL(blob);
    });
  }
}
