# Local Testing Guide for Lumina v2.1.0

This guide helps you test the new **Inquiry-Based Scaffolding** feature locally before deploying to Railway.

## Setup Steps

### 1. Configure Backend Environment

Edit `/home/user/lumina/backend/.env` and add your Claude API key:

```bash
CLAUDE_API_KEY=sk-ant-api03-your-actual-key-here
```

### 2. Install Dependencies (if needed)

```bash
cd /home/user/lumina/backend
npm install
```

### 3. Start Local Backend Server

```bash
cd /home/user/lumina/backend
npm start
```

You should see:
```
✨ Lumina server running on port 3000
```

Leave this terminal running!

### 4. Load Test Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select folder: `/home/user/lumina/extension-local-test`
6. The extension will appear with localhost backend configured

### 5. Test the New Scaffolding

Click the Lumina extension icon and try these research questions:

**Science Test:**
- "What is a predator?"
- Expected: 3-step scaffolding (Define → Contextualize → Differentiate)

**History Test:**
- "What caused the French Revolution?"
- Expected: Define ancien régime → Identify factors → Compare to American Revolution

**Literature Test:**
- "What is the theme of The Giver?"
- Expected: State theme → Find quote → Differentiate theme vs plot

**Biology Test:**
- "What is mitochondria?"
- Expected: Define function → Compare cell types → What if they stopped working

### 6. What to Check

✅ **Does Lumina ask you to search and paste results?**
- Old way: Gives you links and loses control
- New way: Asks you to search, then paste YOUR summary

✅ **Does it guide through 3 steps?**
- Step 1: Define/Research basic fact
- Step 2: Contextualize with examples
- Step 3: Critical thinking question (differentiate/compare)

✅ **Does it wait for your response at each step?**
- Should not dump all 3 steps at once
- Should acknowledge your answer before moving to next step

### 7. Access Code

Use: `LUMINA2024` or `TEST2024`

## Deploy to Railway

Once local testing is successful:

### Option 1: Merge to Main (Recommended)

```bash
cd /home/user/lumina
git checkout main
git merge claude/testing-mirt73eilibjd5ut-01NSHnSbU88CAv12F9WB9Ecg
git push origin main
```

Railway will auto-deploy from main branch.

### Option 2: Update Railway Branch

In Railway dashboard:
1. Go to Settings
2. Change deployment branch to `claude/testing-mirt73eilibjd5ut-01NSHnSbU88CAv12F9WB9Ecg`
3. Trigger manual deploy

## Troubleshooting

**Error: "Invalid access code"**
- Check that backend/.env has `ACCESS_CODES=LUMINA2024`
- Restart backend server after changing .env

**Error: "Failed to fetch"**
- Make sure backend is running on port 3000
- Check Chrome console for CORS errors
- Verify extension background.js points to `http://localhost:3000`

**Backend won't start**
- Run `npm install` in backend folder
- Check that .env file has CLAUDE_API_KEY set
- Make sure port 3000 is not already in use

**Extension not working**
- Go to chrome://extensions/
- Check for errors under the Lumina extension
- Click "Reload" on the extension
- Open browser console (F12) and check for errors

## Files Changed in v2.1.0

- `backend/server.js` - New SYSTEM_PROMPT with Inquiry-Based Scaffolding
- `extension/manifest.json` - Version bumped to 2.1.0

## Next Steps After Testing

1. ✅ Verify scaffolding works locally
2. 🚀 Deploy to Railway (merge to main)
3. 📦 Upload v2.1.0 to Chrome Web Store
4. 🎉 Publish!
