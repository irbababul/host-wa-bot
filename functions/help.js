const { FILE_LIMITS, RATE_LIMITS } = require('../config/limits');

function getHelpMessage() {
  return `
🤖 *Selamat datang di Bot Salas!*

Halo! Saya adalah bot milik Salas yang siap membantu Anda dengan berbagai fitur menarik! 🎉

━━━━━━━━━━━━━━━━━━
📄 *KONVERSI FILE*
━━━━━━━━━━━━━━━━━━

📝 *.wordtopdf*
   Kirim file Word (.doc/.docx), bot akan mengubahnya ke PDF
   Max: ${FILE_LIMITS.DOCUMENT.MAX_SIZE_TEXT}

📃 *.pdftoword*
   Kirim file PDF, bot akan mengubahnya ke Word (.docx)
   Max: ${FILE_LIMITS.DOCUMENT.MAX_SIZE_TEXT}

🖼️ *.fototopdf*
   Kirim foto, bot akan mengubahnya ke PDF
   Max: ${FILE_LIMITS.PHOTO.MAX_SIZE_TEXT}

━━━━━━━━━━━━━━━━━━
🎨 *PHOTO TOOLS*
━━━━━━━━━━━━━━━━━━

🌟 *.s*
   Kirim foto dengan caption .s untuk membuat stiker WhatsApp
   Max: ${FILE_LIMITS.PHOTO.MAX_SIZE_TEXT}

🧍 *.rembg*
   Kirim foto untuk menghapus background (jadi transparan)
   Max: ${FILE_LIMITS.PHOTO.MAX_SIZE_TEXT}

🎨 *.bg <warna>*
   Ganti background foto ke warna tertentu
   Contoh: .bg merah | .bg biru | .bg hijau | .bg putih | .bg hitam
   
🌫️ *.bg blur*
   Ganti background foto jadi blur

━━━━━━━━━━━━━━━━━━
📹 *DOWNLOADER*
━━━━━━━━━━━━━━━━━━

⬇️ *.download <link>*
   Download video/audio dari YouTube, TikTok, atau Instagram
   Contoh: .download https://youtu.be/xxxxx
   Max: ${FILE_LIMITS.VIDEO.MAX_SIZE_TEXT}

━━━━━━━━━━━━━━━━━━
📝 *TO-DO LIST*
━━━━━━━━━━━━━━━━━━

➕ *.todo add <tugas>*
   Tambah tugas baru
   Contoh: .todo add Beli bahan makanan

📋 *.todo list*
   Lihat semua tugas Anda

✅ *.todo done <id>*
   Tandai tugas selesai
   Contoh: .todo done 1

🗑️ *.todo delete <id>*
   Hapus tugas
   Contoh: .todo delete 2

🔴 *.todo priority <id> <tingkat>*
   Set prioritas: tinggi / sedang / rendah
   Contoh: .todo priority 1 tinggi

📅 *.todo deadline <id> <tanggal>*
   Tambah deadline
   Contoh: .todo deadline 1 25/10/2025

📊 *.todo summary*
   Lihat ringkasan tugas hari ini

🧹 *.todo clear*
   Hapus semua tugas yang sudah selesai

━━━━━━━━━━━━━━━━━━
⚙️ *INFORMASI*
━━━━━━━━━━━━━━━━━━

📦 *Batas Ukuran File:*
   • Dokumen: Max ${FILE_LIMITS.DOCUMENT.MAX_SIZE_TEXT}
   • Foto: Max ${FILE_LIMITS.PHOTO.MAX_SIZE_TEXT}
   • Video: Max ${FILE_LIMITS.VIDEO.MAX_SIZE_TEXT}

⏱️ *Rate Limit:*
   • Konversi: ${RATE_LIMITS.CONVERSIONS_PER_HOUR}x per jam
   • Download: ${RATE_LIMITS.DOWNLOADS_PER_HOUR}x per jam

━━━━━━━━━━━━━━━━━━

💡 *Tips:*
• File >3MB akan otomatis dikompress
• Semua hasil langsung dikirim ke Anda
• Bot aktif 24/7, siap melayani!

Terima kasih telah menggunakan *Bot Salas*! 🚀
  `.trim();
}

module.exports = {
  getHelpMessage
};
