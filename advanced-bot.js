const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

const PREFIX = '!';

// ============================================
// STATISTICS & DATABASE
// ============================================

const STATS_FILE = path.join(__dirname, 'stats.json');

function loadStats() {
  try {
    return JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
  } catch (e) {
    return {};
  }
}

function saveStats(stats) {
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

function updateStats(userId, chatId) {
  const stats = loadStats();
  
  if (!stats[chatId]) {
    stats[chatId] = { messages: 0, users: {} };
  }
  
  if (!stats[chatId].users[userId]) {
    stats[chatId].users[userId] = 0;
  }
  
  stats[chatId].users[userId]++;
  stats[chatId].messages++;
  
  saveStats(stats);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function eval_math(expression) {
  try {
    return Function(`'use strict'; return (${expression})`)();
  } catch (e) {
    return 'Invalid expression';
  }
}

function getRandomQuote() {
  const quotes = [
    '"The only way to do great work is to love what you do." - Steve Jobs',
    '"Innovation distinguishes between a leader and a follower." - Steve Jobs',
    '"Life is what happens when you\'re busy making other plans." - John Lennon',
    '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt',
    '"It is during our darkest moments that we must focus to see the light." - Aristotle',
    '"The only impossible journey is the one you never begin." - Tony Robbins',
    '"Success is not final, failure is not fatal." - Winston Churchill',
    '"Don\'t let yesterday take up too much of today." - Will Rogers'
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

// ============================================
// REMINDERS
// ============================================

const REMINDERS = new Map();

function setReminder(userId, message, delayMs) {
  const timeoutId = setTimeout(() => {
    client.sendMessage(userId, `⏰ *Reminder:* ${message}`);
    REMINDERS.delete(userId);
  }, delayMs);
  
  REMINDERS.set(userId, { message, createdAt: Date.now(), delay: delayMs });
  return `✅ Reminder set for ${formatTime(delayMs)}`;
}

// ============================================
// POLLS
// ============================================

function createPoll(title, options) {
  if (options.length < 2) return '❌ Need at least 2 options';
  
  let pollText = `📊 *Poll:* ${title}\n\n`;
  options.forEach((option, i) => {
    pollText += `${i + 1}️⃣ ${option}\n`;
  });
  pollText += `\n_Reply with number to vote_`;
  
  return pollText;
}

// ============================================
// COMMAND HANDLER
// ============================================

async function handleCommand(message, command, args) {
  const chat = await message.getChat();
  const contact = await message.getContact();
  const userId = contact.id._serialized;

  try {
    switch (command) {
      // ===== STATISTICS =====
      case 'stats':
        if (!chat.isGroup) return message.reply('❌ This command only works in groups');
        const stats = loadStats();
        const chatStats = stats[chat.id._serialized];
        
        if (!chatStats) {
          return message.reply('📊 No statistics yet');
        }
        
        let statsText = `📊 *Group Statistics*\n\n*Total Messages:* ${chatStats.messages}\n\n*Top Users:*\n`;
        const topUsers = Object.entries(chatStats.users)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        topUsers.forEach((user, i) => {
          statsText += `${i + 1}. ${user[0]}: ${user[1]} messages\n`;
        });
        
        message.reply(statsText);
        break;

      case 'mystats':
        const stats2 = loadStats();
        const chatStats2 = stats2[chat.id._serialized];
        const myMessages = chatStats2?.users[userId] || 0;
        message.reply(`📊 *Your Statistics*\n\n*Messages Sent:* ${myMessages}`);
        break;

      // ===== REMINDERS =====
      case 'reminder':
        if (!args[0] || !args[1]) {
          return message.reply('❌ Usage: `!reminder <minutes> <message>`\n\nExample: `!reminder 5 Buy milk`');
        }
        const minutes = parseInt(args[0]);
        const reminderMsg = args.slice(1).join(' ');
        const delayMs = minutes * 60000;
        
        if (isNaN(minutes) || minutes <= 0) {
          return message.reply('❌ Please provide a valid number of minutes');
        }
        
        const result = setReminder(userId, reminderMsg, delayMs);
        message.reply(result);
        break;

      // ===== POLLS =====
      case 'poll':
        if (!args[0]) {
          return message.reply('❌ Usage: `!poll <title> | <option1> | <option2>`\n\nExample: `!poll Best color | Red | Blue | Green`');
        }
        const pollArgs = message.body.slice(PREFIX.length + command.length).trim().split('|');
        const pollTitle = pollArgs[0].trim();
        const pollOptions = pollArgs.slice(1).map(o => o.trim());
        
        const pollText = createPoll(pollTitle, pollOptions);
        message.reply(pollText);
        break;

      // ===== QUOTES =====
      case 'quote':
        const quote = getRandomQuote();
        message.reply(quote);
        break;

      // ===== CALCULATOR =====
      case 'calc':
        if (!args[0]) {
          return message.reply('❌ Usage: `!calc <expression>`\n\nExample: `!calc 2+2*5`');
        }
        const expression = args.join('');
        const result2 = eval_math(expression);
        message.reply(`🧮 *Calculation*\n\n*Expression:* ${expression}\n*Result:* ${result2}`);
        break;

      // ===== DICE ROLL =====
      case 'dice':
        const sides = parseInt(args[0]) || 6;
        const roll = Math.floor(Math.random() * sides) + 1;
        message.reply(`🎲 You rolled a **${roll}** on a ${sides}-sided die`);
        break;

      // ===== COIN FLIP =====
      case 'coin':
        const flip = Math.random() < 0.5 ? 'Heads' : 'Tails';
        message.reply(`🪙 ${flip}!`);
        break;

      // ===== TEXT EFFECTS =====
      case 'bold':
        if (!args[0]) return message.reply('❌ Usage: `!bold <text>`');
        message.reply(`*${args.join(' ')}*`);
        break;

      case 'italic':
        if (!args[0]) return message.reply('❌ Usage: `!italic <text>`');
        message.reply(`_${args.join(' ')}_`);
        break;

      case 'code':
        if (!args[0]) return message.reply('❌ Usage: `!code <text>`');
        message.reply("```" + args.join(' ') + "```");
        break;

      case 'strikethrough':
        if (!args[0]) return message.reply('❌ Usage: `!strikethrough <text>`');
        message.reply(`~${args.join(' ')}~`);
        break;

      // ===== DICTIONARY =====
      case 'define':
        if (!args[0]) return message.reply('❌ Usage: `!define <word>`');
        // Simulated dictionary
        const definitions = {
          'bot': 'An automated program that performs tasks',
          'ai': 'Artificial Intelligence - computer simulation of human intelligence',
          'code': 'Instructions written in a programming language'
        };
        const word = args[0].toLowerCase();
        const definition = definitions[word] || '❌ Word not found';
        message.reply(`📖 *${word}*\n\n${definition}`);
        break;

      // ===== WEATHER (SIMULATED) =====
      case 'weather':
        if (!args[0]) return message.reply('❌ Usage: `!weather <city>`');
        const temps = [15, 20, 25, 30, 35];
        const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Snowy'];
        const temp = temps[Math.floor(Math.random() * temps.length)];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        message.reply(`🌤️ *Weather in ${args.join(' ')}*\n\n*Condition:* ${condition}\n*Temperature:* ${temp}°C`);
        break;

      // ===== ABOUT BOT =====
      case 'about':
        message.reply(`🤖 *Advanced WhatsApp Bot*\n\n*Version:* 2.0\n*Features:* Statistics, Reminders, Polls, Quotes, Calculator\n*Status:* Active\n*Developer:* Anonymous`);
        break;

      default:
        message.reply(`❌ Unknown command. Type \`!help\` for available commands`);
    }
  } catch (error) {
    console.error('Command error:', error);
    message.reply('❌ An error occurred');
  }
}

// ============================================
// MESSAGE HANDLER
// ============================================

client.on('message', async (message) => {
  const chat = await message.getChat();
  const contact = await message.getContact();
  const userId = contact.id._serialized;
  const chatId = chat.id._serialized;

  // Update statistics
  updateStats(userId, chatId);

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
  console.log('🤖 Advanced WhatsApp Bot is ready!');
  console.log('📝 Prefix: ' + PREFIX);
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
