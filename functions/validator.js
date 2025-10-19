const fs = require('fs');
const path = require('path');
const filesize = require('filesize');
const { FILE_LIMITS, RATE_LIMITS } = require('../config/limits');

const rateLimitPath = path.join(__dirname, '../database/rateLimit.json');

function getRateLimitData() {
  try {
    const data = fs.readFileSync(rateLimitPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function saveRateLimitData(data) {
  try {
    fs.writeFileSync(rateLimitPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving rate limit data:', err);
  }
}

function cleanOldEntries(userLimits) {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  if (userLimits.conversions) {
    userLimits.conversions = userLimits.conversions.filter(t => t > oneHourAgo);
  }
  if (userLimits.downloads) {
    userLimits.downloads = userLimits.downloads.filter(t => t > oneHourAgo);
  }
  return userLimits;
}

function checkRateLimit(userId, type) {
  const data = getRateLimitData();
  const userLimits = cleanOldEntries(data[userId] || { conversions: [], downloads: [] });
  
  let current, max, limitName;
  if (type === 'conversion') {
    current = userLimits.conversions.length;
    max = RATE_LIMITS.CONVERSIONS_PER_HOUR;
    limitName = 'konversi';
  } else if (type === 'download') {
    current = userLimits.downloads.length;
    max = RATE_LIMITS.DOWNLOADS_PER_HOUR;
    limitName = 'download';
  }

  if (current >= max) {
    const oldestTimestamp = type === 'conversion' ? userLimits.conversions[0] : userLimits.downloads[0];
    const waitTime = Math.ceil((oldestTimestamp + (60 * 60 * 1000) - Date.now()) / 60000);
    return {
      allowed: false,
      message: `⏸️ Anda sudah mencapai batas ${max} ${limitName}/jam.\n💡 Coba lagi dalam ${waitTime} menit.`
    };
  }

  if (type === 'conversion') {
    userLimits.conversions.push(Date.now());
  } else if (type === 'download') {
    userLimits.downloads.push(Date.now());
  }

  data[userId] = userLimits;
  saveRateLimitData(data);

  return { allowed: true };
}

function validateFileSize(fileSize, type) {
  let limit, limitText, warningSize, warningText;

  switch (type) {
    case 'document':
      limit = FILE_LIMITS.DOCUMENT.MAX_SIZE;
      limitText = FILE_LIMITS.DOCUMENT.MAX_SIZE_TEXT;
      warningSize = FILE_LIMITS.DOCUMENT.WARNING_SIZE;
      warningText = FILE_LIMITS.DOCUMENT.WARNING_SIZE_TEXT;
      break;
    case 'photo':
      limit = FILE_LIMITS.PHOTO.MAX_SIZE;
      limitText = FILE_LIMITS.PHOTO.MAX_SIZE_TEXT;
      warningSize = FILE_LIMITS.PHOTO.AUTO_COMPRESS_SIZE;
      warningText = FILE_LIMITS.PHOTO.AUTO_COMPRESS_TEXT;
      break;
    case 'video':
      limit = FILE_LIMITS.VIDEO.MAX_SIZE;
      limitText = FILE_LIMITS.VIDEO.MAX_SIZE_TEXT;
      warningSize = FILE_LIMITS.VIDEO.WARNING_SIZE;
      warningText = FILE_LIMITS.VIDEO.WARNING_SIZE_TEXT;
      break;
    default:
      return { valid: false, message: '❌ Tipe file tidak dikenali.' };
  }

  if (fileSize > limit) {
    return {
      valid: false,
      message: `❌ File terlalu besar!\n📦 Ukuran Anda: ${filesize(fileSize)}\n✅ Maksimal: ${limitText}\n\n💡 Tips: Compress file Anda terlebih dahulu atau kirim file yang lebih kecil.`
    };
  }

  if (fileSize > warningSize) {
    return {
      valid: true,
      warning: true,
      message: `⚠️ File cukup besar (${filesize(fileSize)}), proses mungkin memakan waktu lebih lama...`
    };
  }

  return { valid: true, warning: false };
}

function validateFileFormat(filename, type) {
  const ext = path.extname(filename).toLowerCase();
  let allowedFormats;

  switch (type) {
    case 'document':
      allowedFormats = FILE_LIMITS.DOCUMENT.FORMATS;
      break;
    case 'photo':
      allowedFormats = FILE_LIMITS.PHOTO.FORMATS;
      break;
    case 'video':
      allowedFormats = FILE_LIMITS.VIDEO.FORMATS;
      break;
    default:
      return { valid: false, message: '❌ Tipe file tidak dikenali.' };
  }

  if (!allowedFormats.includes(ext)) {
    return {
      valid: false,
      message: `❌ Format file tidak didukung!\n✅ Format yang didukung: ${allowedFormats.join(', ')}`
    };
  }

  return { valid: true };
}

module.exports = {
  checkRateLimit,
  validateFileSize,
  validateFileFormat
};
