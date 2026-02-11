const axios = require('axios');
const { exec } = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sellzivpn.db');
async function trialssh(username, password, exp, iplimit, serverId) {
  console.log(`Creating SSH account for ${username} with expiry ${exp} days, IP limit ${iplimit}, and password ${password}`);

// Validasi username
if (!/^[a-zA-Z0-9-]+$/.test(username)) {
  return '❌ Username tidak valid. Gunakan huruf (A–Z / a–z), angka, dan tanda strip (-) tanpa spasi.';
}

  return new Promise((resolve) => {
    db.get('SELECT * FROM Server WHERE id = ?', [serverId], (err, server) => {
      if (err || !server) {
        console.error('❌ Error fetching server:', err?.message || 'server null');
        return resolve('❌ Server tidak ditemukan. Silakan coba lagi.');
      }

    const domain = server.domain;
    const AUTH_TOKEN = server.auth;

    // Endpoint trial
    const curlCommand = `curl "http://${domain}:5888/trial/zivpn?exp=${exp}&auth=${AUTH_TOKEN}"`;

    exec(curlCommand, (_, stdout) => {
      let d;
      try {
        d = JSON.parse(stdout);
        console.log("⚠️ FULL DATA:", JSON.stringify(d, null, 2));
      } catch (e) {
        console.error('❌ Gagal parsing JSON:', e.message);
        console.error('🪵 Output:', stdout);
        return resolve('❌ Format respon dari server tidak valid.');
      }

      if (d.status !== "success") {
        console.error('❌ Respons error:', d);
        return resolve(`❌ ${d.message}`);
      }

      // UPDATE total create akun (opsional)
      if (exp >= 1 && exp <= 135) {
        db.run(
          'UPDATE Server SET total_create_akun = total_create_akun + 1 WHERE id = ?',
          [serverId]
        );
      }

      // Pesan untuk Telegram / Bot
      const msg = `${d.message}

📘 *TUTORIAL PASANG ZIVPN* 📲✨
🔗 https://t.me/ARSIPKACER

📥 *APK ZIVPN* 🚀
🔗 https://play.google.com/store/apps/details?id=com.zi.zivpn

🔐 *APK CMFA* 🛡️
🔗 https://t.me/ARSIPKACER/3

Selamat mencoba! 🎉     
`;

        return resolve(msg);
      });
    });
  });
}

module.exports = { trialssh }; 




