# Nákupní seznam

Závěrečný projekt předmětu **Programování mobilních aplikací (AP5PM)**, 2026.

Mobilní aplikace pro sdílený nákupní seznam domácnosti. Uživatel se přihlásí e-mailem, přidává
položky s množstvím, kategorií a fotkou a v obchodě je odškrtává. Seznam se ukládá do cloudu
a synchronizuje se v reálném čase mezi všemi telefony přihlášenými stejným účtem.

## Funkce

| Záložka | Funkce |
| --- | --- |
| **Přihlášení** | registrace a přihlášení e-mailem a heslem, srozumitelné chybové hlášky |
| **Seznam** | položky seskupené podle kategorií (v pořadí jako v obchodě), odškrtnutí koupené položky, změna množství, smazání s potvrzením, filtr *Vše / Koupit / Koupené*, počítadlo „zbývá koupit X z Y“, hromadné smazání koupených |
| **Přidat** | název s **návrhy produktů z Open Food Facts API**, množství, kategorie, **fotka z fotoaparátu** |
| **Účet** | přihlášený e-mail, statistika seznamu, odhlášení, informace o aplikaci |

Ošetřené stavy: načítání, prázdný seznam, prázdný filtr, chyba sítě nebo API, chyba zápisu,
zrušené focení.

## Použité technologie

- **Ionic 9 + Angular 22** (standalone komponenty, signals, `computed`, `effect`)
- **Capacitor 8** – Android, pluginy **Camera** a **Filesystem**
- **Firebase Authentication** – přihlášení e-mailem a heslem
- **Cloud Firestore** – data v `users/{uid}/items/{itemId}`, živé změny přes `onSnapshot()`
- **REST API Open Food Facts** – `HttpClient`, `GET` s parametry, `timeout`
- **Vitest** – jednotkové testy služeb, komponent a stránek

## Struktura projektu

```text
src/app/
├── app.component.*            přihlašovací formulář, po přihlášení záložky
├── firebase.client.ts         jediné místo s initializeApp()
├── components/shopping-item/  jedna položka seznamu (input/output)
├── models/                    datové typy a pomocné funkce (filtr, seskupení)
├── services/
│   ├── auth.service.ts            přihlášení (Firebase Auth)
│   ├── shopping-list.service.ts   seznam ve Firestore
│   ├── product-api.service.ts     návrhy produktů (Open Food Facts)
│   └── photo.service.ts           fotoaparát a uložení fotek
├── tab1/  Seznam
├── tab2/  Přidat
└── tab3/  Účet
firestore.rules                pravidla databáze
```

Fotky se ukládají do soukromé složky aplikace v telefonu (`Filesystem`, `Directory.Data`)
a ve Firestore je jen název souboru. Na jiném telefonu se proto místo fotky zobrazí poznámka.

## Sestavení a spuštění

Potřebujete Node.js 26, Ionic CLI a pro Android také Android Studio (SDK 36).

```bash
npm install
ionic serve
```

Aplikace poběží na `http://localhost:8100`.

### Testy a kontrola kódu

```bash
npm run test:unit
npm run lint
```

### Android a APK

```bash
ionic build
npx cap sync android
npx cap open android
```

V Android Studiu: **Build → Build App Bundle(s) / APK(s) → Build APK(s)**, nebo z příkazové řádky:

```bash
cd android
./gradlew assembleDebug
```

Výsledné APK: `android/app/build/outputs/apk/debug/app-debug.apk`.

### Firebase

Konfigurace projektu je v `src/environments/`. Ve Firebase Console musí být:

1. **Authentication → Sign-in method → Email/Password** zapnuté,
2. **Firestore Database** vytvořená,
3. obsah souboru `firestore.rules` publikovaný v **Firestore → Rules**.

## Rozdělení práce

| Člen týmu | Práce |
| --- | --- |
| Oskar Kment | Firebase (přihlášení, Firestore, pravidla), služba seznamu, synchronizace |
| *[druhý člen týmu]* | UI stránek, komponenta položky, kamera, API produktů, testy, ikona, APK |

## Zdroje dat

Návrhy produktů: [Open Food Facts](https://world.openfoodfacts.org/), licence
[ODbL](https://opendatacommons.org/licenses/odbl/1-0/).
