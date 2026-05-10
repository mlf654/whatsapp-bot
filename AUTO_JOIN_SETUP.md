# 🔥 Auto-Join Group Feature

Your WhatsApp bot is now configured to **automatically join your group** when the bot connects!

## ⚙️ Current Configuration

**Group Invite Link:**
```
https://chat.whatsapp.com/H8mZ48R8fqV1g0MOAFirNf
```

**Status:** ✅ Active and configured in `bot.js`

## 🚀 How It Works

1. **Bot Starts** → `npm start`
2. **You Scan QR Code** → With WhatsApp
3. **Bot Gets Ready** → Connection established
4. **Auto-Join Activates** → Bot automatically joins your group
5. **Welcome Message** → Bot sends welcome message with available commands

## 📋 Welcome Message Sent

When the bot joins, it automatically sends:

```
🤖 Welcome to WhatsApp Bot!

Hello everyone! 👋 I'm your automated bot assistant.

📹 I can help you with:
• Download videos from YouTube, Instagram, TikTok
• Search apps on PlayStore
• Manage group settings
• And much more!

Quick Commands:
!help - Show all available commands
!ping - Check if bot is running
!yt <URL> - Download YouTube videos
!ig <URL> - Download Instagram videos
!tt <URL> - Download TikTok videos
!app <name> - Search PlayStore

Type !help in the group to see all commands! 💬
```

## 🔄 Change Group Link

To change which group the bot joins:

### Option 1: Edit `bot.js`

Find this line (around line 27):
```javascript
const GROUP_INVITE_LINK = 'https://chat.whatsapp.com/H8mZ48R8fqV1g0MOAFirNf';
```

Replace with your new group link:
```javascript
const GROUP_INVITE_LINK = 'https://chat.whatsapp.com/YOUR_NEW_LINK_HERE';
```

Then restart: `npm start`

### Option 2: Use Environment Variable (Recommended)

Edit `.env` file:
```env
GROUP_INVITE_LINK=https://chat.whatsapp.com/YOUR_NEW_LINK_HERE
```

Then modify `bot.js` line 27:
```javascript
const GROUP_INVITE_LINK = process.env.GROUP_INVITE_LINK || 'https://chat.whatsapp.com/H8mZ48R8fqV1g0MOAFirNf';
```

## ✅ Features Included

- ✅ Automatic group join on startup
- ✅ Welcome message with commands
- ✅ Error handling if link is invalid
- ✅ Tracks joined groups
- ✅ 2-second delay before joining (to ensure connection is stable)

## 📞 Troubleshooting

### Bot Doesn't Join Group

**Issue:** Group link might be invalid or expired

**Solution:**
1. Get a fresh group invite link from your group
2. Make sure the link is active (not expired)
3. Update the link in `bot.js`
4. Restart bot: `npm start`

### Bot Joins But No Welcome Message

**Solution:**
1. Check if bot has message sending permissions
2. Manually give bot admin rights temporarily
3. Restart bot

### Multiple Instances Joining

**Solution:**
1. Stop all bot instances: `Ctrl+C`
2. Delete `.wwebjs_auth/` folder
3. Start fresh: `npm start`

## 🔐 Security Notes

- ✅ Group link is stored in code (safe)
- ✅ No sensitive data exposed
- ✅ Group link can be changed anytime
- ✅ Bot only joins one group (configurable)

## 📲 Get New Group Invite Link

**Steps:**
1. Open WhatsApp
2. Go to your group
3. Tap group name → Info icon
4. Scroll down → "Invite to Group via Link"
5. Click "Copy Link"
6. Update in `bot.js` or `.env`

---

**Your bot is ready to join and serve your group! 🚀**
