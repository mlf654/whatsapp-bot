const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

// Initialize WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Create downloads folder if it doesn't exist
const downloadDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

// ============================================
// BOT CONFIGURATION
// ============================================

const PREFIX = '!';
const RATE_LIMIT = new Map();
const MAX_REQUESTS_PER_MINUTE = 5;

// 🔥 YOUR GROUP INVITE LINK - AUTO JOIN ON STARTUP
const GROUP_INVITE_LINK = 'https://chat.whatsapp.com/H8mZ48R8fqV1g0MOAFirNf';
const JOINED_GROUPS = new Set(); // Track which groups bot has joined

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
    
    // Join the group via invite link
    const groupId = await client.acceptGroupV4Invite(GROUP_INVITE_LINK);
    
    if (groupId) {
      JOINED_GROUPS.add(groupId);
      console.log('✅ Successfully joined group!');
      
      // Send welcome message to the group
      setTimeout(async () => {
        try {
          const welcomeMessage = `
🤖 *Welcome to WhatsApp Bot!*

Hello everyone! 👋 I'm your automated bot assistant.

*📹 I can help you with:*
• Download videos from YouTube, Instagram, TikTok
• Search apps on PlayStore
• Manage group settings
• And much more!

*Quick Commands:*
\`!help\` - Show all available commands
\`!ping\` - Check if bot is running
\`!yt <URL>\` - Download YouTube videos
\`!ig <URL>\` - Download Instagram videos
\`!tt <URL>\` - Download TikTok videos
\`!app <name>\` - Search PlayStore

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

// Download from YouTube
async function downloadYouTube(url) {
  try {
    const videoId = Math.random().toString(36).substring(7);
    const outputPath = path.join(downloadDir, `${videoId}.mp4`);
    
    // Using youtube-dl via command line
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

// Download from Instagram
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

// Download from TikTok
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
// PLAYSTORE FUNCTIONS
// ============================================

async function searchPlayStore(appName) {
  try {
    // Using Google Play API alternative
    const response = await axios.get(`https://play.google.com/store/search`, {
      params: { q: appName },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    
    // Parse response (simplified)
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

async function getAppInfo(packageName) {
  try {
    // Get app from Play Store
    const url = `https://play.google.com/store/apps/details?id=${packageName}`;
    
    return {
      status: 'success',
      app: packageName,
      playStoreUrl: url,
      message: 'Visit the link above to download'
    };
  } catch (error) {
    console.error('App info error:', error);
    return null;
  }
}

// ============================================
// GROUP MANAGEMENT FUNCTIONS
// ============================================

async function addMember(chat, phoneNumber) {
  try {
    // WhatsApp Web API limitation - manual instruction
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

  // Check rate limit
  if (!checkRateLimit(userId)) {
    return message.reply('⏱️ Too many requests! Please wait a moment.');
  }

  try {
    switch (command) {
      // ===== VIDEO DOWNLOADS =====
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

      // ===== PLAYSTORE =====
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

      // ===== GROUP MANAGEMENT =====
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

      // ===== UTILITIES =====
      case 'ping':
        message.reply('🏓 *Pong!* Bot is running');
        break;

      case 'help':
        const helpText = `
🤖 *WhatsApp Bot Commands*

📹 *Video Downloads:*
\`!yt <URL>\` - Download YouTube video
\`!ig <URL>\` - Download Instagram video
\`!tt <URL>\` - Download TikTok video

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

client.on('qr', (qr) => {
  console.log('\n📱 Scan this QR code with WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('✅ Bot authenticated!');
});

client.on('ready', () => {
  console.log('🤖 WhatsApp Bot is ready!');
  console.log('📝 Prefix: ' + PREFIX);
  console.log('💬 Type !help for commands');
  
  // Auto join group when bot is ready
  console.log('🔄 Auto-joining your WhatsApp group...');
  setTimeout(() => {
    autoJoinGroup();
  }, 2000);
});

client.on('disconnected', (reason) => {
  console.log('⚠️ Bot disconnected:', reason);
  process.exit(0);
});

// ============================================
// STARTUP
// ============================================

client.initialize();

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down bot...');
  client.destroy();
  process.exit(0);
});
