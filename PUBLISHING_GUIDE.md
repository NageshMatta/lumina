# Publishing Lumina to Chrome Web Store & Microsoft Edge Add-ons

This guide walks you through publishing your extension to both stores so others can install it.

## 🎯 Overview

- **Chrome Web Store**: $5 one-time registration fee
- **Microsoft Edge Add-ons**: Free, no registration fee
- **Review Time**: 1-3 days for Chrome, 1-7 days for Edge
- **Extension works on**: Chrome, Edge, Brave, Opera, and other Chromium browsers

---

## 📋 Before You Start

### Required Items Checklist

- [ ] Extension files ready (in `/extension` folder)
- [ ] Privacy Policy (see below)
- [ ] Screenshots (1280x800 or 640x400 pixels)
- [ ] Promotional images (optional but recommended)
- [ ] Store listing description
- [ ] Google account (for Chrome Web Store)
- [ ] Microsoft account (for Edge Add-ons)
- [ ] Credit card ($5 for Chrome Web Store registration)

---

## 🏪 PART 1: Publishing to Chrome Web Store

### Step 1: Create Developer Account

1. **Go to Chrome Web Store Developer Dashboard**
   - Visit: https://chrome.google.com/webstore/devconsole
   - Sign in with your Google account

2. **Pay Registration Fee**
   - One-time fee: **$5 USD**
   - Click "Pay this fee now"
   - Complete payment with credit card

3. **Accept Developer Agreement**
   - Read and accept the terms
   - Your account is now active!

### Step 2: Package Your Extension

1. **Open your extension folder** (`/lumina/extension`)

2. **Remove any test files** (if any)

3. **Create a ZIP file**:
   ```bash
   cd /path/to/lumina/extension
   zip -r lumina-extension.zip .
   ```

   Or on Windows:
   - Select all files in `/extension` folder
   - Right-click → Send to → Compressed (zipped) folder
   - Name it `lumina-extension.zip`

   **IMPORTANT**: Zip the *contents* of the extension folder, not the folder itself.
   The ZIP should contain: manifest.json, background.js, content.js, etc. at the root level.

### Step 3: Create Store Listing

1. **Go to Chrome Web Store Dashboard**
   - Click "New Item"

2. **Upload ZIP file**
   - Upload `lumina-extension.zip`
   - Wait for upload to complete

3. **Fill in Product Details**

   **Product name**: `Lumina - AI Study Buddy`

   **Summary** (132 characters max):
   ```
   Your Socratic AI tutor that guides you to discover answers yourself through smart questions, not direct answers.
   ```

   **Description** (detailed, up to 16,000 characters):
   ```
   ## Transform Learning with Lumina 🌟

   Lumina is your personal AI study companion that helps you truly understand concepts through guided discovery. Unlike ChatGPT or other AI tools that give you direct answers, Lumina acts as a Socratic tutor - asking strategic questions that help you figure things out yourself.

   ## Why Lumina?

   **Real Learning Happens Through Discovery**
   - Research shows: Students remember 70% when they discover answers vs. 20% when told directly
   - Lumina never gives you the answer - it guides you to find it yourself
   - Perfect for homework help without doing the work for you

   **Smart, Not Tedious**
   - Provides research links for factual questions (presidents, dates, definitions)
   - Efficient guidance (2-3 exchanges, not 10)
   - Adapts to your needs - more help when stuck, more challenge when you're progressing

   **Conversation Continues**
   - Persistent context across browser restarts
   - Full conversation history stored
   - Pick up exactly where you left off

   ## Perfect For

   - 📚 **Homework Help**: Get unstuck without getting answers handed to you
   - ✍️ **Essay Writing**: Brainstorm ideas, organize thoughts, improve arguments
   - 🧮 **Math & Science**: Understand concepts, not just memorize procedures
   - 📖 **Reading Comprehension**: Deeper analysis and interpretation
   - 🤔 **Critical Thinking**: Develop problem-solving skills

   ## Key Features

   ✅ Socratic tutoring approach
   ✅ Research resources for factual questions
   ✅ Conversation history & persistence
   ✅ Works on any webpage
   ✅ Highlight text to ask questions about it
   ✅ Clean, distraction-free sidebar
   ✅ No data collection - your learning is private

   ## How It Works

   1. **Highlight & Ask**: Select text on any webpage, right-click, "Ask Lumina about this"
   2. **Get Guided**: Lumina asks questions to guide your thinking
   3. **Discover**: Figure out the answer yourself with strategic help
   4. **Learn**: Remember it because you discovered it, not because you were told

   ## Privacy & Safety

   - No personal data collected
   - Conversations linked to access code only
   - Educational focus - age-appropriate content
   - Safe for students aged 13-16

   ## Getting Started

   1. Install the extension
   2. Click the Lumina icon
   3. Enter your access code (get from teacher/parent)
   4. Start learning!

   Transform your study sessions from passive answer-seeking to active discovery. Install Lumina and experience learning that actually sticks!
   ```

   **Category**: Education

   **Language**: English

