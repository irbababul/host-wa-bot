const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const filesize = require('filesize');
const path = require('path');

async function sendFileWithRetry(msg, filePath, caption = '', retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('File tidak ditemukan');
      }

      const stats = fs.statSync(filePath);
      const fileName = path.basename(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      const media = MessageMedia.fromFilePath(filePath);
      
      const fullCaption = caption || `✅ File siap!\n📁 ${fileName}\n📦 Ukuran: ${filesize(stats.size)}`;

      await msg.reply(media, undefined, { caption: fullCaption });
      
      console.log(`✅ File terkirim: ${fileName} (${filesize(stats.size)})`);
      return { success: true };

    } catch (err) {
      console.error(`❌ Gagal mengirim file (percobaan ${attempt}/${retries}):`, err.message);
      
      if (attempt < retries) {
        await msg.reply(`⚠️ Pengiriman gagal, mencoba lagi... (${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      } else {
        await msg.reply('❌ Gagal mengirim file setelah beberapa percobaan.\n💡 Coba kirim perintah lagi atau file mungkin terlalu besar.');
        return { success: false, error: err.message };
      }
    }
  }
}

async function sendStickerWithRetry(msg, filePath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('File tidak ditemukan');
      }

      const media = MessageMedia.fromFilePath(filePath);
      
      await msg.reply(media, undefined, { sendMediaAsSticker: true, stickerName: 'Bot Salas', stickerAuthor: 'Salas' });
      
      console.log(`✅ Stiker terkirim`);
      return { success: true };

    } catch (err) {
      console.error(`❌ Gagal mengirim stiker (percobaan ${attempt}/${retries}):`, err.message);
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      } else {
        await msg.reply('❌ Gagal mengirim stiker.\n💡 Pastikan foto yang Anda kirim valid dan tidak terlalu besar.');
        return { success: false, error: err.message };
      }
    }
  }
}

module.exports = {
  sendFileWithRetry,
  sendStickerWithRetry
};
