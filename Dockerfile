# Gunakan base image Node.js versi 18
FROM node:18-bullseye

# Install semua dependencies yang dibutuhkan oleh Puppeteer (VERSI DIPERBAIKI)
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libgbm1 \
    libxss1 \
    libasound2 \
    libglib2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    lsb-release \
    xdg-utils \
    wget \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tentukan folder kerja di dalam server
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install node modules
RUN npm install

# Salin sisa kode proyek Anda
COPY . .

# Perintah untuk menjalankan bot Anda
CMD ["node", "main.js"]