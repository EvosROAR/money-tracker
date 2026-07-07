# PocketLedger

Aplikasi pencatat keuangan pribadi yang jalan di web dan mobile dari satu codebase. Data disinkronkan lewat Firebase, dengan dukungan anggaran per kategori, transaksi berulang, multi-mata uang, dan kunci PIN.

**Live demo:** [money-tracker-pearl-eight.vercel.app](https://money-tracker-pearl-eight.vercel.app)

---

## Screenshots

| Dashboard | Transaksi | Anggaran |
|-----------|-----------|----------|
| ![Dashboard](./docs/screenshots/dashboard.png) | ![Transactions](./docs/screenshots/transactions.png) | ![Budget](./docs/screenshots/budget.png) |

| Laporan | Pengaturan | PIN Lock |
|---------|------------|----------|
| ![Reports](./docs/screenshots/reports.png) | ![Settings](./docs/screenshots/settings.png) | ![PIN Lock](./docs/screenshots/pin-lock.png) |

| Transaksi Berulang |
|--------------------|
| ![Recurring](./docs/screenshots/recurring.png) |

---

## Fitur

- Login & register (Firebase Auth)
- Dashboard — saldo, ringkasan bulan ini, jatuh tempo 7 hari, transaksi terbaru
- Transaksi — CRUD, filter bulan/tipe/kategori, pencarian
- Transaksi berulang — harian/mingguan/bulanan/tahunan, auto-generate saat buka app
- Kategori — CRUD dengan icon & warna, default saat register
- Anggaran — batas per kategori per bulan, progress bar & peringatan limit
- Laporan — income vs expense, breakdown per kategori, ekspor JSON
- Pengaturan — profil, tema gelap/terang, bahasa (ID/EN), mata uang
- Keamanan — PIN lock (web & mobile), biometrik (mobile)
- Backup & restore data JSON (web)
- Pengingat harian (mobile)

### Mata uang

Data disimpan dalam **IDR**. Input bisa pakai mata uang tampilan (USD, EUR, dll.) — otomatis dikonversi saat simpan. Kurs di-cache ~30 menit dengan fallback offline.

---

## Tech Stack

| | |
|---|---|
| Framework | Expo SDK 57, React Native, TypeScript |
| Navigation | React Navigation v7 |
| State | Zustand + TanStack Query |
| Backend | Firebase Auth, Cloud Firestore |
| Forms | React Hook Form + Zod |
| i18n | i18next (Indonesia & English) |

---

## Menjalankan Project

**Prasyarat:** Node.js ≥ 20.19, akun Firebase

```bash
git clone https://github.com/EvosROAR/money-tracker.git
cd money-tracker
npm install
cp .env.example .env
```

Isi `.env` dengan kredensial Firebase (lihat [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md)), lalu:

```bash
npm start        # Metro bundler
npm run web      # Browser
npm run android  # Expo Go / emulator
```

Setelah ubah `.env`, restart dengan `npx expo start -c`.

---

## Firebase

1. Buat project di [Firebase Console](https://console.firebase.google.com/)
2. Aktifkan Authentication → Email/Password
3. Buat Cloud Firestore
4. Deploy rules: `firebase deploy --only firestore:rules`
5. Untuk deploy Vercel, tambahkan domain di Authentication → Authorized domains

Struktur data:

```
users/{userId}
users/{userId}/categories/{id}
users/{userId}/transactions/{id}
users/{userId}/budgets/{id}
users/{userId}/recurring_transactions/{id}
```

---

## Struktur Project

```
src/
├── domain/           # entities, repository interfaces
├── infrastructure/   # Firebase, exchange rate API
├── application/      # use cases, backup, recurring processor
├── presentation/     # screens, components, hooks
├── store/            # Zustand
├── lib/              # i18n, utils, schemas
└── theme/
```

Alur data: `Screen → Hook → Repository → Firestore`, validasi lewat Zod.

---

## Scripts

| Perintah | Keterangan |
|----------|------------|
| `npm start` | Dev server |
| `npm run web` | Buka di browser |
| `npm test` | Unit tests |
| `npm run build:web` | Build static ke `dist/` |

---

## Deploy

**Web:** Import repo ke [Vercel](https://vercel.com), set env vars Firebase (sama seperti `.env`). Detail di [`docs/VERCEL_DEPLOY.md`](docs/VERCEL_DEPLOY.md).

**Mobile:** `eas build --platform android` (config di `eas.json`).

---

## Testing

```bash
npm test
```

Coverage: utility `currency`, `pin`, `recurringDate`, `reports`.

---

## Lisensi

MIT
