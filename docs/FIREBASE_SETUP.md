# Firebase Setup Guide

## 1. Buat / gunakan project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project yang sudah Anda buat
3. Klik ikon **Web** (`</>`) untuk menambahkan web app jika belum ada
4. Salin config object (apiKey, authDomain, projectId, dll.)

## 2. Aktifkan Authentication

1. Firebase Console → **Build** → **Authentication**
2. Tab **Sign-in method**
3. Aktifkan **Email/Password**
4. (Opsional) Aktifkan **Google** untuk social login di fase berikutnya

## 3. Buat Cloud Firestore

1. Firebase Console → **Build** → **Firestore Database**
2. Klik **Create database**
3. Pilih mode **Production** (kita pakai security rules sendiri)
4. Pilih region terdekat (mis. `asia-southeast1` untuk Indonesia)

## 4. Deploy Security Rules & Indexes

Install Firebase CLI jika belum:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
```

Saat init, pilih project Anda dan arahkan ke folder `firebase/` di repo ini.

Deploy:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Atau copy manual isi `firebase/firestore.rules` ke Firebase Console → Firestore → Rules.

## 5. Konfigurasi environment di app

```bash
cp .env.example .env
```

Isi `.env` dengan nilai dari Firebase Web App config:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

> **Penting:** Prefix `EXPO_PUBLIC_` wajib agar Expo bisa membaca variabel di runtime.

## 6. Struktur data Firestore

```
users/{userId}                    → profile user
users/{userId}/categories/{id}    → kategori
users/{userId}/transactions/{id}  → transaksi
users/{userId}/budgets/{id}       → budget bulanan
users/{userId}/recurring_transactions/{id} → transaksi berulang
```

## 7. Testing di emulator (opsional)

```bash
firebase emulators:start --only auth,firestore
```

Set di `src/infrastructure/firebase/config.ts` jika ingin connect ke emulator saat development.

## 8. Checklist sebelum Phase 1b (Auth)

- [ ] Email/Password auth aktif
- [ ] Firestore database dibuat
- [ ] Security rules deployed
- [ ] `.env` terisi dan tidak di-commit ke git
- [ ] `npm start` berjalan tanpa error

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `Firebase is not configured` | Pastikan `.env` ada dan restart Metro (`npx expo start -c`) |
| `auth/invalid-api-key` | Cek `EXPO_PUBLIC_FIREBASE_API_KEY` |
| Permission denied di Firestore | Deploy rules (`firebase deploy --only firestore:rules`) — pastikan ada rule `recurring_transactions` setelah Phase 5 |
| Index required | Deploy `firestore.indexes.json` atau buat index dari link error di console |
| Login gagal di Vercel | Tambah domain `*.vercel.app` di Authentication → **Authorized domains** |

## 9. Authorized domains (deploy Vercel)

Setelah deploy ke Vercel, tambahkan URL production di:

**Firebase Console → Authentication → Settings → Authorized domains**

Contoh: `money-tracker-abc123.vercel.app`

Tanpa ini, auth akan error `auth/unauthorized-domain` di live demo.
