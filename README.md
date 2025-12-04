# ✨ Lumina - AI Study Buddy

**Lumina** is an AI-powered browser extension that helps students (ages 13-16) learn through guided discovery. Unlike typical AI assistants, Lumina **never gives direct answers** — instead, it uses the Socratic method to help students figure things out themselves.

> *"Lumina"* means "light" in Latin — illuminating the path to understanding.

![Lumina Demo](docs/demo.gif)

## 🎯 How It Works

1. Student highlights text or asks a question
2. Lumina asks guiding questions instead of giving answers
3. Student thinks, responds, and discovers the answer themselves
4. Real learning happens! 🧠

**Example:**
```
Student: How do I solve 2x + 5 = 13?

Lumina: Good equation to work with! Our goal is to get x alone. 
        Looking at the left side, what's "in the way" of x being by itself?
```

## 📦 Project Structure

```
lumina/
├── backend/          # Node.js API server
│   ├── server.js     # Express server with Claude integration
│   ├── package.json
│   └── .env.example
│
├── extension/        # Chrome/Edge extension
│   ├── manifest.json
│   ├── background.js # Service worker
│   ├── content.js    # Sidebar injection
│   ├── popup.html/js # Settings UI
│   ├── styles/
│   └── icons/
│
└── docs/             # Documentation & assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Claude API key from [console.anthropic.com](https://console.anthropic.com)
- Chrome or Edge browser

### 1. Deploy the Backend

**Option A: Railway (Recommended)**

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. Connect your GitHub repo
2. Add environment variables:
   - `CLAUDE_API_KEY` = your Claude API key
   - `ACCESS_CODES` = comma-separated codes (e.g., `LUMINA2024,SPARK2024`)
3. Deploy!

**Option B: Local Development**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API key
npm run dev
```

### 2. Update Extension

Edit `extension/background.js` and update the API URL:
```javascript
const API_BASE_URL = 'https://your-app.railway.app'; // Your deployed URL
```

### 3. Load the Extension

1. Open Chrome → `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` folder

### 4. Test It!

1. Click the Lumina icon
2. Enter an access code (e.g., `LUMINA2024`)
3. Press `Ctrl+Shift+L` on any page to open Lumina

## 🔐 Access Codes

Access codes control who can use Lumina. Set them in your backend's environment:

```env
ACCESS_CODES=LUMINA2024,CLASS101,MATHTEAM
```

- Share codes with students/families
- Change codes anytime to revoke access
- Each code is case-insensitive

## 🛠️ Configuration

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CLAUDE_API_KEY` | Your Anthropic API key | `sk-ant-api03-...` |
| `ACCESS_CODES` | Comma-separated access codes | `CODE1,CODE2,CODE3` |
| `PORT` | Server port (auto-set by Railway) | `3000` |

### Customizing the Tutor

The Socratic tutoring behavior is defined in `backend/server.js` in the `SYSTEM_PROMPT` constant. Customize it to:
- Adjust tone for different age groups
- Add subject-specific guidance
- Modify response length/style

## 📱 Chrome Web Store Publishing

Ready to publish? Here's what you need:

1. **Developer Account**: $5 one-time fee at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

2. **Required Assets**:
   - 128x128 icon (included)
   - 1280x800 screenshot
   - 440x280 small promo tile
   - Detailed description
   - Privacy policy URL

3. **Privacy Policy**: Create one that explains:
   - Data collected (conversation content)
   - How it's processed (sent to your server → Claude)
   - No data sold or shared

## 🔒 Security Notes

- API key is stored on your server, never in the extension
- Access codes are validated server-side
- Rate limiting prevents abuse (60 req/min)
- Conversations are ephemeral (cleared after 1 hour)

For production, consider adding:
- [ ] Database for conversation history
- [ ] User analytics
- [ ] Usage quotas per access code
- [ ] Admin dashboard

## 🤝 Contributing

This is an MVP. Contributions welcome for:
- Additional subject support
- UI/UX improvements
- LMS integrations (Canvas, Google Classroom)
- Mobile app versions
- Accessibility improvements

## 📄 License

MIT License - feel free to use and modify!

## 🙏 Acknowledgments

Built with:
- [Claude](https://anthropic.com) - AI that guides, not gives
- [Express](https://expressjs.com) - Backend framework
- [Railway](https://railway.app) - Easy deployment

---

**Questions?** Open an issue or reach out!

*Made with ✨ for student learning*
