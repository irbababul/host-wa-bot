const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { AUTO_CLEANUP } = require('../config/limits');

const downloadsDir = path.join(__dirname, '../downloads');

function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  File dihapus: ${path.basename(filePath)}`);
      return true;
    }
  } catch (err) {
    console.error(`❌ Gagal hapus file ${filePath}:`, err.message);
    return false;
  }
}

function cleanOldFiles() {
  try {
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
      return;
    }

    const files = fs.readdirSync(downloadsDir);
    const now = Date.now();
    const maxAge = AUTO_CLEANUP.MAX_FILE_AGE_MINUTES * 60 * 1000;
    let deletedCount = 0;

    files.forEach(file => {
      const filePath = path.join(downloadsDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        if (deleteFile(filePath)) {
          deletedCount++;
        }
      }
    });

    if (deletedCount > 0) {
      console.log(`✅ Auto-cleanup: ${deletedCount} file dihapus`);
    }
  } catch (err) {
    console.error('❌ Error saat cleanup:', err.message);
  }
}

function startAutoCleanup() {
  const schedule = `*/${AUTO_CLEANUP.INTERVAL_MINUTES} * * * *`;
  
  cron.schedule(schedule, () => {
    console.log(`🔄 Menjalankan auto-cleanup...`);
    cleanOldFiles();
  });

  console.log(`✅ Auto-cleanup dijadwalkan setiap ${AUTO_CLEANUP.INTERVAL_MINUTES} menit`);
}

function getUniqueFilename(originalName) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  return `${name}_${timestamp}_${random}${ext}`;
}

function ensureDownloadsDir() {
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
    console.log('📁 Folder downloads dibuat');
  }
}

module.exports = {
  deleteFile,
  cleanOldFiles,
  startAutoCleanup,
  getUniqueFilename,
  ensureDownloadsDir,
  downloadsDir
};
