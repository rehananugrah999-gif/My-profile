// tokenValidatorBot.js
import { Telegraf, Markup } from "telegraf";
import axios from "axios";
import settings from "./settings.js";

// ======================= CONFIGURATION =======================
const BOT_TOKEN = settings.ValidatorBot.token;
const OWNER_ID = settings.Superadmin;
const GITHUB_TOKEN = settings.Github.token;
const GITHUB_REPO = "Zarukabot/base-token";
const GITHUB_FILE_PATH = "token.json";
const GITHUB_BRANCH = "main";

// URLs
const RAW_URL = "https://raw.githubusercontent.com/Zarukabot/base-token/refs/heads/main/token.json";
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

// ======================= SELLER MANAGEMENT =======================
let sellers = settings.ValidatorBot.sellers || [];

function saveSellers() {
  settings.ValidatorBot.sellers = sellers;
}

// ======================= GITHUB FUNCTIONS =======================
async function getTokensFromGithub() {
  try {
    const response = await axios.get(RAW_URL);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching tokens from GitHub:', error.message);
    throw error;
  }
}

async function updateGithubTokens(newTokens) {
  try {
    const getCurrentFile = await axios.get(API_URL, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    const sha = getCurrentFile.data.sha;
    const content = Buffer.from(JSON.stringify(newTokens, null, 2)).toString('base64');
    
    await axios.put(API_URL, {
      message: `Update tokens - ${new Date().toISOString()}`,
      content: content,
      sha: sha,
      branch: GITHUB_BRANCH
    }, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    console.log('✅ GitHub updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating GitHub:', error.response?.data || error.message);
    throw error;
  }
}

// ======================= HELPER FUNCTIONS =======================
function sensorToken(token) {
  if (!token || token.length < 20) return token;
  const parts = token.split(':');
  if (parts.length !== 2) return token;
  
  const botId = parts[0];
  const tokenPart = parts[1];
  const visibleStart = tokenPart.substring(0, 6);
  const visibleEnd = tokenPart.substring(tokenPart.length - 4);
  const stars = '*'.repeat(Math.min(tokenPart.length - 10, 20));
  
  return `${botId}:${visibleStart}${stars}${visibleEnd}`;
}

function isOwner(userId) {
  return userId === OWNER_ID;
}

function isSeller(userId) {
  return sellers.includes(userId) || isOwner(userId);
}

// ======================= KEYBOARD FUNCTIONS =======================
function getStartKeyboard(userId) {
  const isOwnerUser = isOwner(userId);
  const isSellerUser = isSeller(userId);
  
  if (isOwnerUser) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('👑 Menu Owner', 'menu_owner')
      ],
      [
        Markup.button.callback('ℹ️ Tentang Bot', 'about_bot')
      ]
    ]);
  } else if (isSellerUser) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('💼 Menu Seller', 'menu_seller')
      ],
      [
        Markup.button.callback('ℹ️ Tentang Bot', 'about_bot')
      ]
    ]);
  } else {
    return Markup.inlineKeyboard([
      [Markup.button.callback('ℹ️ Tentang Bot', 'about_bot')]
    ]);
  }
}

// ======================= BOT INITIALIZATION =======================
const bot = new Telegraf(BOT_TOKEN);

bot.catch((err, ctx) => {
  console.error('❌ Error:', err);
});

// ======================= COMMANDS =======================