4. **Add Screenshots** (Required: at least 1, recommended: 3-5)

   **Screenshot Requirements**:
   - Size: 1280x800 or 640x400 pixels
   - Format: PNG or JPEG
   - Show the extension in action

   **Recommended Screenshots**:
   1. Extension popup showing welcome screen
   2. Chat conversation in action
   3. Highlight text context menu
   4. Example of Socratic questioning
   5. Research links being provided

5. **Add Promotional Tile** (Optional but recommended)
   - Size: 440x280 pixels
   - Shows up in store promotions

6. **Add Small Tile** (Required for featured placement)
   - Size: 128x128 pixels

7. **Privacy Policy** (REQUIRED)
   - See "Privacy Policy Template" section below
   - Upload to a public URL (can use GitHub Pages)
   - Add URL to the privacy policy field

### Step 4: Set Distribution

1. **Visibility**:
   - Choose "Public" (anyone can find and install)
   - Or "Unlisted" (only people with the link can install)

2. **Regions**:
   - Select all regions or specific countries

3. **Pricing**: Free

### Step 5: Submit for Review

1. **Click "Submit for Review"**
2. **Wait for Review** (typically 1-3 days)
3. **Check Email** for approval or feedback
4. **Go Live!** Once approved, your extension is public!

---

## 🔷 PART 2: Publishing to Microsoft Edge Add-ons

### Step 1: Create Developer Account

1. **Go to Partner Center**
   - Visit: https://partner.microsoft.com/dashboard/microsoftedge/overview
   - Sign in with Microsoft account

2. **Register as Developer**
   - Fill in developer information
   - **No fee required!** (Free)
   - Accept agreement

### Step 2: Submit Extension

1. **Click "Create New Extension"**

2. **Upload the same ZIP file**
   - Use `lumina-extension.zip` from earlier
   - Wait for validation

3. **Fill in Submission Details**

   **Display Name**: `Lumina - AI Study Buddy`

   **Short Description** (132 characters):
   ```
   Socratic AI tutor that guides learning through questions, not answers. Smart help for homework without doing it for you.
   ```

   **Detailed Description**:
   - Use the same detailed description from Chrome Web Store above

   **Category**: Education & reference

   **Language**: English

4. **Add Privacy Policy**
   - Use same URL from Chrome Web Store

5. **Add Screenshots**
   - Use same screenshots from Chrome Web Store

6. **Maturity Rating**:
   - Choose "E - Everyone"

7. **Support Contact**:
   - Add your email for user support

### Step 3: Submit for Certification

1. **Click "Submit"**
2. **Wait for Review** (1-7 days)
3. **Check Partner Center** for certification status
4. **Go Live!** Once certified

---

## 📄 Privacy Policy Template

Create a simple privacy policy and host it on GitHub Pages or your own website.

