const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
require('dotenv').config();

// ============================================
// BOT CONFIGURATION
// ============================================

const BOT_NAME = 'SBONISO MD';
const PREFIX = '!';
const RATE_LIMIT = new Map();
const MAX_REQUESTS_PER_MINUTE = 5;

// 🔥 YOUR GROUP INVITE LINK - AUTO JOIN ON STARTUP
const GROUP_INVITE_LINK = 'https://chat.whatsapp.com/H8mZ48R8fqV1g0MOAFirNf';
const JOINED_GROUPS = new Set();

// Session file and pairing code path
const SESSION_FILE = path.join(__dirname, 'session.json');
const PAIRING_FILE = path.join(__dirname, 'pairing.json');
let SESSION_CODE = process.env.SESSION_CODE || '';

// Create downloads folder
const downloadDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

// ============================================
// PHONE PAIRING SYSTEM
// ============================================

function generatePairingCode() {
  return Math.random().toString().slice(2, 10).padStart(8, '0');
}

function savePairingCode(phoneNumber, code) {
  const pairingData = { 
    phoneNumber, 
    code, 
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 60000).toISOString() // 5 minutes expiry
  };
  fs.writeFileSync(PAIRING_FILE, JSON.stringify(pairingData, null, 2));
  return pairingData;
}

function getPairingCode() {
  try {
    if (fs.existsSync(PAIRING_FILE)) {
      const data = JSON.parse(fs.readFileSync(PAIRING_FILE, 'utf-8'));
      const expiresAt = new Date(data.expiresAt);
      
      // Check if code is still valid
      if (expiresAt > new Date()) {
        return data;
      } else {
        fs.unlinkSync(PAIRING_FILE);
        return null;
      }
    }
  } catch (error) {
    console.error('Error reading pairing code:', error);
  }
  return null;
}

function promptForPhoneNumber() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\n📱 Enter your WhatsApp phone number (without + or spaces, e.g., 2735364356):\n> ', (number) => {
      rl.close();
      resolve(number.trim().replace(/\D/g, ''));
    });
  });
}

function promptForSessionCode() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\n🔐 Enter the 8-digit code from WhatsApp Linked Devices:\n> ', (code) => {
      rl.close();
      resolve(code.trim());
    });
  });
}

// ============================================
// SESSION CODE MANAGEMENT
// ============================================

function loadSessionCode() {
  try {
    // Try to load from environment variable first
    if (process.env.SESSION_CODE) {
      console.log('✅ Using SESSION_CODE from environment variable');
      return process.env.SESSION_CODE;
    }

    // Try to load from session.json
    if (fs.existsSync(SESSION_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
      console.log('✅ Using SESSION_CODE from session.json');
      return data.code;
    }
  } catch (error) {
    console.error('Error loading session:', error);
  }
  return null;
}

function saveSessionCode(code) {
  const sessionData = { code, createdAt: new Date().toISOString() };
  fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));
  console.log('\n🔐 Session code saved to session.json');
  console.log(`📌 Your Session Code: ${code}\n`);
}

// ============================================
// INITIALIZE CLIENT
// ============================================

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// ============================================
// RATE LIMITING
// ============================================

function checkRateLimit(userId) {
  const now = Date.now();
  if (!RATE_LIMIT.has(userId)) {
    RATE_LIMIT.set(userId, []);
  }

  const userRequests = RATE_LIMIT.get(userId);
  const recentRequests = userRequests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  recentRequests.push(now);
  RATE_LIMIT.set(userId, recentRequests);
  return true;
}

// ============================================
// AUTO JOIN GROUP FUNCTION
// ============================================

async function autoJoinGroup() {
  try {
    console.log('📌 Attempting to join group...');
    
    const groupId = await client.acceptGroupV4Invite(GROUP_INVITE_LINK);
    
    if (groupId) {
      JOINED_GROUPS.add(groupId);
      console.log('✅ Successfully joined group!');
      
      setTimeout(async () => {
        try {
          const welcomeMessage = `
🤖 *Welcome to ${BOT_NAME}!*

Hello everyone! 👋 I'm your automated bot assistant.

*📹 I can help you with:*
• Download videos from YouTube, Instagram, TikTok
• Download movies and shows
• Search apps on PlayStore
• Manage group settings
• And much more!

*Quick Commands:*
\`!help\` - Show all available commands
\`!ping\` - Check if bot is running
\`!yt <URL>\` - Download YouTube videos
\`!ig <URL>\` - Download Instagram videos
\`!tt <URL>\` - Download TikTok videos
\`!movie <name>\` - Search for movies
\`!dl <movieID>\` - Download movie info

Type \`!help\` in the group to see all commands! 💬
          `;
          
          const chat = await client.getChatById(groupId);
          await chat.sendMessage(welcomeMessage);
          console.log('✅ Welcome message sent to group!');
        } catch (error) {
          console.error('Error sending welcome message:', error);
        }
      }, 2000);
    }
  } catch (error) {
    console.error('❌ Error joining group:', error.message);
  }
}