// /start
bot.start(async (ctx) => {
  const user = ctx.from;
  const isOwnerUser = isOwner(user.id);
  const isSellerUser = isSeller(user.id);
  
  let role = "👤 User";
  let roleEmoji = "👤";
  if (isOwnerUser) {
    role = "👑 Owner";
    roleEmoji = "👑";
  } else if (isSellerUser) {
    role = "💼 Seller";
    roleEmoji = "💼";
  }
  
  let tokens = [];
  try {
    tokens = await getTokensFromGithub();
  } catch (e) {
    tokens = [];
  }
  
  const welcomeText = `
╔═══════════════════════════╗
║   🔐 <b>TOKEN VALIDATOR BOT</b>   ║
╚═══════════════════════════╝

👋 Selamat datang, <b>${user.first_name}</b>!

<blockquote><b>📌 INFORMASI PENGGUNA</b>

${roleEmoji} <b>Role:</b> ${role}
🆔 <b>User ID:</b> <code>${user.id}</code>${user.username ? `\n👤 <b>Username:</b> @${user.username}` : ''}</blockquote>

<blockquote><b>📊 STATISTIK SISTEM</b>

🔑 <b>Total Token:</b> ${tokens.length}
👥 <b>Total Seller:</b> ${sellers.length}
💾 <b>Storage:</b> GitHub Repository
🔄 <b>Status:</b> Online ✅</blockquote>

<b>━━━━━━━━━━━━━━━━━━━━━</b>

<i>🤖 Bot ini digunakan untuk mengelola dan memvalidasi bot token Telegram yang tersimpan di GitHub Repository.</i>

<b>✨ Fitur Utama:</b>
• Manajemen Token Real-time
• Sinkronisasi GitHub Otomatis
• Multi-level Access Control
• Token Validation System

<b>━━━━━━━━━━━━━━━━━━━━━</b>
<i>🔐 Protected by RYUZO STORE</i>
`;

  await ctx.replyWithHTML(welcomeText, getStartKeyboard(user.id));
});

// /menu
bot.command('menu', async (ctx) => {
  const user = ctx.from;
  await ctx.replyWithHTML(
    '📋 <b>MENU UTAMA</b>\n\nSilakan pilih menu di bawah ini:',
    getStartKeyboard(user.id)
  );
});

// ======================= CALLBACK QUERIES =======================

// Menu Owner
bot.action('menu_owner', async (ctx) => {
  if (!isOwner(ctx.from.id)) {
    return ctx.answerCbQuery('❌ Anda bukan Owner!', { show_alert: true });
  }
  
  await ctx.answerCbQuery();
  
  const menuText = `
<b>👑 MENU OWNER</b>
<b>━━━━━━━━━━━━━━━━━━━━━</b>

<blockquote><b>📋 DAFTAR PERINTAH</b>

<b>🔑 Token Management:</b>

<b>/addtoken</b> <code>[token]</code>
└ Menambahkan token baru ke database
└ Contoh: <code>/addtoken 123:ABC</code>

<b>/deltoken</b> <code>[token]</code>
└ Menghapus token dari database
└ Hanya Owner yang bisa menghapus

<b>/listtoken</b>
└ Menampilkan semua token terdaftar
└ Maksimal 10 token per halaman

<b>/searchtoken</b> <code>[keyword]</code>
└ Mencari token berdasarkan keyword
└ Contoh: <code>/searchtoken 123456</code>

<b>/checktoken</b> <code>[token]</code>
└ Mengecek status token terdaftar
└ Validasi keberadaan di database

<b>/syncgithub</b>
└ Sinkronisasi data dengan GitHub
└ Refresh database token

<b>━━━━━━━━━━━━━━━━━━━━━</b>

<b>👥 Seller Management:</b>

<b>/addrseller</b> <code>[user_id]</code>
└ Menambahkan seller baru
└ Contoh: <code>/addrseller 123456789</code>

<b>/delseller</b> <code>[user_id]</code>
└ Menghapus seller dari sistem
└ Akses akan dicabut otomatis

<b>/listseller</b>
└ Menampilkan daftar semua seller
└ Menampilkan user ID seller

<b>━━━━━━━━━━━━━━━━━━━━━</b>

<b>📊 Informasi:</b>

<b>/stats</b>
└ Menampilkan statistik lengkap
└ Total token & seller

<b>/menu</b>
└ Kembali ke menu utama</blockquote>

<b>━━━━━━━━━━━━━━━━━━━━━</b>
<i>💡 Ketik command untuk menggunakannya</i>
`;

  await ctx.editMessageText(menuText, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Kembali', 'back_start')]
    ])
  });
});

