const fs = require('fs');
const path = require('path');
const axios = require('axios');
const filesize = require('filesize');
const { getUniqueFilename, downloadsDir, deleteFile } = require('../utils/fileManager');
const { sendFileWithRetry } = require('./fileSender');

function extractVideoId(url) {
  const patterns = {
    youtube: [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ],
    tiktok: [
      /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
      /vm\.tiktok\.com\/([a-zA-Z0-9]+)/
    ],
    instagram: [
      /instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/
    ]
  };

  for (const [platform, patternList] of Object.entries(patterns)) {
    for (const pattern of patternList) {
      const match = url.match(pattern);
      if (match) {
        return { platform, id: match[1] };
      }
    }
  }

  return null;
}

async function downloadYouTube(msg, url) {
  let videoPath = null;

  try {
    await msg.reply('⏳ Mengunduh dari YouTube...\n💡 Proses ini membutuhkan waktu tergantung ukuran video.');

    try {
      const response = await axios.get(`https://api.saveservices.net/api/v1/youtube/info`, {
        params: { url: url },
        timeout: 30000
      });

      if (response.data && response.data.data && response.data.data.url) {
        const downloadUrl = response.data.data.url;
        const title = response.data.data.title || 'youtube_video';
        
        const videoResponse = await axios.get(downloadUrl, {
          responseType: 'arraybuffer',
          maxContentLength: 50 * 1024 * 1024,
          timeout: 120000
        });

        const videoBuffer = Buffer.from(videoResponse.data);
        const videoSize = videoBuffer.length;

        if (videoSize > 50 * 1024 * 1024) {
          await msg.reply(`❌ Video terlalu besar (${filesize(videoSize)})!\n✅ Maksimal: 50MB\n\n💡 Gunakan website downloader untuk video besar.`);
          return;
        }

        videoPath = path.join(downloadsDir, getUniqueFilename(`${title.substring(0, 30)}.mp4`));
        fs.writeFileSync(videoPath, videoBuffer);

        const caption = `✅ *Download YouTube Selesai!*\n\n🎬 ${title}\n📦 Ukuran: ${filesize(videoSize)}`;
        const result_send = await sendFileWithRetry(msg, videoPath, caption);

        if (result_send.success) {
          deleteFile(videoPath);
        }
      } else {
        throw new Error('API tidak mengembalikan URL download');
      }

    } catch (apiErr) {
      console.error('Error dengan API downloader:', apiErr.message);
      await msg.reply(`ℹ️ *Download YouTube memerlukan API eksternal.*\n\n💡 API downloader gratis sering tidak stabil. Untuk production yang reliable:\n\n• Tambahkan API key dari service downloader berbayar\n• Atau gunakan library ytdl-core dengan proper configuration\n• Atau gunakan website downloader online\n\n📝 Link Anda: ${url}`);
    }

  } catch (err) {
    console.error('Error downloading YouTube:', err);
    await msg.reply('❌ Gagal mengunduh dari YouTube.\n💡 Pastikan link valid dan coba lagi.');
  } finally {
    if (videoPath) deleteFile(videoPath);
  }
}

async function downloadTikTok(msg, url) {
  let videoPath = null;

  try {
    await msg.reply('⏳ Mengunduh dari TikTok...\n💡 Proses ini membutuhkan waktu beberapa detik.');

    try {
      const response = await axios.get(`https://api.tiklydown.eu.org/api/download`, {
        params: { url: url },
        timeout: 30000
      });

      if (response.data && response.data.video && response.data.video.noWatermark) {
        const downloadUrl = response.data.video.noWatermark;
        const title = response.data.title || 'tiktok_video';
        
        const videoResponse = await axios.get(downloadUrl, {
          responseType: 'arraybuffer',
          maxContentLength: 50 * 1024 * 1024,
          timeout: 120000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });

        const videoBuffer = Buffer.from(videoResponse.data);
        const videoSize = videoBuffer.length;

        if (videoSize > 50 * 1024 * 1024) {
          await msg.reply(`❌ Video terlalu besar (${filesize(videoSize)})!\n✅ Maksimal: 50MB`);
          return;
        }

        videoPath = path.join(downloadsDir, getUniqueFilename('tiktok.mp4'));
        fs.writeFileSync(videoPath, videoBuffer);

        const caption = `✅ *Download TikTok Selesai!*\n\n🎬 ${title.substring(0, 50)}\n📦 Ukuran: ${filesize(videoSize)}`;
        const result_send = await sendFileWithRetry(msg, videoPath, caption);

        if (result_send.success) {
          deleteFile(videoPath);
        }
      } else {
        throw new Error('API tidak mengembalikan video');
      }

    } catch (apiErr) {
      console.error('Error dengan API TikTok:', apiErr.message);
      await msg.reply(`ℹ️ *Download TikTok memerlukan API eksternal.*\n\n💡 API downloader gratis sering tidak stabil. Untuk hasil yang lebih baik:\n\n• Gunakan API downloader berbayar yang reliable\n• Atau gunakan website downloader TikTok\n\n📝 Link Anda: ${url}`);
    }

  } catch (err) {
    console.error('Error downloading TikTok:', err);
    await msg.reply('❌ Gagal mengunduh dari TikTok.\n💡 Pastikan link valid dan coba lagi.');
  } finally {
    if (videoPath) deleteFile(videoPath);
  }
}

