module.exports = {
  FILE_LIMITS: {
    DOCUMENT: {
      MAX_SIZE: 10 * 1024 * 1024,
      WARNING_SIZE: 5 * 1024 * 1024,
      MAX_SIZE_TEXT: '10MB',
      WARNING_SIZE_TEXT: '5MB',
      FORMATS: ['.doc', '.docx', '.pdf']
    },
    PHOTO: {
      MAX_SIZE: 5 * 1024 * 1024,
      AUTO_COMPRESS_SIZE: 3 * 1024 * 1024,
      MAX_SIZE_TEXT: '5MB',
      AUTO_COMPRESS_TEXT: '3MB',
      FORMATS: ['.jpg', '.jpeg', '.png', '.webp']
    },
    VIDEO: {
      MAX_SIZE: 50 * 1024 * 1024,
      WARNING_SIZE: 25 * 1024 * 1024,
      MAX_SIZE_TEXT: '50MB',
      WARNING_SIZE_TEXT: '25MB',
      FORMATS: ['.mp4', '.avi', '.mov', '.mkv']
    },
    WHATSAPP_LIMITS: {
      DOCUMENT_MAX: 64 * 1024 * 1024,
      MEDIA_MAX: 16 * 1024 * 1024,
      DOCUMENT_MAX_TEXT: '64MB',
      MEDIA_MAX_TEXT: '16MB'
    }
  },

  RATE_LIMITS: {
    CONVERSIONS_PER_HOUR: 20,
    DOWNLOADS_PER_HOUR: 10,
    MESSAGES_PER_MINUTE: 30
  },

  AUTO_CLEANUP: {
    INTERVAL_MINUTES: 60,
    MAX_FILE_AGE_MINUTES: 120
  },

  COMPRESSION: {
    PHOTO_MAX_WIDTH: 1920,
    PHOTO_MAX_HEIGHT: 1920,
    PHOTO_QUALITY: 85,
    PDF_QUALITY: 'medium'
  }
};