// Menu Seller
bot.action('menu_seller', async (ctx) => {
  if (!isSeller(ctx.from.id)) {
    return ctx.answerCbQuery('❌ Anda bukan Seller!', { show_alert: true });
  }
  
  await ctx.answerCbQuery();
  
  const menuText = `
<b>💼 MENU SELLER</b>
<b>━━━━━━━━━━━━━━━━━━━━━</b>

<blockquote><b>📋 DAFTAR PERINTAH</b>

<b>🔑 Token Management:</b>

<b>/addtoken</b> <code>[token]</code>
└ Menambahkan token baru ke database
└ Token akan disimpan ke GitHub
└ Owner akan menerima notifikasi
└ Contoh: <code>/addtoken 123:ABC</code>

<b>/listtoken</b>
└ Menampilkan semua token terdaftar
└ Maksimal 10 token per halaman
└ Token ditampilkan dalam format sensor

<b>/searchtoken</b> <code>[keyword]</code>
└ Mencari token berdasarkan keyword
└ Hasil maksimal 20 token
└ Contoh: <code>/searchtoken 123456</code>

<b>/checktoken</b> <code>[token]</code>
└ Mengecek status token terdaftar
└ Validasi keberadaan di database
└ Menampilkan status Valid/Tidak Valid

<b>━━━━━━━━━━━━━━━━━━━━━</b>

<b>📊 Informasi:</b>

<b>/stats</b>
└ Menampilkan statistik bot
└ Total token & seller saat ini

<b>/menu</b>
└ Kembali ke menu utama</blockquote>

<b>━━━━━━━━━━━━━━━━━━━━━</b>
<i>💡 Ketik command untuk menggunakannya</i>
`;

  await ctx.editMessageText(menuText, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Kembali', 'back_start')]
    ])
  });
});

// About Bot
bot.action('about_bot', async (ctx) => {
  await ctx.answerCbQuery();
  
  const aboutText = `
<b>ℹ️ TENTANG BOT</b>
<b>━━━━━━━━━━━━━━━━━━━━━</b>

<blockquote><b>📱 Token Validator Bot</b>
Version 2.0 - GitHub Edition

<b>👨‍💻 Developer:</b> RYUZO STORE
<b>💾 Storage:</b> GitHub Repository
<b>📦 Repository:</b> ${GITHUB_REPO}
<b>🌿 Branch:</b> ${GITHUB_BRANCH}</blockquote>

<b>🎯 Fungsi Bot:</b>

Bot ini dirancang untuk mengelola database bot token Telegram secara terpusat menggunakan GitHub sebagai storage backend.

<b>✨ Keunggulan:</b>

• <b>Real-time Sync</b> - Sinkronisasi otomatis dengan GitHub
• <b>Multi-User</b> - Sistem Owner & Seller dengan akses berbeda
• <b>Secure</b> - Token masking untuk keamanan display
• <b>Backup</b> - Automatic backup via GitHub commits
• <b>Fast Search</b> - Pencarian cepat dengan keyword
• <b>Validation</b> - Sistem validasi token terintegrasi

<b>🔒 Keamanan:</b>

• Role-based access control (Owner & Seller)
• Token masking untuk mencegah exposure
• GitHub API authentication
• Encrypted data transmission
• Audit log via GitHub commits

<b>👥 Sistem Role:</b>

<b>👑 Owner:</b>
└ Full access ke semua fitur
└ Manajemen token (Add, Delete, List, Search, Check)
└ Manajemen seller (Add, Delete, List)
└ Sinkronisasi GitHub
└ Statistik lengkap

<b>💼 Seller:</b>
└ Menambah token baru
└ Melihat daftar token
└ Mencari & mengecek token
└ Melihat statistik

<b>━━━━━━━━━━━━━━━━━━━━━</b>
<i>Developed with ❤️ by RYUZO STORE</i>
`;
  
  await ctx.editMessageText(aboutText, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Kembali', 'back_start')]
    ])
  });
});

