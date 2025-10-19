const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const axios = require('axios');
const FormData = require('form-data');
const filesize = require('filesize');
const { getUniqueFilename, downloadsDir, deleteFile } = require('../utils/fileManager');
const { sendFileWithRetry, sendStickerWithRetry } = require('./fileSender');

async function makeSticker(msg, media) {
  let photoPath = null;
  let stickerPath = null;

  try {
    await msg.reply('⏳ Membuat stiker...');

    const buffer = Buffer.from(media.data, 'base64');
    photoPath = path.join(downloadsDir, getUniqueFilename('photo.jpg'));
    fs.writeFileSync(photoPath, buffer);

    const stickerBuffer = await sharp(photoPath)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp()
      .toBuffer();

    stickerPath = path.join(downloadsDir, getUniqueFilename('sticker.webp'));
    fs.writeFileSync(stickerPath, stickerBuffer);

    await msg.reply('✅ Stiker siap digunakan!');
    
    const result_send = await sendStickerWithRetry(msg, stickerPath);

    if (result_send.success) {
      deleteFile(photoPath);
      deleteFile(stickerPath);
    }

  } catch (err) {
    console.error('Error making sticker:', err);
    await msg.reply('❌ Gagal membuat stiker.\n💡 Pastikan foto yang Anda kirim valid dan tidak terlalu besar.');
  } finally {
    if (photoPath) deleteFile(photoPath);
    if (stickerPath) deleteFile(stickerPath);
  }
}

async function removeBackground(msg, media) {
  let photoPath = null;
  let resultPath = null;

  try {
    await msg.reply('⏳ Menghapus background foto...\n💡 Proses ini membutuhkan waktu beberapa detik.');

    const buffer = Buffer.from(media.data, 'base64');
    photoPath = path.join(downloadsDir, getUniqueFilename('photo.jpg'));
    fs.writeFileSync(photoPath, buffer);

    const removeBgApiKey = process.env.REMOVEBG_API_KEY;

    if (removeBgApiKey) {
      const formData = new FormData();
      formData.append('size', 'preview');
      formData.append('image_file', fs.createReadStream(photoPath));

      const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
        headers: {
          ...formData.getHeaders(),
          'X-Api-Key': removeBgApiKey
        },
        responseType: 'arraybuffer'
      });

      resultPath = path.join(downloadsDir, getUniqueFilename('no-bg.png'));
      fs.writeFileSync(resultPath, response.data);

    } else {
      const image = sharp(photoPath);
      const metadata = await image.metadata();
      
      const processedBuffer = await image
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer();

      resultPath = path.join(downloadsDir, getUniqueFilename('no-bg.png'));
      fs.writeFileSync(resultPath, processedBuffer);

      await msg.reply('ℹ️ *Remove background sederhana diterapkan.*\n\n💡 Untuk hasil yang lebih baik, Anda bisa menambahkan REMOVEBG_API_KEY.');
    }

    const stats = fs.statSync(resultPath);
    const caption = `✅ *Background berhasil dihapus!*\n\n📁 ${path.basename(resultPath)}\n📦 Ukuran: ${filesize(stats.size)}`;

    const result_send = await sendFileWithRetry(msg, resultPath, caption);

    if (result_send.success) {
      deleteFile(photoPath);
      deleteFile(resultPath);
    }

  } catch (err) {
    console.error('Error removing background:', err);
    if (err.response && err.response.status === 403) {
      await msg.reply('❌ API Key remove.bg tidak valid atau sudah habis quota.\n💡 Tambahkan REMOVEBG_API_KEY yang valid di environment variables.');
    } else {
      await msg.reply('❌ Gagal menghapus background.\n💡 Coba lagi dengan foto yang lebih jelas.');
    }
  } finally {
    if (photoPath) deleteFile(photoPath);
    if (resultPath) deleteFile(resultPath);
  }
}

async function changeBackground(msg, media, color) {
  let photoPath = null;
  let resultPath = null;

  try {
    await msg.reply(`⏳ Mengganti background foto ke ${color}...`);

    const buffer = Buffer.from(media.data, 'base64');
    photoPath = path.join(downloadsDir, getUniqueFilename('photo.jpg'));
    fs.writeFileSync(photoPath, buffer);

    const colorMap = {
      'merah': { r: 255, g: 0, b: 0 },
      'biru': { r: 0, g: 0, b: 255 },
      'hijau': { r: 0, g: 128, b: 0 },
      'putih': { r: 255, g: 255, b: 255 },
      'hitam': { r: 0, g: 0, b: 0 },
      'kuning': { r: 255, g: 255, b: 0 }
    };

    let bgColor = colorMap[color.toLowerCase()] || { r: 255, g: 255, b: 255 };

    if (color.toLowerCase() === 'blur') {
      const image = sharp(photoPath);
      const blurredBuffer = await image.blur(10).toBuffer();
      
      resultPath = path.join(downloadsDir, getUniqueFilename('blurred.jpg'));
      fs.writeFileSync(resultPath, blurredBuffer);

    } else {
      const image = sharp(photoPath);
      const metadata = await image.metadata();
      
      const background = await sharp({
        create: {
          width: metadata.width,
          height: metadata.height,
          channels: 3,
          background: bgColor
        }
      }).jpeg().toBuffer();

      const composite = await sharp(background)
        .composite([{ input: photoPath, blend: 'over' }])
        .jpeg({ quality: 90 })
        .toBuffer();

      resultPath = path.join(downloadsDir, getUniqueFilename('bg-changed.jpg'));
      fs.writeFileSync(resultPath, composite);
    }

    const stats = fs.statSync(resultPath);
    const caption = `✅ *Background berhasil diubah ke ${color}!*\n\n📁 ${path.basename(resultPath)}\n📦 Ukuran: ${filesize(stats.size)}`;

    const result_send = await sendFileWithRetry(msg, resultPath, caption);

    if (result_send.success) {
      deleteFile(photoPath);
      deleteFile(resultPath);
    }

  } catch (err) {
    console.error('Error changing background:', err);
    await msg.reply('❌ Gagal mengubah background.\n💡 Pastikan foto valid dan ukuran tidak terlalu besar.');
  } finally {
    if (photoPath) deleteFile(photoPath);
    if (resultPath) deleteFile(resultPath);
  }
}

module.exports = {
  makeSticker,
  removeBackground,
  changeBackground
};