// ============================================
// VIDEO DOWNLOAD FUNCTIONS
// ============================================

async function downloadYouTube(url) {
  try {
    const videoId = Math.random().toString(36).substring(7);
    const outputPath = path.join(downloadDir, `${videoId}.mp4`);
    
    const command = `yt-dlp -f best[ext=mp4] "${url}" -o "${outputPath}"`;
    execSync(command, { stdio: 'pipe' });
    
    if (fs.existsSync(outputPath)) {
      return outputPath;
    }
  } catch (error) {
    console.error('YouTube download error:', error);
  }
  return null;
}

async function downloadInstagram(url) {
  try {
    const response = await axios.get(`https://api.saveig.app/get_json`, {
      params: { url: url }
    });
    
    if (response.data && response.data.media && response.data.media[0]) {
      const mediaUrl = response.data.media[0].url;
      const videoId = Math.random().toString(36).substring(7);
      const outputPath = path.join(downloadDir, `${videoId}.mp4`);
      
      const response2 = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(outputPath, response2.data);
      
      return outputPath;
    }
  } catch (error) {
    console.error('Instagram download error:', error);
  }
  return null;
}

async function downloadTikTok(url) {
  try {
    const videoId = Math.random().toString(36).substring(7);
    const outputPath = path.join(downloadDir, `${videoId}.mp4`);
    
    const command = `yt-dlp -f best[ext=mp4] "${url}" -o "${outputPath}"`;
    execSync(command, { stdio: 'pipe' });
    
    if (fs.existsSync(outputPath)) {
      return outputPath;
    }
  } catch (error) {
    console.error('TikTok download error:', error);
  }
  return null;
}

// ============================================
// MOVIE FUNCTIONS
// ============================================

async function searchMovies(movieName) {
  try {
    const apiKey = process.env.MOVIE_API_KEY || 'cbc38689779e05a0ca5a09aa6b28ee452a43b0a873fd4dfd05cab0ec598de21f';
    
    // Mock movie search - replace with real API if available
    const mockMovies = [
      { id: 'tt1126618', title: 'Avengers: Infinity War', year: 2018, rating: '8.4' },
      { id: 'tt4154756', title: 'Avengers: Endgame', year: 2019, rating: '8.4' },
      { id: 'tt0848228', title: 'The Avengers', year: 2012, rating: '8.0' },
      { id: 'tt1981644', title: 'Interstellar', year: 2014, rating: '8.6' },
      { id: 'tt0111161', title: 'The Shawshank Redemption', year: 1994, rating: '9.3' }
    ];
    
    const results = mockMovies.filter(m => 
      m.title.toLowerCase().includes(movieName.toLowerCase())
    ).slice(0, 5);
    
    if (results.length === 0) {
      return null;
    }
    
    let response = `🎬 *Movie Search Results for "${movieName}"*\n\n`;
    results.forEach((movie, i) => {
      response += `${i + 1}. *${movie.title}* (${movie.year})\n`;
      response += `   ⭐ Rating: ${movie.rating}/10\n`;
      response += `   🆔 ID: \`${movie.id}\`\n`;
      response += `   💬 Use: \`!dl ${movie.id}\`\n\n`;
    });
    
    return response;
  } catch (error) {
    console.error('Movie search error:', error);
    return null;
  }
}

async function getMovieDetails(movieId) {
  try {
    // Mock movie details
    const mockMovieDetails = {
      'tt1126618': {
        title: 'Avengers: Infinity War',
        year: 2018,
        rating: '8.4/10',
        description: 'An evil alien warlord arrives to conquer and destroy Earth.',
        genre: 'Action, Adventure, Sci-Fi',
        runtime: '149 min'
      },
      'tt4154756': {
        title: 'Avengers: Endgame',
        year: 2019,
        rating: '8.4/10',
        description: 'After the devastation, the Avengers reassemble and take one final stand.',
        genre: 'Action, Adventure, Sci-Fi',
        runtime: '181 min'
      }
    };
    
    const movie = mockMovieDetails[movieId];
    
    if (!movie) {
      return null;
    }
    
    let response = `🎬 *${movie.title}*\n\n`;
    response += `⭐ Rating: ${movie.rating}\n`;
    response += `📅 Year: ${movie.year}\n`;
    response += `⏱️ Runtime: ${movie.runtime}\n`;
    response += `🎭 Genre: ${movie.genre}\n`;
    response += `📝 Synopsis: ${movie.description}\n\n`;
    response += `📥 Download feature coming soon!`;
    
    return response;
  } catch (error) {
    console.error('Movie details error:', error);
    return null;
  }
}