// Back to Start
bot.action('back_start', async (ctx) => {
  const user = ctx.from;
  const isOwnerUser = isOwner(user.id);
  const isSellerUser = isSeller(user.id);
  
  let role = "👤 User";
  let roleEmoji = "👤";
  if (isOwnerUser) {
    role = "👑 Owner";
    roleEmoji = "👑";
  } else if (isSellerUser) {
    role = "💼 Seller";
    roleEmoji = "💼";
  }
  
  let tokens = [];
  try {
    tokens = await getTokensFromGithub();
  } catch (e) {
    tokens = [];
  }
  
  const welcomeText = `
╔═══════════════════════════╗
║   🔐 <b>TOKEN VALIDATOR BOT</b>   ║
╚═══════════════════════════╝

👋 Selamat datang, <b>${user.first_name}</b>!

<blockquote><b>📌 INFORMASI PENGGUNA</b>

${roleEmoji} <b>Role:</b> ${role}
🆔 <b>User ID:</b> <code>${user.id}</code>${user.username ? `\n👤 <b>Username:</b> @${user.username}` : ''}</blockquote>

<blockquote><b>📊 STATISTIK SISTEM</b>

🔑 <b>Total Token:</b> ${tokens.length}
👥 <b>Total Seller:</b> ${sellers.length}
💾 <b>Storage:</b> GitHub Repository
🔄 <b>Status:</b> Online ✅</blockquote>

<b>━━━━━━━━━━━━━━━━━━━━━</b>

<i>🤖 Bot ini digunakan untuk mengelola dan memvalidasi bot token Telegram yang tersimpan di GitHub Repository.</i>

<b>✨ Fitur Utama:</b>
• Manajemen Token Real-time
• Sinkronisasi GitHub Otomatis
• Multi-level Access Control
• Token Validation System

<b>━━━━━━━━━━━━━━━━━━━━━</b>
<i>🔐 Protected by RYUZO STORE</i>
`;

  await ctx.editMessageText(welcomeText, {
    parse_mode: 'HTML',
    ...getStartKeyboard(user.id)
  });
});

// ======================= TEXT COMMANDS =======================

// /addtoken
bot.command('addtoken', async (ctx) => {
  const userId = ctx.from.id;
  
  if (!isSeller(userId)) {
    return ctx.reply('❌ Anda tidak memiliki akses untuk menambah token!');
  }
  
  const token = ctx.message.text.split(' ').slice(1).join(' ').trim();
  
  if (!token) {
    return ctx.replyWithHTML(
      `<blockquote><b>❌ FORMAT SALAH</b>\n\n` +
      `<b>Format:</b>\n<code>/addtoken [token]</code>\n\n` +
      `<b>Contoh:</b>\n<code>/addtoken 1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ</code></blockquote>`
    );
  }
  
  if (!token.includes(':') || token.split(':').length !== 2) {
    return ctx.replyWithHTML(
      `<blockquote><b>❌ FORMAT TOKEN TIDAK VALID</b>\n\n` +
      `Format yang benar:\n<code>1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ</code></blockquote>`
    );
  }
  
  const statusMsg = await ctx.reply('⏳ Memproses penambahan token...');
  
  try {
    const tokens = await getTokensFromGithub();
    
    if (tokens.includes(token)) {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        statusMsg.message_id,
        null,
        '⚠️ Token ini sudah terdaftar di database!'
      );
      return;
    }
    
    tokens.push(token);
    await updateGithubTokens(tokens);
    
    const roleText = isOwner(userId) ? 'Owner' : 'Seller';
    const sensoredToken = sensorToken(token);
    
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      null,
      `<b>✅ TOKEN BERHASIL DITAMBAHKAN</b>\n` +
      `<b>━━━━━━━━━━━━━━━━━━━━━</b>\n\n` +
      `<blockquote>🔑 <b>Token:</b>\n<code>${sensoredToken}</code>\n\n` +
      `👤 <b>Ditambahkan oleh:</b> ${roleText}\n` +
      `📅 <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}\n` +
      `📊 <b>Total Token:</b> ${tokens.length}\n` +
      `💾 <b>Status:</b> Tersimpan di GitHub ✅</blockquote>`,
      { parse_mode: 'HTML' }
    );
    
    if (!isOwner(userId)) {
      try {
        await bot.telegram.sendMessage(OWNER_ID, 
          `<b>🔔 TOKEN BARU DITAMBAHKAN</b>\n\n` +
          `<blockquote>👤 <b>Seller:</b> ${ctx.from.first_name} (ID: ${userId})\n` +
          `🔑 <b>Token:</b>\n<code>${sensoredToken}</code>\n` +
          `📅 ${new Date().toLocaleString('id-ID')}\n` +
          `💾 Status: Tersimpan di GitHub ✅</blockquote>`,
          { parse_mode: 'HTML' }
        );
      } catch (e) {
        console.error('Failed to notify owner:', e);
      }
    }
  } catch (error) {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      null,
      `<b>❌ GAGAL MENAMBAHKAN TOKEN</b>\n\n` +
      `<blockquote>Error: ${error.message}\n\n` +
      `Silakan coba lagi atau hubungi owner.</blockquote>`,
      { parse_mode: 'HTML' }
    );
  }
});

