const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const sharp = require('sharp');
const filesize = require('filesize');
const { getUniqueFilename, downloadsDir, deleteFile } = require('../utils/fileManager');
const { sendFileWithRetry } = require('./fileSender');

async function wordToPdf(msg, media) {
  let tempWordPath = null;
  let pdfPath = null;

  try {
    await msg.reply('⏳ Memproses konversi Word ke PDF...');

    const buffer = Buffer.from(media.data, 'base64');
    tempWordPath = path.join(downloadsDir, getUniqueFilename('document.docx'));
    fs.writeFileSync(tempWordPath, buffer);

    const result = await mammoth.extractRawText({ path: tempWordPath });
    const text = result.value;

    if (!text || text.trim().length === 0) {
      await msg.reply('❌ File Word kosong atau tidak bisa dibaca.\n💡 Pastikan file Word Anda valid dan berisi teks.');
      return;
    }

    const pdfDoc = await PDFDocument.create();
    let currentPage = pdfDoc.addPage([595, 842]);
    let pageHeight = currentPage.getSize().height;
    const pageWidth = currentPage.getSize().width;
    
    const lines = text.split('\n');
    let yPosition = pageHeight - 50;
    const fontSize = 12;
    const lineHeight = 15;
    const maxWidth = pageWidth - 100;
    const charWidth = fontSize * 0.5;
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);

    function wrapText(text, maxLength) {
      if (text.length <= maxLength) return [text];
      
      const words = text.split(' ');
      const wrappedLines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxLength) {
          currentLine = testLine;
        } else {
          if (currentLine) wrappedLines.push(currentLine);
          currentLine = word;
        }
      }
      
      if (currentLine) wrappedLines.push(currentLine);
      return wrappedLines;
    }

    for (let line of lines) {
      const wrappedLines = wrapText(line.trim(), maxCharsPerLine);
      
      for (const wrappedLine of wrappedLines) {
        if (yPosition < 50) {
          currentPage = pdfDoc.addPage([595, 842]);
          pageHeight = currentPage.getSize().height;
          yPosition = pageHeight - 50;
        }
        
        if (wrappedLine.length > 0) {
          currentPage.drawText(wrappedLine, {
            x: 50,
            y: yPosition,
            size: fontSize
          });
        }
        
        yPosition -= lineHeight;
      }
    }

    const pdfBytes = await pdfDoc.save();
    pdfPath = path.join(downloadsDir, getUniqueFilename('converted.pdf'));
    fs.writeFileSync(pdfPath, pdfBytes);

    const stats = fs.statSync(pdfPath);
    const caption = `✅ *Konversi Word → PDF Selesai!*\n\n📁 ${path.basename(pdfPath)}\n📦 Ukuran: ${filesize(stats.size)}`;

    const result_send = await sendFileWithRetry(msg, pdfPath, caption);

    if (result_send.success) {
      deleteFile(tempWordPath);
      deleteFile(pdfPath);
    }

  } catch (err) {
    console.error('Error converting Word to PDF:', err);
    await msg.reply('❌ Gagal mengkonversi Word ke PDF.\n💡 Pastikan file Word Anda valid dan tidak corrupt.');
  } finally {
    if (tempWordPath) deleteFile(tempWordPath);
    if (pdfPath) deleteFile(pdfPath);
  }
}