**File: `privacy-policy.html`**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Lumina Privacy Policy</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { color: #f59e0b; }
        h2 { color: #d97706; margin-top: 30px; }
    </style>
</head>
<body>
    <h1>Lumina - AI Study Buddy Privacy Policy</h1>
    <p><strong>Last Updated:</strong> December 2024</p>

    <h2>Information We Collect</h2>
    <p>Lumina collects minimal information necessary to provide tutoring services:</p>
    <ul>
        <li><strong>Access Code</strong>: Used to authenticate and track your learning sessions</li>
        <li><strong>Conversation History</strong>: Your questions and our responses are stored to maintain context across sessions</li>
        <li><strong>Session Data</strong>: Timestamps and conversation metadata for your learning profile</li>
    </ul>

    <h2>What We Do NOT Collect</h2>
    <ul>
        <li>No personal information (name, email, phone number)</li>
        <li>No location tracking or browsing history</li>
        <li>No data is sold to third parties</li>
        <li>No advertising or tracking cookies</li>
    </ul>

    <h2>How We Use Your Information</h2>
    <ul>
        <li>Maintain conversation context across sessions</li>
        <li>Improve tutoring quality through learning pattern analysis</li>
        <li>Generate anonymized insights about educational effectiveness</li>
    </ul>

    <h2>Data Storage & Security</h2>
    <ul>
        <li>Data stored securely in MongoDB Atlas with encryption</li>
        <li>API communications encrypted with HTTPS</li>
        <li>Access code-based authentication (no passwords)</li>
    </ul>

    <h2>Third-Party Services</h2>
    <p>Lumina uses the following third-party services:</p>
    <ul>
        <li><strong>Anthropic Claude API</strong>: AI language model for generating responses</li>
        <li><strong>MongoDB Atlas</strong>: Database for conversation storage</li>
        <li><strong>Railway</strong>: Backend hosting service</li>
    </ul>

    <h2>Data Retention</h2>
    <ul>
        <li>Active conversations: Retained indefinitely for learning continuity</li>
        <li>Inactive sessions: May be archived after extended periods</li>
        <li>You can request data deletion by contacting support</li>
    </ul>

    <h2>Children's Privacy</h2>
    <p>Lumina is designed for students aged 13-16. We do not knowingly collect personal information from children under 13 without parental consent.</p>

    <h2>Your Rights</h2>
    <p>You have the right to:</p>
    <ul>
        <li>Request access to your conversation data</li>
        <li>Request deletion of your data</li>
        <li>Opt-out of data collection (note: this limits functionality)</li>
    </ul>

    <h2>Changes to This Policy</h2>
    <p>We may update this privacy policy from time to time. We will notify users of significant changes through the extension.</p>

    <h2>Contact Us</h2>
    <p>For questions about privacy or data handling:</p>
    <p>Email: [YOUR_EMAIL]</p>

    <hr>
    <p><em>By using Lumina, you agree to this Privacy Policy.</em></p>
</body>
</html>
```

**To Host on GitHub Pages:**
1. Add this file to your repository
2. Enable GitHub Pages in repo settings
3. URL will be: `https://yourusername.github.io/lumina/privacy-policy.html`

---

## 📸 Creating Screenshots

### Tools
- **Built-in**: Use browser screenshot tool (Ctrl+Shift+S in Firefox, Extensions → Screenshot in Chrome)
- **Recommended**: ShareX (Windows), Skitch (Mac), Flameshot (Linux)

### What to Capture
1. **Extension popup** with welcome screen
2. **Sidebar open** showing a conversation
3. **Context menu** (right-click on highlighted text)
4. **Example conversation** showing Socratic questions
5. **Research links** being provided

### Tips
- Use 1280x800 resolution
- Show real usage scenarios
- Keep it clean and focused
- Highlight key features with arrows/circles
- Show the "aha moment" of learning

---

## ✅ Pre-Submission Checklist

Before submitting, verify:

- [ ] TEST_MODE is set to `false` in background.js
- [ ] Railway backend is deployed and working
- [ ] MongoDB is connected successfully
- [ ] Extension version number is correct (2.0.2)
- [ ] All features tested and working
- [ ] Icons are high quality (16px, 48px, 128px)
- [ ] Privacy policy is hosted and accessible
- [ ] Screenshots are ready (1280x800 PNG)
- [ ] Store descriptions are compelling
- [ ] No console errors in extension
- [ ] Works on clean install

---

## 🚀 After Publication

### Monitoring
- Check Chrome Web Store Developer Dashboard for:
  - Number of installs
  - User reviews and ratings
  - Crash reports

### Updates
When you make changes:
1. Increment version number in `manifest.json`
2. Create new ZIP file
3. Upload to Chrome Web Store
4. Submit for review (usually faster than initial review)
5. Edge will auto-sync from Chrome Store if you enable it

### User Support
- Monitor reviews for feedback
- Respond to user questions
- Fix reported bugs quickly

---

## 💡 Tips for Success

1. **Good Screenshots**: Show the extension doing something useful
2. **Clear Description**: Focus on benefits, not features
3. **Keywords**: Use "study", "homework", "tutor", "learning", "education"
4. **Regular Updates**: Show active development
5. **Respond to Reviews**: Engage with users
6. **Promote**: Share on social media, education forums

---

## 📊 Store Optimization

### Chrome Web Store
- **Title**: Keep it under 45 characters
- **Screenshots**: 5 is optimal
- **Weekly updates**: Shows active maintenance
- **Good ratings**: Encourage satisfied users to review

### Microsoft Edge
- **Keyword optimization**: Use all available character space
- **Regular updates**: Sync automatically from Chrome

---

## 🛟 Troubleshooting

**Extension rejected for policy violation:**
- Review Chrome Web Store policies: https://developer.chrome.com/docs/webstore/program-policies/
- Common issues: Privacy policy missing, permissions too broad, misleading description

**Extension not working after installation:**
- Test on clean Chrome profile
- Check API_BASE_URL is correct
- Verify Railway backend is running
- Check MongoDB connection

**Low install numbers:**
- Improve screenshots
- Better description/keywords
- Promote to target audience (students, teachers)
- Get reviews from beta testers

---

## 📚 Resources

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Microsoft Edge Add-ons Documentation](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [Extension Best Practices](https://developer.chrome.com/docs/extensions/mv3/quality_guidelines/)

---

Good luck with your publication! 🎉