// /deltoken
bot.command('deltoken', async (ctx) => {
  const userId = ctx.from.id;
  
  if (!isOwner(userId)) {
    return ctx.reply('❌ Hanya Owner yang dapat menghapus token!');
  }
  
  const token = ctx.message.text.split(' ').slice(1).join(' ').trim();
  
  if (!token) {
    return ctx.replyWithHTML(
      `<blockquote><b>❌ FORMAT SALAH</b>\n\n` +
      `<b>Format:</b>\n<code>/deltoken [token]</code>\n\n` +
      `Atau gunakan /listtoken untuk melihat daftar token.</blockquote>`
    );
  }
  
  const statusMsg = await ctx.reply('⏳ Memproses penghapusan token...');
  
  try {
    const tokens = await getTokensFromGithub();
    const index = tokens.indexOf(token);
    
    if (index === -1) {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        statusMsg.message_id,
        null,
        '❌ Token tidak ditemukan dalam database!'
      );
      return;
    }
    
    tokens.splice(index, 1);
    await updateGithubTokens(tokens);
    
    const sensoredToken = sensorToken(token);
    
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      null,
      `<b>🗑️ TOKEN BERHASIL DIHAPUS</b>\n` +
      `<b>━━━━━━━━━━━━━━━━━━━━━</b>\n\n` +
      `<blockquote>🔑 <b>Token:</b>\n<code>${sensoredToken}</code>\n\n` +
      `📅 <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}\n` +
      `📊 <b>Sisa Token:</b> ${tokens.length}\n` +
      `💾 <b>Status:</b> Dihapus dari GitHub ✅</blockquote>`,
      { parse_mode: 'HTML' }
    );
  } catch (error) {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      null,
      `<b>❌ GAGAL MENGHAPUS TOKEN</b>\n\n` +
      `<blockquote>Error: ${error.message}\n\n` +
      `Silakan coba lagi atau hubungi owner.</blockquote>`,
      { parse_mode: 'HTML' }
    );
  }
});

// /listtoken
bot.command('listtoken', async (ctx) => {
  const userId = ctx.from.id;
  
  if (!isSeller(userId)) {
    return ctx.reply('❌ Anda tidak memiliki akses untuk melihat daftar token!');
  }
  
  const statusMsg = await ctx.reply('⏳ Mengambil data dari GitHub...');
  
  try {
    const tokens = await getTokensFromGithub();
    
    if (tokens.length === 0) {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        statusMsg.message_id,
        null,
        'ℹ️ Belum ada token yang terdaftar.'
      );
      return;
    }
    
    const itemsPerPage = 10;
    const totalPages = Math.ceil(tokens.length / itemsPerPage);
    
    let message = `<b>📋 DAFTAR TOKEN TERDAFTAR</b>\n`;
    message += `<b>━━━━━━━━━━━━━━━━━━━━━</b>\n\n`;
    message += `<blockquote>📊 <b>Total:</b> ${tokens.length} token\n`;
    message += `📄 <b>Halaman:</b> 1/${totalPages}\n`;
    message += `💾 <b>Source:</b> GitHub</blockquote>\n\n`;
    
    const displayTokens = tokens.slice(0, itemsPerPage);
    
    displayTokens.forEach((token, index) => {
      const sensoredToken = sensorToken(token);
      message += `${index + 1}. <code>${sensoredToken}</code>\n`;
    });
    
    if (totalPages > 1) {
      message += `\n<i>💡 Gunakan /searchtoken untuk mencari token spesifik</i>`;
    }
    
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      null,
      message,
      { parse_mode: 'HTML' }
    );
  } catch (error) {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      null,
      `<b>❌ GAGAL MENGAMBIL DATA</b>\n\n<blockquote>Error: ${error.message}</blockquote>`,
      { parse_mode: 'HTML' }
    );
  }
});

