const https = require('https');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        fs.writeFileSync(dest, data);
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  try {
    await download('https://raw.githubusercontent.com/bradley/Blotter/master/build/blotter.min.js', path.join(publicDir, 'blotter.min.js'));
    await download('https://raw.githubusercontent.com/bradley/Blotter/master/build/materials/liquidDistortionMaterial.js', path.join(publicDir, 'liquidDistortionMaterial.js'));
    console.log('Downloaded Blotter files to public/');
  } catch (err) {
    console.error(err);
  }
}

run();
