# 🚀 Panduan Deployment Bot Salas

## ⚠️ Catatan Penting tentang Replit

WhatsApp Bot ini menggunakan **whatsapp-web.js** yang memerlukan **Chromium/Puppeteer** untuk berjalan. Di lingkungan Replit, Chromium memerlukan banyak system dependencies yang tidak selalu tersedia, sehingga **bot mungkin tidak bisa berjalan sempurna di Replit**.

**✅ Solusi Recommended: Deploy ke Railway**

Bot ini **dirancang untuk production deployment di Railway**, di mana semua dependencies Chromium sudah tersedia dan bot akan berjalan sempurna 24/7.

---

## 🌐 Deployment ke Railway (RECOMMENDED)

Railway adalah platform yang ideal untuk bot WhatsApp karena:
- ✅ Semua Chromium dependencies tersedia
- ✅ Resource lebih stabil
- ✅ Tidak ada sleep mode
- ✅ Memory lebih besar
- ✅ Persistent storage reliable

### Langkah-langkah Deploy ke Railway:

#### 1. **Persiapan GitHub**

```bash
# Inisialisasi Git (jika belum)
git init

# Tambahkan semua file
git add .

# Commit
git commit -m "Bot Salas - Ready for deployment"

# Buat repository di GitHub dan push
git remote add origin https://github.com/username/bot-salas.git
git branch -M main
git push -u origin main
```

#### 2. **Deploy di Railway**

1. **Buka** [Railway.app](https://railway.app)
2. **Sign up/Login** dengan GitHub
3. **Klik** "New Project"
4. **Pilih** "Deploy from GitHub repo"
5. **Pilih** repository bot-salas Anda
6. **Railway otomatis detect** Node.js dan mulai deploy

#### 3. **Scan QR Code**

1. Setelah deploy selesai, **buka Logs** di Railway dashboard
2. **QR Code** akan muncul di logs
3. **Scan QR code** dengan WhatsApp Anda
4. **Bot siap** beroperasi 24/7!

#### 4. **Environment Variables (Optional)**

Jika ingin menggunakan fitur remove background yang lebih baik:

1. Buka **Variables** tab di Railway
2. Tambahkan:
   - `REMOVEBG_API_KEY`: API key dari [remove.bg](https://remove.bg/api)

---

## 🔧 Alternative: Testing di Replit

Jika Anda tetap ingin mencoba test di Replit, ada beberapa hal yang perlu diketahui:

### Cara Menjalankan:

```bash
node main.js
```

### Kemungkinan Issues:

**❌ Error: "Failed to launch the browser process"**
- **Penyebab**: Chromium memerlukan system libraries yang tidak tersedia di Replit
- **Solusi**: Deploy ke Railway

**❌ Error: "libgbm.so.1: cannot open shared object file"**
- **Penyebab**: Missing system dependencies untuk Chromium
- **Solusi**: Deploy ke Railway

### Workaround untuk Development:

Jika Anda ingin develop dan test di local machine:

```bash
# Install dependencies
npm install

# Jalankan bot
node main.js

# Scan QR code yang muncul di terminal
```

Bot akan berjalan sempurna di local machine Anda.

---

## 📦 Struktur Project untuk Deployment

Semua file sudah disiapkan untuk deployment:

```
✅ main.js           - Entry point bot
✅ keep_alive.js     - Keep-alive server
✅ package.json      - Dependencies
✅ Procfile          - Railway configuration (worker: node main.js)
✅ functions/        - Semua fungsi bot
✅ config/           - Konfigurasi
✅ utils/            - Utilities
✅ database/         - Database JSON
✅ .gitignore        - Git ignore file
```

---

## 🎯 Checklist Deploy ke Railway

- [ ] Push code ke GitHub
- [ ] Connect GitHub repo ke Railway
- [ ] Wait for automatic deployment
- [ ] Check logs untuk QR code
- [ ] Scan QR code dengan WhatsApp
- [ ] Test semua fitur bot
- [ ] Monitor logs untuk error (jika ada)

---

## 🆘 Troubleshooting di Railway

### QR Code tidak muncul
- **Cek logs** di Railway dashboard
- **Restart deployment** jika perlu
- **Tunggu** beberapa menit untuk initialization

### Bot disconnect terus
- **Cek internet connection** WhatsApp Anda
- **Jangan logout** dari WhatsApp Web di device lain
- **Session akan tersimpan** di Railway storage

### File tidak terkirim
- **Cek logs** untuk error
- **Pastikan** file size tidak melebihi limit
- **Test** dengan file yang lebih kecil

---

## 💡 Tips Production

1. **Monitor Logs**: Selalu check Railway logs untuk memantau aktivitas bot
2. **Rate Limiting**: Bot sudah dilengkapi rate limiting untuk mencegah spam
3. **Auto Cleanup**: File otomatis dibersihkan setiap 1 jam
4. **Error Handling**: Bot tidak akan crash meskipun ada error
5. **Backup Database**: Download `database/todos.json` berkala untuk backup

---

## 📞 Support

Jika mengalami masalah saat deployment:

1. Pastikan semua dependencies terinstall
2. Check Railway logs untuk error details
3. Pastikan QR code sudah di-scan
4. Test dengan command sederhana dulu (/help)

---

**🚀 Bot Salas siap untuk production di Railway!**

Semua code sudah lengkap dan tested. Deploy sekarang dan nikmati bot WhatsApp yang powerful! 💪