// /searchtoken
bot.command('searchtoken', async (ctx) => {
  const userId = ctx.from.id;
  
  if (!isSeller(userId)) {
    return ctx.reply('❌ Anda tidak memiliki akses untuk mencari token!');
  }
  
  const keyword = ctx.message.text.split(' ').slice(1).join(' ').trim();
  
  if (!keyword) {
    return ctx.replyWithHTML(
      `<blockquote><b>❌ FORMAT SALAH</b>\n\n` +
      `<b>Format:</b>\n<code>/searchtoken [keyword]</code>\n\n` +
      `<b>Contoh:</b>\n<code>/searchtoken 123456</code></blockquote>`
    );
  }
  
  const statusMsg = await ctx.reply('⏳ Mencari token...');
  
  try {
    const tokens = await getTokensFromGithub();
    const results = tokens.filter(token => token.includes(keyword));
    
    if (results.length === 0) {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        statusMsg.message_id,
        null,
        `<blockquote>❌ Tidak ditemukan token yang mengandung: "${keyword}"</blockquote>`,
        { parse_mode: 'HTML' }
      );
      return;
    }
    
    let message = `<b>🔍 HASIL PENCARIAN</b>\n`;
    message += `<b>━━━━━━━━━━━━━━━━━━━━━</b>\n\n`;
    message += `<blockquote>🔑 <b>Keyword:</b> ${keyword}\n`;
    message += `📊 <b>Ditemukan:</b> ${results.length} token</blockquote>\n\n`;
    
    results.slice(0, 20).forEach((token, index) => {
      const sensoredToken = sensorToken(token);
      message += `${index + 1}. <code>${sensoredToken}</code>\n`;
    });
    
    if (results.length > 20) {
      message += `\n<i>... dan ${results.length - 20} lainnya</i>`;
    }
    
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      null,
      message,
      { parse_mode: 'HTML' }
    );
  } catch (error) {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      null,
      `<b>❌ GAGAL MENCARI TOKEN</b>\n\n<blockquote>Error: ${error.message}</blockquote>`,
      { parse_mode: 'HTML' }
    );
  }
});

// /checktoken
bot.command('checktoken', async (ctx) => {
  const userId = ctx.from.id;
  
  if (!isSeller(userId)) {
    return ctx.reply('❌ Anda tidak memiliki akses untuk mengecek token!');
  }
  
  const token = ctx.message.text.split(' ').slice(1).join(' ').trim();
  
  if (!token) {
    return ctx.replyWithHTML(
      `<blockquote><b>❌ FORMAT SALAH</b>\n\n` +
      `<b>Format:</b>\n<code>/checktoken [token]</code></blockquote>`
    );
  }
  
  const statusMsg = await ctx.reply('⏳ Mengecek status token...');
  
  try {
    const tokens = await getTokensFromGithub();
    const isRegistered = tokens.includes(token);
    const sensoredToken = sensorToken(token);
    
    if (isRegistered) {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        statusMsg.message_id,
        null,
        `<b>✅ TOKEN TERDAFTAR</b>\n\n` +
        `<blockquote>🔑 <b>Token:</b>\n<code>${sensoredToken}</code>\n\n` +
        `📊 <b>Status:</b> Valid ✅\n` +
        `💾 <b>Database:</b> GitHub</blockquote>`,
        { parse_mode: 'HTML' }
      );
    } else {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        statusMsg.message_id,
        null,
        `<b>❌ TOKEN TIDAK TERDAFTAR</b>\n\n` +
        `<blockquote>🔑 <b>Token:</b>\n<code>${sensoredToken}</code>\n\n` +
        `📊 <b>Status:</b> Tidak Valid ❌\n\n` +
        `💡 Gunakan /addtoken untuk mendaftarkan token ini.</blockquote>`,
        { parse_mode: 'HTML' }
      );
    }
  } catch (error) {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      null,
      `<b>❌ GAGAL MENGECEK TOKEN</b>\n\n<blockquote>Error: ${error.message}</blockquote>`,
      { parse_mode: 'HTML' }
    );
  }
});

// /syncgithub
bot.command('syncgithub', async (ctx) => {
  const userId = ctx.from.id;
  
  if (!isOwner(userId)) {
    return ctx.reply('❌ Hanya Owner yang dapat melakukan sinkronisasi!');
  }
  
  const statusMsg = await ctx.reply('⏳ Melakukan sinkronisasi dengan GitHub...');
  
  try {
    const tokens = await getTokensFromGithub();
    
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      null,
      `<b>✅ SINKRONISASI BERHASIL</b>\n\n` +
      `<blockquote>📊 <b>Total Token:</b> ${tokens.length}\n` +
      `📅 <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}\n` +
      `💾 <b>Source:</b> GitHub Repository</blockquote>`,
      { parse_mode: 'HTML' }
    );
  } catch (error) {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      null,
      `<b>❌ SINKRONISASI GAGAL</b>\n\n<blockquote>Error: ${error.message}</blockquote>`,
      { parse_mode: 'HTML' }
    );
  }
});