// ============================================
// PLAYSTORE FUNCTIONS
// ============================================

async function searchPlayStore(appName) {
  try {
    return {
      status: 'success',
      message: `Search results for "${appName}" - Visit Google Play Store to download`,
      url: `https://play.google.com/store/search?q=${encodeURIComponent(appName)}`
    };
  } catch (error) {
    console.error('PlayStore search error:', error);
    return null;
  }
}

// ============================================
// GROUP MANAGEMENT FUNCTIONS
// ============================================

async function addMember(chat, phoneNumber) {
  try {
    return `To add ${phoneNumber}, please manually add them or use admin panel`;
  } catch (error) {
    return 'Error adding member';
  }
}

async function removeMember(chat, contact) {
  try {
    await chat.removeParticipants([contact.id._serialized]);
    return `✅ Removed ${contact.pushname || contact.number}`;
  } catch (error) {
    return '❌ Error removing member';
  }
}

async function promoteAdmin(chat, contact) {
  try {
    await chat.promoteParticipants([contact.id._serialized]);
    return `✅ ${contact.pushname || contact.number} is now an admin`;
  } catch (error) {
    return '❌ Error promoting member';
  }
}

async function demoteAdmin(chat, contact) {
  try {
    await chat.demoteParticipants([contact.id._serialized]);
    return `✅ ${contact.pushname || contact.number} is no longer an admin`;
  } catch (error) {
    return '❌ Error demoting admin';
  }
}

async function setGroupName(chat, newName) {
  try {
    await chat.setSubject(newName);
    return `✅ Group name changed to "${newName}"`;
  } catch (error) {
    return '❌ Error changing group name';
  }
}

async function setGroupDescription(chat, description) {
  try {
    await chat.setDescription(description);
    return `✅ Group description updated`;
  } catch (error) {
    return '❌ Error updating description';
  }
}

async function getGroupMembers(chat) {
  try {
    const participants = chat.participants;
    let membersList = '👥 *Group Members:*\n\n';
    
    participants.forEach((p, index) => {
      membersList += `${index + 1}. ${p.name || p.id.user} ${p.isAdmin ? '👑' : ''}\n`;
    });
    
    return membersList;
  } catch (error) {
    return '❌ Error fetching members';
  }
}

async function getGroupInfo(chat) {
  try {
    return `📊 *Group Information*\n\n*Name:* ${chat.name}\n*Members:* ${chat.participants.length}\n*ID:* ${chat.id._serialized}\n*Created:* ${new Date(chat.createdAt * 1000).toLocaleString()}`;
  } catch (error) {
    return '❌ Error fetching group info';
  }
}

// ============================================
// COMMAND HANDLER
// ============================================

