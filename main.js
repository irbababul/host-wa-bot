const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

require('./keep_alive');

const { getHelpMessage } = require('./functions/help');
const { validateFileSize, validateFileFormat, checkRateLimit } = require('./functions/validator');
//const { wordToPdf, pdfToWord, photoToPdf } = require('./functions/convert');
const { makeSticker, removeBackground, changeBackground } = require('./functions/photoTools');
const { downloadMedia } = require('./functions/downloader');
const { addTodo, listTodos, markDone, deleteTodo, setPriority, setDeadline, getSummary, clearCompleted } = require('./functions/todo');
const { startAutoCleanup, ensureDownloadsDir } = require('./utils/fileManager');

ensureDownloadsDir();

console.log('🚀 Bot Salas sedang diinisialisasi...\n');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  }
});

// HAPUS BLOK client.on('qr', ...) LAMA ANDA, DAN GANTI DENGAN INI:

client.on('qr', (qr) => {
  console.log('\n\n\n');
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log('!! JANGAN SCAN GAMBAR RUSAK, KITA PAKAI DATA MENTAH !!');
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  
  // Ini akan mencetak DATA string mentah dalam satu baris.
  // Ini adalah data yang HARUS ANDA COPY.
  console.log('START_QR_DATA:' + qr + ':END_QR_DATA');
  
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log('PETUNJUK PENTING (BACA INI):');
  console.log('1. Cari di log ini, baris yang ada tulisan "START_QR_DATA:..."');
  console.log('2. Copy HANYA teks yang ada di antara "START_QR_DATA:" dan ":END_QR_DATA"');
  console.log('   (Teksnya akan SANGAT PANJANG, dimulai dengan "2@...")');
  console.log('3. Buka browser dan pergi ke website: goqr.me');
  console.log('4. Paste teks yang Anda copy itu ke dalam kotak "TEXT".');
  console.log('5. Scan QR code yang muncul di website itu dengan HP Anda.');
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log('\n\n\n');
});

client.on('authenticated', () => {
  console.log('✅ WhatsApp berhasil terotentikasi!');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Autentikasi gagal:', msg);
  console.log('💡 Coba hapus folder .wwebjs_auth dan scan QR code lagi');
});

client.on('ready', () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 BOT SALAS SIAP BEROPERASI!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ WhatsApp Client is ready!');
  console.log('📱 Bot aktif dan siap menerima pesan');
  console.log('⏰ ' + new Date().toLocaleString());
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  startAutoCleanup();
});

client.on('disconnected', (reason) => {
  console.log('⚠️ WhatsApp disconnected:', reason);
  console.log('🔄 Bot akan restart otomatis...');
  setTimeout(() => {
    process.exit(1);
  }, 5000);
});