async function downloadInstagram(msg, url) {
  let mediaPath = null;

  try {
    await msg.reply('⏳ Mengunduh dari Instagram...\n💡 Proses ini membutuhkan waktu beberapa detik.');

    try {
      const response = await axios.post(`https://v3.saveig.app/api/ajaxSearch`, 
        new URLSearchParams({
          q: url,
          t: 'media',
          lang: 'en'
        }), 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0'
          },
          timeout: 30000
        }
      );

      if (response.data && response.data.data) {
        const htmlData = response.data.data;
        const urlMatch = htmlData.match(/href="([^"]+)"/);
        
        if (urlMatch && urlMatch[1]) {
          const downloadUrl = urlMatch[1];
          
          const mediaResponse = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            maxContentLength: 50 * 1024 * 1024,
            timeout: 120000,
            headers: {
              'User-Agent': 'Mozilla/5.0'
            }
          });

          const mediaBuffer = Buffer.from(mediaResponse.data);
          const mediaSize = mediaBuffer.length;

          if (mediaSize > 50 * 1024 * 1024) {
            await msg.reply(`❌ Media terlalu besar (${filesize(mediaSize)})!\n✅ Maksimal: 50MB`);
            return;
          }

          const ext = downloadUrl.includes('.jpg') || downloadUrl.includes('.png') ? '.jpg' : '.mp4';
          mediaPath = path.join(downloadsDir, getUniqueFilename(`instagram${ext}`));
          fs.writeFileSync(mediaPath, mediaBuffer);

          const caption = `✅ *Download Instagram Selesai!*\n\n📦 Ukuran: ${filesize(mediaSize)}`;
          const result_send = await sendFileWithRetry(msg, mediaPath, caption);

          if (result_send.success) {
            deleteFile(mediaPath);
          }
        } else {
          throw new Error('Tidak dapat menemukan URL download');
        }
      } else {
        throw new Error('API tidak mengembalikan data');
      }

    } catch (apiErr) {
      console.error('Error dengan API Instagram:', apiErr.message);
      await msg.reply(`ℹ️ *Download Instagram memerlukan API eksternal.*\n\n💡 API downloader gratis sering tidak stabil karena Instagram selalu update proteksi. Untuk hasil terbaik:\n\n• Gunakan API Instagram resmi\n• Atau gunakan website downloader Instagram\n\n📝 Link Anda: ${url}`);
    }

  } catch (err) {
    console.error('Error downloading Instagram:', err);
    await msg.reply('❌ Gagal mengunduh dari Instagram.\n💡 Pastikan link valid dan coba lagi.');
  } finally {
    if (mediaPath) deleteFile(mediaPath);
  }
}

async function downloadMedia(msg, url) {
  try {
    const extracted = extractVideoId(url);

    if (!extracted) {
      await msg.reply('❌ Link tidak dikenali.\n\n✅ Link yang didukung:\n• YouTube (youtube.com / youtu.be)\n• TikTok (tiktok.com / vm.tiktok.com)\n• Instagram (instagram.com/p/ atau /reel/)');
      return;
    }

    const { platform } = extracted;

    switch (platform) {
      case 'youtube':
        await downloadYouTube(msg, url);
        break;
      case 'tiktok':
        await downloadTikTok(msg, url);
        break;
      case 'instagram':
        await downloadInstagram(msg, url);
        break;
      default:
        await msg.reply('❌ Platform tidak didukung.');
    }

  } catch (err) {
    console.error('Error downloading media:', err);
    await msg.reply('❌ Terjadi kesalahan saat mengunduh media.\n💡 Silakan coba lagi atau periksa link Anda.');
  }
}

module.exports = {
  downloadMedia
};
