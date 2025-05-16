const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const path = require('path');
const fs = require('fs');

// Đệ quy lấy tất cả file .jpg/.jpeg trong thư mục
function getAllJpegFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllJpegFiles(filePath, fileList);
    } else if (/\.(jpe?g)$/i.test(file)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const folders = [
  'client/public/assets',
  'client/src/assets',
];

async function convertAll() {
  for (const folder of folders) {
    if (!fs.existsSync(folder)) continue;
    const jpegFiles = getAllJpegFiles(folder);
    if (jpegFiles.length === 0) continue;
    for (const file of jpegFiles) {
      const outFile = file.replace(/\.(jpe?g)$/i, '.webp');
      if (fs.existsSync(outFile)) continue; // Không ghi đè nếu đã có WebP
      try {
        const data = fs.readFileSync(file);
        const result = await imagemin.buffer(data, {
          plugins: [imageminWebp({ quality: 80 })]
        });
        fs.writeFileSync(outFile, result);
        console.log('Created:', outFile);
      } catch (err) {
        console.error('Error converting', file, err);
      }
    }
  }
  console.log('Chuyển đổi ảnh JPEG/JPG sang WebP hoàn tất!');
}

convertAll(); 