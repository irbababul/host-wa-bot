# 🤖 Bot Salas - WhatsApp Multi-Feature Bot

Bot WhatsApp otomatis dengan berbagai fitur lengkap untuk konversi file, photo tools, downloader media, dan to-do list.

## ✨ Fitur Utama

### 📄 Konversi File
- **Word → PDF**: Konversi dokumen Word ke PDF
- **PDF → Word**: Konversi PDF ke dokumen Word
- **Foto → PDF**: Ubah foto menjadi file PDF

### 🎨 Photo Tools
- **Stiker**: Buat stiker WhatsApp dari foto
- **Remove Background**: Hapus background foto (transparan)
- **Change Background**: Ganti background ke warna tertentu (merah, biru, hijau, putih, hitam) atau blur

### 📹 Downloader
- Download video/audio dari YouTube
- Download video dari TikTok
- Download foto/video dari Instagram

### 📝 To-Do List
- Tambah, lihat, dan hapus tugas
- Set prioritas tugas (tinggi/sedang/rendah)
- Set deadline dengan reminder otomatis
- Ringkasan tugas harian
- Clear completed tasks

## 🚀 Quick Start

### Instalasi Dependencies

```bash
npm install
```

### Jalankan Bot

```bash
node main.js
```

Scan QR code yang muncul di terminal dengan WhatsApp Anda.

## 📦 Batas Ukuran File

- **Dokumen (Word/PDF)**: Max 10MB
- **Foto**: Max 5MB (auto-compress >3MB)
- **Video Download**: Max 50MB

## ⏱️ Rate Limiting

- Konversi: 20x per jam per user
- Download: 10x per jam per user

## 🌐 Deployment ke Railway

1. **Push ke GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Deploy di Railway**:
   - Buat akun di [Railway.app](https://railway.app)
   - Connect GitHub repository
   - Railway akan otomatis detect Node.js project
   - Bot akan otomatis deploy

3. **Environment Variables** (Optional):
   - `REMOVEBG_API_KEY`: Untuk fitur remove background yang lebih baik

## 📱 Cara Penggunaan

### Konversi File
```
.wordtopdf - Kirim file Word, bot kirim balik PDF
.pdftoword - Kirim file PDF, bot kirim balik Word
.fototopdf - Kirim foto, bot kirim balik PDF
```

### Photo Tools
```
.s - Buat stiker (kirim foto dengan caption .s)
.rembg - Remove background foto
.bg merah - Ganti background ke merah
.bg blur - Background blur
```

### Downloader
```
.download <link> - Download dari YouTube/TikTok/Instagram
```

### To-Do List
```
.todo add <tugas> - Tambah tugas baru
.todo list - Lihat semua tugas
.todo done <id> - Tandai selesai
.todo delete <id> - Hapus tugas
.todo priority <id> <tingkat> - Set prioritas
.todo deadline <id> <tanggal> - Set deadline
.todo summary - Ringkasan tugas
.todo clear - Hapus tugas selesai
```

### Help
```
/help - Lihat semua fitur dan cara pakai
```

## 🛡️ Error Handling

Bot dilengkapi dengan:
- ✅ Error handling lengkap di setiap fungsi
- ✅ Validasi ukuran file dengan pesan error detail
- ✅ Auto-retry untuk pengiriman file yang gagal
- ✅ Auto-reconnect saat koneksi WhatsApp terputus
- ✅ Logging aktivitas lengkap

## 🔧 Teknologi

- Node.js
- whatsapp-web.js
- Express.js
- pdf-lib
- sharp
- mammoth
- docx
- dan banyak lagi...

## 📝 File Structure

```
whatsapp-bot/
├── main.js                 # Entry point bot
├── keep_alive.js          # Keep-alive server
├── config/
│   └── limits.js          # Konfigurasi batas file
├── functions/
│   ├── convert.js         # Konversi file
│   ├── photoTools.js      # Photo tools
│   ├── downloader.js      # Media downloader
│   ├── todo.js            # To-do list
│   ├── help.js            # Menu bantuan
│   ├── validator.js       # Validasi file
│   └── fileSender.js      # Pengiriman file
├── utils/
│   └── fileManager.js     # File management
├── database/
│   ├── todos.json         # To-do database
│   └── rateLimit.json     # Rate limit tracking
├── downloads/             # Temporary files
└── logs.txt              # Activity logs
```

## 🎯 Fitur Keamanan

- ✅ File otomatis dihapus setelah terkirim
- ✅ Auto-cleanup file lama setiap 1 jam
- ✅ Rate limiting untuk mencegah spam
- ✅ Validasi ukuran dan format file
- ✅ Error tidak menyebabkan bot crash

## 📄 License

MIT

## 👨‍💻 Author

Bot Salas - Your Intelligent WhatsApp Assistant

---

**Selamat datang di Bot Salas!** 🚀
Halo, saya adalah bot milik Salas yang siap membantu Anda 24/7!