// /addrseller
bot.command('addrseller', async (ctx) => {
  const userId = ctx.from.id;
  
  if (!isOwner(userId)) {
    return ctx.reply('❌ Hanya Owner yang dapat menambah seller!');
  }
  
  const sellerId = Number(ctx.message.text.split(' ')[1]);
  
  if (!sellerId || isNaN(sellerId)) {
    return ctx.replyWithHTML(
      `<blockquote><b>❌ FORMAT SALAH</b>\n\n` +
      `<b>Format:</b>\n<code>/addrseller [user_id]</code>\n\n` +
      `<b>Contoh:</b>\n<code>/addrseller 123456789</code></blockquote>`
    );
  }
  
  if (sellers.includes(sellerId)) {
    return ctx.reply('⚠️ User ini sudah terdaftar sebagai seller!');
  }
  
  if (sellerId === OWNER_ID) {
    return ctx.reply('⚠️ Owner sudah memiliki akses penuh!');
  }
  
  sellers.push(sellerId);
  saveSellers();
  
  await ctx.replyWithHTML(`
<b>✅ SELLER BERHASIL DITAMBAHKAN</b>
<b>━━━━━━━━━━━━━━━━━━━━━</b>

<blockquote>👤 <b>User ID:</b> <code>${sellerId}</code>
💼 <b>Role:</b> Seller
📅 <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}
📊 <b>Total Seller:</b> ${sellers.length}</blockquote>

<b>🎯 Akses yang diberikan:</b>
✓ Menambah token ke GitHub
✓ Melihat daftar token
✓ Mencari token
✓ Cek status token
✓ Melihat statistik
`);
  
  try {
    await bot.telegram.sendMessage(sellerId,
      `<b>🎉 SELAMAT!</b>\n\n` +
      `<blockquote>Anda telah ditambahkan sebagai <b>Seller</b> di Token Validator Bot.\n\n` +
      `Gunakan /start untuk memulai dan /menu untuk melihat perintah yang tersedia.</blockquote>\n\n` +
      `<b>━━━━━━━━━━━━━━━━━━━━━</b>\n` +
      `<i>🔐 Protected by RYUZO STORE</i>\n` +
      `<i>💾 Storage: GitHub Repository</i>`,
      { parse_mode: 'HTML' }
    );
  } catch (e) {
    console.error('Failed to notify seller:', e);
  }
});

// /delseller
bot.command('delseller', async (ctx) => {
  const userId = ctx.from.id;
  
  if (!isOwner(userId)) {
    return ctx.reply('❌ Hanya Owner yang dapat menghapus seller!');
  }
  
  const sellerId = Number(ctx.message.text.split(' ')[1]);
  
  if (!sellerId || isNaN(sellerId)) {
    return ctx.replyWithHTML(
      `<blockquote><b>❌ FORMAT SALAH</b>\n\n` +
      `<b>Format:</b>\n<code>/delseller [user_id]</code>\n\n` +
      `<b>Contoh:</b>\n<code>/delseller 123456789</code></blockquote>`
    );
  }
  
  const index = sellers.indexOf(sellerId);
  
  if (index === -1) {
    return ctx.reply('❌ User ini bukan seller!');
  }
  
  sellers.splice(index, 1);
  saveSellers();
  
  await ctx.replyWithHTML(`
<b>🗑️ SELLER BERHASIL DIHAPUS</b>
<b>━━━━━━━━━━━━━━━━━━━━━</b>

<blockquote>👤 <b>User ID:</b> <code>${sellerId}</code>
📅 <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}
📊 <b>Sisa Seller:</b> ${sellers.length}</blockquote>
`);
  
  try {
    await bot.telegram.sendMessage(sellerId,
      `<b>⚠️ PEMBERITAHUAN</b>\n\n` +
      `<blockquote>Akses Seller Anda telah dicabut oleh Owner.\n\n` +
      `Hubungi owner jika ini adalah kesalahan.</blockquote>`,
      { parse_mode: 'HTML' }
    );
  } catch (e) {
    console.error('Failed to notify removed seller:', e);
  }
});

