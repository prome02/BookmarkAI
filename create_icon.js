const fs = require('fs');
const path = require('path');

console.log('Creating placeholder icons...');

// 确保images目录存在
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// 创建简单的SVG图标
function createIconSVG(size) {
  // 简单的蓝色书签图标，带有AI标志
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size/10}" fill="#3498db"/>
  <path d="M${size*0.25} ${size*0.15} L${size*0.25} ${size*0.85} L${size*0.5} ${size*0.7} L${size*0.75} ${size*0.85} L${size*0.75} ${size*0.15} Z" fill="white"/>
  <text x="${size*0.5}" y="${size*0.5}" font-family="Arial" font-size="${size*0.3}" text-anchor="middle" fill="white">AI</text>
</svg>`;
}

// 创建不同尺寸的图标
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const iconPath = path.join(imagesDir, `icon${size}.svg`);
  fs.writeFileSync(iconPath, createIconSVG(size));
  console.log(`Created icon: ${iconPath}`);
});

console.log('Icon creation complete!');
