const sharp = require('sharp');
const fs = require('fs');

const img1 = 'C:\\Users\\arire\\.gemini\\antigravity-ide\\brain\\de35a947-3c32-4bc0-a465-f0fa258f3a3a\\media__1788282027711.png';
const img2 = 'C:\\Users\\arire\\.gemini\\antigravity-ide\\brain\\de35a947-3c32-4bc0-a465-f0fa258f3a3a\\media__1788282022627.png';

async function checkAverageColor(file) {
  try {
    const stats = await sharp(file).stats();
    return `Channels mean: ${stats.channels.map(c => Math.round(c.mean)).join(', ')}`;
  } catch (e) {
    return e.message;
  }
}

(async () => {
  console.log('img1 (27711):', await checkAverageColor(img1));
  console.log('img2 (22627):', await checkAverageColor(img2));
})();