async function pdfToWord(msg, media) {
  let pdfPath = null;
  let docxPath = null;

  try {
    await msg.reply('⏳ Memproses konversi PDF ke Word...');

    const buffer = Buffer.from(media.data, 'base64');
    pdfPath = path.join(downloadsDir, getUniqueFilename('document.pdf'));
    fs.writeFileSync(pdfPath, buffer);

    const data = await pdfParse(buffer);
    const extractedText = data.text;

    if (!extractedText || extractedText.trim().length === 0) {
      await msg.reply('❌ Tidak dapat mengekstrak teks dari PDF.\n💡 PDF mungkin berisi gambar saja atau ter-proteksi.');
      return;
    }

    const lines = extractedText.split('\n');
    const paragraphs = [];

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Dokumen PDF dikonversi oleh Bot Salas`,
            bold: true,
            size: 28
          })
        ],
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Jumlah halaman: ${data.numpages} | Karakter: ${extractedText.length}`,
            italics: true
          })
        ],
        spacing: { after: 400 }
      })
    );

    for (let line of lines) {
      if (line.trim().length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.trim()
              })
            ],
            spacing: { after: 100 }
          })
        );
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    });

    const docxBuffer = await Packer.toBuffer(doc);
    docxPath = path.join(downloadsDir, getUniqueFilename('converted.docx'));
    fs.writeFileSync(docxPath, docxBuffer);

    const stats = fs.statSync(docxPath);
    const caption = `✅ *Konversi PDF → Word Selesai!*\n\n📁 ${path.basename(docxPath)}\n📦 Ukuran: ${filesize(stats.size)}\n📄 ${data.numpages} halaman | ${extractedText.length} karakter`;

    const result_send = await sendFileWithRetry(msg, docxPath, caption);

    if (result_send.success) {
      deleteFile(pdfPath);
      deleteFile(docxPath);
    }

  } catch (err) {
    console.error('Error converting PDF to Word:', err);
    await msg.reply('❌ Gagal mengkonversi PDF ke Word.\n💡 Pastikan file PDF Anda valid dan tidak ter-proteksi.');
  } finally {
    if (pdfPath) deleteFile(pdfPath);
    if (docxPath) deleteFile(docxPath);
  }
}

async function photoToPdf(msg, media) {
  let photoPath = null;
  let pdfPath = null;

  try {
    await msg.reply('⏳ Mengkonversi foto ke PDF...');

    const buffer = Buffer.from(media.data, 'base64');
    photoPath = path.join(downloadsDir, getUniqueFilename('photo.jpg'));
    fs.writeFileSync(photoPath, buffer);

    const image = sharp(photoPath);
    const metadata = await image.metadata();
    
    let processedBuffer = buffer;
    if (metadata.width > 1920 || metadata.height > 1920) {
      processedBuffer = await image
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    const pdfDoc = await PDFDocument.create();
    const jpgImage = await pdfDoc.embedJpg(processedBuffer);
    
    const imgWidth = jpgImage.width;
    const imgHeight = jpgImage.height;
    const maxWidth = 500;
    const maxHeight = 700;
    
    let scale = 1;
    if (imgWidth > maxWidth || imgHeight > maxHeight) {
      scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
    }
    
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    
    const page = pdfDoc.addPage([scaledWidth + 100, scaledHeight + 100]);
    page.drawImage(jpgImage, {
      x: 50,
      y: 50,
      width: scaledWidth,
      height: scaledHeight
    });

    const pdfBytes = await pdfDoc.save();
    pdfPath = path.join(downloadsDir, getUniqueFilename('photo.pdf'));
    fs.writeFileSync(pdfPath, pdfBytes);

    const stats = fs.statSync(pdfPath);
    const caption = `✅ *Konversi Foto → PDF Selesai!*\n\n📁 ${path.basename(pdfPath)}\n📦 Ukuran: ${filesize(stats.size)}`;

    const result_send = await sendFileWithRetry(msg, pdfPath, caption);

    if (result_send.success) {
      deleteFile(photoPath);
      deleteFile(pdfPath);
    }

  } catch (err) {
    console.error('Error converting photo to PDF:', err);
    await msg.reply('❌ Gagal mengkonversi foto ke PDF.\n💡 Pastikan file yang Anda kirim adalah foto yang valid (JPG/PNG).');
  } finally {
    if (photoPath) deleteFile(photoPath);
    if (pdfPath) deleteFile(pdfPath);
  }
}

module.exports = {
  wordToPdf,
  pdfToWord,
  photoToPdf
};