function logActivity(userId, action, details = '') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] User: ${userId} | Action: ${action} | ${details}\n`;
  fs.appendFileSync('logs.txt', logEntry);
}

client.on('message', async (msg) => {
  try {
    const userId = msg.from;
    const messageBody = msg.body.trim();
    const isCommand = messageBody.startsWith('.') || messageBody.startsWith('/');

    if (msg.fromMe) return;

    if (messageBody.toLowerCase() === '/help' || messageBody.toLowerCase() === '.help') {
      logActivity(userId, 'HELP');
      await msg.reply(getHelpMessage());
      return;
    }

    if (messageBody.startsWith('.todo')) {
      const args = messageBody.slice(5).trim().split(' ');
      const subCommand = args[0]?.toLowerCase();

      logActivity(userId, 'TODO', subCommand);

      switch (subCommand) {
        case 'add':
          const task = args.slice(1).join(' ');
          if (!task) {
            await msg.reply('❌ Format salah!\n\n✅ Gunakan: .todo add <tugas>\nContoh: .todo add Beli bahan makanan');
            return;
          }
          await addTodo(msg, task);
          break;

        case 'list':
          await listTodos(msg);
          break;

        case 'done':
          const doneId = args[1];
          if (!doneId) {
            await msg.reply('❌ Format salah!\n\n✅ Gunakan: .todo done <id>\nContoh: .todo done 1');
            return;
          }
          await markDone(msg, doneId);
          break;

        case 'delete':
          const deleteId = args[1];
          if (!deleteId) {
            await msg.reply('❌ Format salah!\n\n✅ Gunakan: .todo delete <id>\nContoh: .todo delete 2');
            return;
          }
          await deleteTodo(msg, deleteId);
          break;

        case 'priority':
          const prioId = args[1];
          const priority = args[2];
          if (!prioId || !priority) {
            await msg.reply('❌ Format salah!\n\n✅ Gunakan: .todo priority <id> <tingkat>\nContoh: .todo priority 1 tinggi');
            return;
          }
          await setPriority(msg, prioId, priority);
          break;

        case 'deadline':
          const deadlineId = args[1];
          const date = args[2];
          if (!deadlineId || !date) {
            await msg.reply('❌ Format salah!\n\n✅ Gunakan: .todo deadline <id> <tanggal>\nContoh: .todo deadline 1 25/10/2025');
            return;
          }
          await setDeadline(msg, deadlineId, date);
          break;

        case 'summary':
          await getSummary(msg);
          break;

        case 'clear':
          await clearCompleted(msg);
          break;

        default:
          await msg.reply('❌ Perintah todo tidak dikenali.\n\n✅ Gunakan /help untuk melihat daftar perintah todo.');
      }
      return;
    }

    if (messageBody.startsWith('.download')) {
      const url = messageBody.slice(9).trim();
      if (!url) {
        await msg.reply('❌ Format salah!\n\n✅ Gunakan: .download <link>\nContoh: .download https://youtu.be/xxxxx');
        return;
      }

      const rateLimitCheck = checkRateLimit(userId, 'download');
      if (!rateLimitCheck.allowed) {
        await msg.reply(rateLimitCheck.message);
        return;
      }

      logActivity(userId, 'DOWNLOAD', url);
      await downloadMedia(msg, url);
      return;
    }

    if (msg.hasMedia) {
      const media = await msg.downloadMedia();
      
      if (!media) {
        await msg.reply('❌ Gagal mengunduh media. Silakan coba lagi.');
        return;
      }

      const fileSize = Buffer.from(media.data, 'base64').length;

      if (messageBody.toLowerCase() === '.wordtopdf' || messageBody.toLowerCase() === '.pdftoword' || messageBody.toLowerCase() === '.fototopdf') {
        const rateLimitCheck = checkRateLimit(userId, 'conversion');
        if (!rateLimitCheck.allowed) {
          await msg.reply(rateLimitCheck.message);
          return;
        }
      }
/*
      if (messageBody.toLowerCase() === '.wordtopdf') {
        const sizeCheck = validateFileSize(fileSize, 'document');
        if (!sizeCheck.valid) {
          await msg.reply(sizeCheck.message);
          return;
        }

        if (sizeCheck.warning) {
          await msg.reply(sizeCheck.message);
        }

        logActivity(userId, 'WORD_TO_PDF', `${fileSize} bytes`);
        await wordToPdf(msg, media);
        return;
      }

      if (messageBody.toLowerCase() === '.pdftoword') {
        const sizeCheck = validateFileSize(fileSize, 'document');
        if (!sizeCheck.valid) {
          await msg.reply(sizeCheck.message);
          return;
        }

        if (sizeCheck.warning) {
          await msg.reply(sizeCheck.message);
        }

        logActivity(userId, 'PDF_TO_WORD', `${fileSize} bytes`);
        await pdfToWord(msg, media);
        return;
      }

      if (messageBody.toLowerCase() === '.fototopdf') {
        const sizeCheck = validateFileSize(fileSize, 'photo');
        if (!sizeCheck.valid) {
          await msg.reply(sizeCheck.message);
          return;
        }

        logActivity(userId, 'PHOTO_TO_PDF', `${fileSize} bytes`);
        await photoToPdf(msg, media);
        return;
      }
*/
      if (messageBody.toLowerCase() === '.s' || messageBody.toLowerCase() === '.stiker' || messageBody.toLowerCase() === '.sticker') {
        const sizeCheck = validateFileSize(fileSize, 'photo');
        if (!sizeCheck.valid) {
          await msg.reply(sizeCheck.message);
          return;
        }

        logActivity(userId, 'MAKE_STICKER', `${fileSize} bytes`);
        await makeSticker(msg, media);
        return;
      }

      if (messageBody.toLowerCase() === '.rembg') {
        const sizeCheck = validateFileSize(fileSize, 'photo');
        if (!sizeCheck.valid) {
          await msg.reply(sizeCheck.message);
          return;
        }

        logActivity(userId, 'REMOVE_BG', `${fileSize} bytes`);
        await removeBackground(msg, media);
        return;
      }

      if (messageBody.toLowerCase().startsWith('.bg ')) {
        const color = messageBody.slice(4).trim();
        
        const sizeCheck = validateFileSize(fileSize, 'photo');
        if (!sizeCheck.valid) {
          await msg.reply(sizeCheck.message);
          return;
        }

        logActivity(userId, 'CHANGE_BG', color);
        await changeBackground(msg, media, color);
        return;
      }
    }

    if (isCommand && !msg.hasMedia) {
      if (!messageBody.toLowerCase().startsWith('.todo') && 
          !messageBody.toLowerCase().startsWith('.download') &&
          messageBody !== '/help' && messageBody !== '.help') {
        await msg.reply('❌ Perintah tidak dikenali.\n\n💡 Ketik */help* untuk melihat daftar fitur dan cara penggunaan.');
      }
    }

    if (!isCommand && !msg.hasMedia) {
      const responses = [
        'Halo! Saya adalah Bot Salas. 🤖\n\nSaya siap membantu Anda dengan berbagai fitur menarik!\n\n✨ Ketik */help* untuk melihat semua yang bisa saya lakukan.',
        'Hi! 👋 Bot Salas di sini!\n\nAda yang bisa saya bantu?\n\n💡 Ketik */help* untuk lihat menu lengkap fitur saya.'
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      if (Math.random() < 0.3) {
        await msg.reply(randomResponse);
      }
    }

  } catch (err) {
    console.error('❌ Error saat memproses pesan:', err);
    logActivity(msg.from, 'ERROR', err.message);
    
    try {
      await msg.reply('❌ Terjadi kesalahan pada sistem Bot Salas.\n\n💡 Bot tetap aktif, silakan coba perintah lain atau kirim pesan lagi.');
    } catch (replyErr) {
      console.error('❌ Gagal mengirim pesan error:', replyErr);
    }
  }
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.log('🔄 Bot akan tetap berjalan...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('🔄 Bot akan tetap berjalan...');
});

console.log('⏳ Menginisialisasi WhatsApp Client...');
console.log('📱 Silakan scan QR code yang akan muncul\n');

client.initialize().catch(err => {
  console.error('❌ Gagal menginisialisasi client:', err);
  console.log('🔄 Mencoba restart...');
  setTimeout(() => {
    process.exit(1);
  }, 5000);
});