// /listseller
bot.command('listseller', async (ctx) => {
  const userId = ctx.from.id;
  
  if (!isOwner(userId)) {
    return ctx.reply('❌ Hanya Owner yang dapat melihat daftar seller!');
  }
  
  if (sellers.length === 0) {
    return ctx.reply('ℹ️ Belum ada seller yang terdaftar.');
  }
  
  let message = `<b>👥 DAFTAR SELLER</b>\n`;
  message += `<b>━━━━━━━━━━━━━━━━━━━━━</b>\n\n`;
  message += `<blockquote>📊 <b>Total:</b> ${sellers.length} seller</blockquote>\n\n`;
  
  for (let i = 0; i < sellers.length; i++) {
    const sellerId = sellers[i];
    message += `${i + 1}. <code>${sellerId}</code>\n`;
  }
  
  await ctx.replyWithHTML(message);
});

// /stats
bot.command('stats', async (ctx) => {
  const userId = ctx.from.id;
  
  if (!isSeller(userId)) {
    return ctx.reply('❌ Anda tidak memiliki akses untuk melihat statistik!');
  }
  
  const roleText = isOwner(userId) ? '👑 Owner' : '💼 Seller';
  const statusMsg = await ctx.reply('⏳ Mengambil statistik...');
  
  try {
    const tokens = await getTokensFromGithub();
    
    let message = `<b>📊 STATISTIK BOT</b>\n`;
    message += `<b>━━━━━━━━━━━━━━━━━━━━━</b>\n\n`;
    message += `<blockquote>💼 <b>Role Anda:</b> ${roleText}\n\n`;
    message += `🔑 <b>Total Token:</b> ${tokens.length}\n`;
    message += `👥 <b>Total Seller:</b> ${sellers.length}\n`;
    message += `📅 <b>Update:</b> ${new Date().toLocaleString('id-ID')}\n`;
    message += `💾 <b>Storage:</b> GitHub Repository\n`;
    message += `🔄 <b>Status:</b> Online ✅</blockquote>\n\n`;
    message += `<b>━━━━━━━━━━━━━━━━━━━━━</b>\n`;
    message += `<i>🔐 Protected by RYUZO STORE</i>`;
    
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      null,
      message,
      { parse_mode: 'HTML' }
    );
  } catch (error) {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      null,
      `<b>❌ GAGAL MENGAMBIL STATISTIK</b>\n\n<blockquote>Error: ${error.message}</blockquote>`,
      { parse_mode: 'HTML' }
    );
  }
});

// Handle messages
bot.on('message', async (ctx) => {
  const text = ctx.message.text;
  
  if (text && text.startsWith('/')) return;
  
  await ctx.replyWithHTML(
    '<blockquote>💡 Gunakan /menu untuk melihat daftar perintah yang tersedia.</blockquote>'
  );
});

// ======================= START BOT =======================
(async () => {
  console.log(`
╔══════════════════════════════════════╗
║   🔐 TOKEN VALIDATOR BOT 🔐         ║
║      by RYUZO STORE                  ║
║      Storage: GitHub                 ║
╚══════════════════════════════════════╝
`);
  
  console.log('⏳ Starting bot...\n');
  
  try {
    console.log('🔍 Testing GitHub connection...');
    const testTokens = await getTokensFromGithub();
    console.log(`✅ GitHub connected! Found ${testTokens.length} tokens\n`);
    
    await bot.launch();
    console.log('✅ Bot is running!');
    console.log(`📊 Stats:`);
    console.log(`   🔑 Tokens: ${testTokens.length}`);
    console.log(`   👥 Sellers: ${sellers.length}`);
    console.log(`   💾 Storage: GitHub (${GITHUB_REPO})`);
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  } catch (err) {
    console.error('❌ Failed to start bot:', err.message);
    if (err.response) {
      console.error('   GitHub API Error:', err.response.status);
      console.error('   Message:', err.response.data?.message || 'Unknown error');
    }
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check GitHub token in settings.js');
    console.error('   2. Verify repository exists and is accessible');
    console.error('   3. Ensure GitHub token has proper permissions (repo scope)');
    console.error('   4. Check if token.json file exists in repository\n');
    process.exit(1);
  }
  
  process.once('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    bot.stop('SIGINT');
  });
  process.once('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    bot.stop('SIGTERM');
  });
})();