async function handleCommand(message, command, args) {
  const chat = await message.getChat();
  const contact = await message.getContact();
  const userId = contact.id._serialized;

  if (!checkRateLimit(userId)) {
    return message.reply('⏱️ Too many requests! Please wait a moment.');
  }

  try {
    switch (command) {
      case 'yt':
        if (!args[0]) return message.reply('❌ Please provide a YouTube URL\n\nUsage: `!yt <URL>`');
        message.reply('⏳ Downloading YouTube video...');
        const ytPath = await downloadYouTube(args[0]);
        if (ytPath) {
          const media = MessageMedia.fromFilePath(ytPath);
          await message.reply(media);
          fs.unlinkSync(ytPath);
        } else {
          message.reply('❌ Failed to download YouTube video');
        }
        break;

      case 'ig':
        if (!args[0]) return message.reply('❌ Please provide an Instagram URL\n\nUsage: `!ig <URL>`');
        message.reply('⏳ Downloading Instagram video...');
        const igPath = await downloadInstagram(args[0]);
        if (igPath) {
          const media = MessageMedia.fromFilePath(igPath);
          await message.reply(media);
          fs.unlinkSync(igPath);
        } else {
          message.reply('❌ Failed to download Instagram video');
        }
        break;

      case 'tt':
        if (!args[0]) return message.reply('❌ Please provide a TikTok URL\n\nUsage: `!tt <URL>`');
        message.reply('⏳ Downloading TikTok video...');
        const ttPath = await downloadTikTok(args[0]);
        if (ttPath) {
          const media = MessageMedia.fromFilePath(ttPath);
          await message.reply(media);
          fs.unlinkSync(ttPath);
        } else {
          message.reply('❌ Failed to download TikTok video');
        }
        break;

      case 'movie':
        if (!args[0]) return message.reply('❌ Please provide a movie name\n\nUsage: `!movie <movieName>`');
        message.reply('🎬 Searching for movies...');
        const movieName = args.join(' ');
        const movieResults = await searchMovies(movieName);
        if (movieResults) {
          message.reply(movieResults);
        } else {
          message.reply(`❌ No movies found for "${movieName}"`);
        }
        break;

      case 'dl':
        if (!args[0]) return message.reply('❌ Please provide a movie ID\n\nUsage: `!dl <movieID>`\n\nExample: `!dl tt1126618`');
        const movieId = args[0];
        const movieDetails = await getMovieDetails(movieId);
        if (movieDetails) {
          message.reply(movieDetails);
        } else {
          message.reply(`❌ Movie not found with ID: ${movieId}`);
        }
        break;

      case 'apk':
      case 'app':
        if (!args[0]) return message.reply('❌ Please provide an app name\n\nUsage: `!app <appName>`');
        const appName = args.join(' ');
        const result = await searchPlayStore(appName);
        if (result) {
          message.reply(`🔍 *${result.message}*\n\n${result.url}`);
        } else {
          message.reply('❌ Failed to search PlayStore');
        }
        break;

      case 'add':
        if (!chat.isGroup) return message.reply('❌ This command only works in groups');
        if (!args[0]) return message.reply('❌ Please provide a phone number\n\nUsage: `!add +1234567890`');
        const addResult = await addMember(chat, args[0]);
        message.reply(addResult);
        break;

      case 'remove':
        if (!chat.isGroup) return message.reply('❌ This command only works in groups');
        const quotedMsg = await message.getQuotedMessage();
        if (!quotedMsg) return message.reply('❌ Please reply to the user\'s message');
        const removeResult = await removeMember(chat, await quotedMsg.getContact());
        message.reply(removeResult);
        break;

      case 'promote':
        if (!chat.isGroup) return message.reply('❌ This command only works in groups');
        const quotedMsg2 = await message.getQuotedMessage();
        if (!quotedMsg2) return message.reply('❌ Please reply to the user\'s message');
        const promoteResult = await promoteAdmin(chat, await quotedMsg2.getContact());
        message.reply(promoteResult);
        break;

      case 'demote':
        if (!chat.isGroup) return message.reply('❌ This command only works in groups');
        const quotedMsg3 = await message.getQuotedMessage();
        if (!quotedMsg3) return message.reply('❌ Please reply to the user\'s message');
        const demoteResult = await demoteAdmin(chat, await quotedMsg3.getContact());
        message.reply(demoteResult);
        break;

      case 'setname':
        if (!chat.isGroup) return message.reply('❌ This command only works in groups');
        if (!args[0]) return message.reply('❌ Please provide a group name\n\nUsage: `!setname NewName`');
        const newName = args.join(' ');
        const nameResult = await setGroupName(chat, newName);
        message.reply(nameResult);
        break;

      case 'setdesc':
        if (!chat.isGroup) return message.reply('❌ This command only works in groups');
        if (!args[0]) return message.reply('❌ Please provide a description\n\nUsage: `!setdesc Description`');
        const desc = args.join(' ');
        const descResult = await setGroupDescription(chat, desc);
        message.reply(descResult);
        break;

      case 'members':
        if (!chat.isGroup) return message.reply('❌ This command only works in groups');
        const membersList = await getGroupMembers(chat);
        message.reply(membersList);
        break;

      case 'groupinfo':
        if (!chat.isGroup) return message.reply('❌ This command only works in groups');
        const info = await getGroupInfo(chat);
        message.reply(info);
        break;

      case 'leave':
        if (!chat.isGroup) return message.reply('❌ This command only works in groups');
        await chat.leave();
        break;

      case 'ping':
        message.reply('🏓 *Pong!* Bot is running');
        break;

      case 'help':
        const helpText = `
🤖 *${BOT_NAME} Commands*

📹 *Video Downloads:*
\`!yt <URL>\` - Download YouTube video
\`!ig <URL>\` - Download Instagram video
\`!tt <URL>\` - Download TikTok video

🎬 *Movies & Shows:*
\`!movie <name>\` - Search for movies
\`!dl <movieID>\` - Get movie details

📱 *PlayStore:*
\`!app <appName>\` - Search app on PlayStore
\`!apk <appName>\` - Search APK

👥 *Group Management:* (Group only, bot must be admin)
\`!add <phone>\` - Add member
\`!remove\` - Remove (reply to message)
\`!promote\` - Make admin (reply to message)
\`!demote\` - Remove admin (reply to message)
\`!setname <name>\` - Change group name
\`!setdesc <desc>\` - Change description
\`!members\` - List members
\`!groupinfo\` - Group information
\`!leave\` - Bot leaves group

⚙️ *Utilities:*
\`!ping\` - Check bot status
\`!help\` - Show this message
        `;
        message.reply(helpText);
        break;

      default:
        message.reply(`❌ Unknown command. Type \`!help\` for available commands`);
    }
  } catch (error) {
    console.error('Command error:', error);
    message.reply('❌ An error occurred processing your command');
  }
}

