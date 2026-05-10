# 🚀 Complete Installation Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Installation](#local-installation)
3. [Cloud Deployment](#cloud-deployment)
4. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

#### Node.js 20+
- **Windows/macOS:** Download from [nodejs.org](https://nodejs.org/)
- **Linux:** 
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

#### FFmpeg (Video Processing)

**Windows (Chocolatey):**
```bash
choco install ffmpeg
```

**macOS (Homebrew):**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get install -y ffmpeg
```

#### yt-dlp (Video Downloader)

**All Systems:**
```bash
pip install yt-dlp
```

If pip not installed:
- **Windows:** Download Python from [python.org](https://python.org)
- **Linux/macOS:** `sudo apt-get install python3-pip` or `brew install python3`

---

## Local Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/mlf654/whatsapp-bot.git
cd whatsapp-bot
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- whatsapp-web.js (WhatsApp client)
- axios (HTTP requests)
- cheerio (HTML parsing)
- dotenv (Environment variables)
- And others

### Step 3: Environment Setup

```bash
cp .env.example .env
```

Edit `.env` if needed:
```env
BOT_PREFIX=!
BOT_NAME=WhatsApp Bot
DEBUG=true
```

### Step 4: Start Bot

```bash
npm start
```

### Step 5: Scan QR Code

1. A QR code will appear in terminal
2. Open WhatsApp on your phone
3. Go to Settings → Linked Devices → Link a Device
4. Scan the QR code
5. Bot is now ready!

---

## Cloud Deployment

### Option 1: Heroku (Recommended)

#### Setup

1. **Create Heroku Account**
   - Go to [heroku.com](https://heroku.com)
   - Sign up (free account works)

2. **Install Heroku CLI**
   - Download from [heroku.com/cli](https://devcenter.heroku.com/articles/heroku-cli)

3. **Login to Heroku**
   ```bash
   heroku login
   ```

4. **Create Heroku App**
   ```bash
   heroku create your-bot-name
   ```

5. **Add Buildpacks** (for FFmpeg and Python)
   ```bash
   heroku buildpacks:add heroku/nodejs
   heroku buildpacks:add https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
   heroku buildpacks:add https://github.com/wei/heroku-buildpack-python.git
   ```

6. **Push to Heroku**
   ```bash
   git push heroku main
   ```

7. **View Logs**
   ```bash
   heroku logs --tail
   ```

#### Get Session ID

After first run:
```bash
heroku logs --tail
```
Scan the QR code shown in logs with WhatsApp

---

### Option 2: Railway

#### Setup

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "Create New Project"
   - Select "GitHub Repo"
   - Authorize Railway to access GitHub
   - Select `whatsapp-bot` repository

3. **Configure Variables**
   - Add environment variables if needed
   - Railway auto-detects Node.js

4. **Deploy**
   - Click "Deploy"
   - Railway automatically deploys!

#### Get Session

1. Go to project logs
2. Scan QR code displayed
3. Bot runs on Railway servers

---

### Option 3: Replit

#### Setup

1. **Go to Replit**
   - Visit [replit.com](https://replit.com)
   - Sign up or login

2. **Create New Repl**
   - Click "Create" → "Import from GitHub"
   - Paste: `https://github.com/mlf654/whatsapp-bot`
   - Click "Import"

3. **Install Dependencies**
   - Click "Run"
   - Replit auto-installs from `package.json`

4. **Scan QR Code**
   - QR code appears in output
   - Scan with WhatsApp

---

### Option 4: DigitalOcean App Platform

1. **Create DigitalOcean Account**
   - Go to [digitalocean.com](https://digitalocean.com)
   - Create account

2. **Create App**
   - Go to "Apps"
   - Click "Create App"
   - Select GitHub
   - Choose `whatsapp-bot` repository

3. **Configure**
   - Keep default settings
   - Click "Create Resources"
   - Deploy starts automatically

---

## Troubleshooting

### Issue: "FFmpeg not found"

**Solution:**
```bash
# Verify installation
ffmpeg -version

# If not installed, reinstall
# Windows: choco install ffmpeg
# macOS: brew install ffmpeg  
# Linux: sudo apt-get install ffmpeg
```

### Issue: "node_modules missing"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "QR code won't scan"

**Solution:**
- Clear old session: Delete `.wwebjs_auth/` folder
- Restart bot: `npm start`
- Use good lighting to scan QR
- Use WhatsApp linked devices feature

### Issue: "Bot doesn't respond"

**Solution:**
- Check bot is in the group
- Verify command starts with `!` (default prefix)
- Check internet connection
- Restart bot

### Issue: "Video download fails"

**Solution:**
- Verify FFmpeg: `ffmpeg -version`
- Check yt-dlp: `yt-dlp --version`
- Try different URL
- Check file size limits

### Issue: "Port already in use"

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000  # Linux/macOS
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows
```

### Issue: "Module not found"

**Solution:**
```bash
npm install
npm audit fix
```

---

## Development

### Run in Development Mode

```bash
npm run dev
```
This uses `nodemon` for auto-restart on changes

### Debug Mode

In `.env`:
```env
DEBUG=true
```

This shows detailed logs

### Test Commands

In private chat with bot:
```
!help
!ping
!calc 2+2
```

---

## Next Steps

1. ✅ Read [README.md](README.md) for command guide
2. ✅ Customize bot in `bot.js`
3. ✅ Add bot to groups
4. ✅ Test commands
5. ✅ Deploy to cloud

---

## Support

If you encounter issues:
1. Check this guide
2. Check bot logs
3. Open GitHub issue
4. Check existing issues

---

**Happy botting! 🤖**
