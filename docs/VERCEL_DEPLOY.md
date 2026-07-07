# Deploy ke Vercel (Live Demo)

Panduan singkat setelah repo sudah di GitHub: [EvosROAR/money-tracker](https://github.com/EvosROAR/money-tracker)

## 1. Import project

1. Buka [vercel.com](https://vercel.com) → login (pakai akun GitHub)
2. **Add New…** → **Project**
3. Import repo **money-tracker**
4. Vercel otomatis baca `vercel.json`:
   - Build: `npx expo export --platform web`
   - Output: `dist`

## 2. Environment variables

Di Vercel → **Settings** → **Environment Variables**, tambahkan (sama seperti `.env` lokal):

| Name | Value |
|------|-------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | dari Firebase Console |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | dari Firebase Console |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | dari Firebase Console |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | dari Firebase Console |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | dari Firebase Console |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | dari Firebase Console |

Centang **Production**, **Preview**, dan **Development**.

## 3. Deploy

Klik **Deploy**. Tunggu build selesai (~2–3 menit).

URL live contoh: `https://money-tracker-xxx.vercel.app`

## 4. Firebase — authorized domains (wajib)

Tanpa ini, login/register di production akan gagal.

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Tambahkan domain Vercel kamu, mis.:
   - `money-tracker-xxx.vercel.app`
   - `*.vercel.app` (tidak selalu didukung — tambahkan domain spesifik)

## 5. Update README (setelah deploy)

Ganti placeholder di README:

```markdown
**Live demo:** https://money-tracker-xxx.vercel.app
```

Lalu commit & push.

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Build gagal | Cek log Vercel; pastikan `npm run build:web` jalan lokal |
| `Firebase is not configured` | Env vars belum di-set di Vercel → redeploy |
| `auth/unauthorized-domain` | Tambah domain Vercel di Firebase Authorized domains |
| Halaman blank setelah refresh | `vercel.json` rewrites sudah ada — redeploy |

## Redeploy otomatis

Setiap `git push` ke `main`, Vercel otomatis build ulang (jika project terhubung ke GitHub).