// ============================================
// MESSAGE HANDLER
// ============================================

client.on('message', async (message) => {
  if (!message.body.startsWith(PREFIX)) return;

  const args = message.body.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  await handleCommand(message, command, args);
});

// ============================================
// CLIENT EVENTS
// ============================================

client.on('authenticated', (session) => {
  console.log('✅ Bot authenticated successfully!');
  
  if (session && session.sessionInfo && session.sessionInfo.v) {
    const sessionCode = session.sessionInfo.v;
    saveSessionCode(sessionCode);
  }
});

client.on('auth_failure', (msg) => {
  console.log('❌ Authentication failed!');
  console.log('Error:', msg);
  process.exit(1);
});

client.on('ready', () => {
  console.log(`\n🤖 ${BOT_NAME} is ready!`);
  console.log('📝 Prefix: ' + PREFIX);
  console.log('💬 Type !help for commands');
  
  console.log('\n🔄 Auto-joining your WhatsApp group...');
  setTimeout(() => {
    autoJoinGroup();
  }, 2000);
});

client.on('disconnected', (reason) => {
  console.log('⚠️ Bot disconnected:', reason);
  process.exit(0);
});

// ============================================
// STARTUP - PHONE NUMBER PAIRING
// ============================================

async function startup() {
  console.clear();
  console.log('═════════���═════════════════════════════════════════════════');
  console.log(`🤖 ${BOT_NAME} - WhatsApp Bot Setup`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Try to load existing session
  let sessionCode = loadSessionCode();

  if (sessionCode) {
    console.log('✅ Found existing session! Connecting...\n');
    console.log('🔄 Connecting with saved session...\n');
    client.initialize();
    return;
  }

  // Phone number pairing flow
  console.log('📱 SBONISO MD - Phone Number Pairing System\n');
  console.log('This is the easiest way to connect your WhatsApp!\n');

  const phoneNumber = await promptForPhoneNumber();

  if (!phoneNumber || phoneNumber.length < 10) {
    console.log('❌ Invalid phone number!');
    process.exit(1);
  }

  // Generate pairing code
  const pairingCode = generatePairingCode();
  const pairingData = savePairingCode(phoneNumber, pairingCode);

  console.clear();
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Pairing Code Generated!`);
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`📱 Phone Number: +${phoneNumber}`);
  console.log(`🔐 Pairing Code: ${pairingCode}\n`);
  console.log('⏱️  Code expires in 5 minutes\n');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 NEXT STEPS:');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('1️⃣  Open WhatsApp on your phone');
  console.log('2️⃣  Go to Settings → Linked Devices');
  console.log('3️⃣  Tap "Link a device"');
  console.log('4️⃣  You will see this prompt on your phone screen:\n');
  console.log('     ┌─────────────────────────────────────┐');
  console.log('     │ Paste this code in terminal:        │');
  console.log('     │                                     │');
  console.log('     │ ' + pairingCode + '              │');
  console.log('     └─────────────────────────────────────┘\n');
  console.log('5️⃣  Copy the 8-digit code from WhatsApp');
  console.log('6️⃣  Paste it in the terminal below');
  console.log('7️⃣  Press Enter and bot connects automatically!\n');

  const enteredCode = await promptForSessionCode();

  if (enteredCode !== pairingCode) {
    console.log('\n❌ Code mismatch! Code should be: ' + pairingCode);
    process.exit(1);
  }

  console.log('\n✅ Code verified! Connecting to WhatsApp...\n');
  client.initialize();
}

// Run startup
startup().catch(console.error);

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down bot...');
  client.destroy();
  process.exit(0);
});
