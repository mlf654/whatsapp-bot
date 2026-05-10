# 🤖 WhatsApp Group Manager Bot

A powerful WhatsApp bot with group management, video download, and PlayStore app search capabilities.

## ✨ Features

### 📹 Video Download
- **YouTube** - Download videos in high quality
- **Instagram** - Download videos and reels
- **TikTok** - Download TikTok videos
- **Auto-compression** - Videos optimized for WhatsApp

### 📱 PlayStore Integration
- Search applications
- Get app information
- Direct PlayStore links

### 👥 Group Management
- Add/remove members
- Promote/demote admins
- Change group name & description
- View members list
- Get group information
- Bot leave group

### ⚙️ Utility Commands
- Ping bot status
- Help menu
- Statistics tracking (Advanced)
- Reminders (Advanced)
- Polls (Advanced)
- Random quotes (Advanced)
- Calculator (Advanced)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ installed
- WhatsApp account
- FFmpeg installed (for video processing)

### Installation

1. **Clone and setup**
```bash
git clone https://github.com/yourusername/whatsapp-bot.git
cd whatsapp-bot
npm install
```

2. **Install system dependencies**

**Ubuntu/Debian:**
```bash
sudo apt-get install -y ffmpeg
pip install yt-dlp
```

**Windows:**
```bash
choco install ffmpeg yt-dlp
```

**macOS:**
```bash
brew install ffmpeg yt-dlp
```

3. **Start the bot**
```bash
npm start
```

4. **Scan QR Code**
- Scan the QR code displayed in terminal with WhatsApp
- Bot will start working!

## 📖 Commands

### Video Download Commands

| Command | Usage | Example |
|---------|-------|----------|
| `!yt` | `!yt <URL>` | `!yt https://youtube.com/watch?v=dQw4w9WgXcQ` |
| `!ig` | `!ig <URL>` | `!ig https://instagram.com/p/ABC123` |
| `!tt` | `!tt <URL>` | `!tt https://tiktok.com/@user/video/123` |

### PlayStore Commands

| Command | Usage | Example |
|---------|-------|----------|
| `!app` | `!app <appName>` | `!app facebook` |
| `!apk` | `!apk <appName>` | `!apk whatsapp` |

### Group Management Commands (Group Only, Bot Must Be Admin)

| Command | Usage | Example |
|---------|-------|----------|
| `!add` | `!add <phone>` | `!add +1234567890` |
| `!remove` | Reply to message | (Reply and type `!remove`) |
| `!promote` | Reply to message | (Reply and type `!promote`) |
| `!demote` | Reply to message | (Reply and type `!demote`) |
| `!setname` | `!setname <name>` | `!setname Cool Group` |
| `!setdesc` | `!setdesc <desc>` | `!setdesc Group description` |
| `!members` | `!members` | (No args needed) |
| `!groupinfo` | `!groupinfo` | (No args needed) |
| `!leave` | `!leave` | (No args needed) |

### Utility Commands

| Command | Usage | Example |
|---------|-------|----------|
| `!ping` | `!ping` | (No args needed) |
| `!help` | `!help` | (No args needed) |

## 🎯 Advanced Features (advanced-bot.js)

Switch to `advanced-bot.js` for additional features:

```bash
node advanced-bot.js
```

### Additional Commands

| Command | Usage | Example |
|---------|-------|----------|
| `!stats` | Group statistics | `!stats` |
| `!mystats` | Your statistics | `!mystats` |
| `!reminder` | `!reminder <minutes> <message>` | `!reminder 5 Buy milk` |
| `!poll` | `!poll <title>\|<option1>\|<option2>` | `!poll Best color\|Red\|Blue` |
| `!quote` | Random motivational quote | `!quote` |
| `!calc` | `!calc <expression>` | `!calc 2+2*5` |
| `!dice` | `!dice [sides]` | `!dice 6` |
| `!coin` | Coin flip | `!coin` |
| `!bold` | Make text bold | `!bold hello` |
| `!italic` | Make text italic | `!italic hello` |
| `!code` | Format as code | `!code hello` |
| `!define` | Define a word | `!define bot` |
| `!weather` | Get weather (simulated) | `!weather London` |
| `!about` | Bot information | `!about` |

## 📦 Deployment

### Heroku Deployment

1. Create Heroku account
2. Install Heroku CLI
3. Push to Heroku:

```bash
heroku login
heroku create your-bot-name
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
git push heroku main
heroku logs --tail
```

### Railway Deployment

1. Go to [railway.app](https://railway.app)
2. Connect GitHub
3. Select repository
4. Auto-deploys!

### Replit Deployment

1. Go to [replit.com](https://replit.com)
2. Click "Import from GitHub"
3. Paste repository URL
4. Click Run

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
BOT_PREFIX=!
BOT_NAME=WhatsApp Bot
DEBUG=true
```

### Rate Limiting

Modify in `bot.js`:

```javascript
const MAX_REQUESTS_PER_MINUTE = 5; // Change this value
```

## 🔒 Security

- ✅ Never commit `.env` files
- ✅ Use environment variables for sensitive data
- ✅ Keep dependencies updated
- ✅ Don't share bot session files
- ✅ Rate limiting enabled

## 📋 Important Notes

⚠️ **WhatsApp Terms of Service:**
Using automated bots on WhatsApp violates their Terms of Service. Use at your own risk and for personal use only.

⚠️ **Limitations:**
- Bot must be admin to manage groups
- Some features depend on internet connectivity
- Large files may take time to process

## 🛠️ Troubleshooting

### Bot not responding
- Check internet connection
- Restart bot: `npm start`
- Check if bot is in group

### Video download fails
- Verify FFmpeg is installed: `ffmpeg -version`
- Check URL is valid
- Try different video URL

### Group commands not working
- Ensure bot is admin
- Check bot has necessary permissions
- Verify group is not restricted

## 📝 Logs

Botinstance logs are displayed in terminal. For persistent logs:

```bash
npm start > bot.log 2>&1
```

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

Your Name - [@yourusername](https://github.com/yourusername)

## 💬 Support

For issues and questions:
1. Check [troubleshooting section](#troubleshooting)
2. Open a GitHub issue
3. Check existing issues for solutions

---

**Made with ❤️ for WhatsApp automation enthusiasts**
