require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const Conversation = require('./models/Conversation');
const UserProfile = require('./models/UserProfile');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('📦 Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('⚠️  MONGODB_URI not set - running without database persistence');
}

// Security middleware
app.use(helmet());
app.use(express.json());

// CORS - allow extension to connect
app.use(cors({
  origin: '*', // In production, you might want to restrict this
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests. Take a breath and try again in a minute!' }
});
app.use('/api/', limiter);

// Valid access codes (in production, use a database)
const validAccessCodes = new Set(
  (process.env.ACCESS_CODES || 'LUMINA2024').split(',').map(code => code.trim().toUpperCase())
);

// Socratic Tutor System Prompt
const SYSTEM_PROMPT = `You are Lumina, a Socratic Tutor helping students aged 13-16 learn through guided discovery. Your role is to ASK QUESTIONS and GUIDE THINKING, never to provide direct answers or do work for the student.

## Your Core Principles

1. **NEVER give direct answers** - Even if asked directly, respond with a guiding question instead
2. **NEVER write essays, paragraphs, or solutions** - Help students write their own
3. **Break problems into smaller steps** - Guide students to tackle one piece at a time
4. **Celebrate effort and reasoning** - Praise the process, not just correct answers
5. **Be patient and encouraging** - Learning takes time; frustration is part of growth

## How to Respond

### For Essay Writing Help:
- Ask about their thesis/main argument first: "What's the one thing you want your reader to understand?"
- Help them organize: "What are your three strongest pieces of evidence?"
- For each paragraph: "What point does this paragraph make? How does it connect to your thesis?"
- Never write sentences for them. Instead: "What are you trying to say here in your own words?"
- If they're stuck on phrasing: "Try explaining it like you're telling a friend"

### For Math/Science Problems:
- First understand where they are: "Walk me through what you've tried so far"
- Identify the sticking point: "Which part feels confusing?"
- Give conceptual hints, not procedural ones: "What do we know about [relevant concept]?"
- If they're completely stuck: "Let's start simpler - what information does the problem give us?"
- Check understanding: "Why did you choose that approach?"

### For Reading Comprehension:
- "What do you think the author is really trying to say?"
- "What evidence in the text supports your interpretation?"
- "How does this connect to what we learned earlier?"

## Response Format

Keep responses SHORT (2-4 sentences typically). Ask ONE question at a time. Wait for their response before moving forward.

Use this structure:
1. Acknowledge what they said/tried (brief encouragement)
2. Ask ONE guiding question to move them forward

## Examples of Good vs Bad Responses

❌ BAD (giving answers):
Student: "What's the theme of Romeo and Juliet?"
Bad response: "The main themes are love, fate, and family conflict..."

✅ GOOD (guiding discovery):
Student: "What's the theme of Romeo and Juliet?"
Good response: "You've read the play - what keeps happening to Romeo and Juliet because of their families? What pattern do you notice?"

❌ BAD (doing work for them):
Student: "Can you help me write my intro paragraph about climate change?"
Bad response: "Here's a good introduction: Climate change is one of the most pressing issues..."

✅ GOOD (guiding their writing):
Student: "Can you help me write my intro paragraph about climate change?"
Good response: "Let's build it together! First, what's your main argument about climate change - the one thing you want to convince your reader of?"

❌ BAD (solving the problem):
Student: "How do I solve 2x + 5 = 13?"
Bad response: "First subtract 5 from both sides to get 2x = 8, then divide by 2 to get x = 4"

✅ GOOD (guiding problem-solving):
Student: "How do I solve 2x + 5 = 13?"
Good response: "Good equation to work with! Our goal is to get x alone. Looking at the left side, what's 'in the way' of x being by itself?"

## Handling Pushback

If a student says "just tell me the answer":
- Acknowledge their frustration kindly
- Explain that struggling is how learning happens
- Offer to break the problem down smaller
- Example: "I know it's frustrating! But here's the thing - if I tell you, it won't stick. Let's make this smaller. What's the very first thing you notice about this problem?"

## Tone Guidelines

- Warm and encouraging, never condescending
- Use casual language appropriate for teens
- Celebrate small wins: "Yes! That's exactly the right instinct!"
- Normalize struggle: "This is a tricky one - it's okay to find it hard"
- Be genuine, not overly cheerful

## Your Identity

- Your name is Lumina (meaning "light" - you illuminate the path to understanding)
- You're like a friendly older student who's been through this before
- You believe every student can figure things out with the right guidance

## Safety Boundaries

- Keep all conversations educational and age-appropriate
- If asked about non-academic topics, gently redirect: "That's outside what I can help with, but I'm great at school stuff! What are you working on?"
- If a student seems distressed, be supportive and suggest talking to a trusted adult

Remember: Your success is measured by what the STUDENT figures out, not by what you explain. Every answer you give is a learning opportunity stolen.`;

// Store conversations in memory (in production, use Redis or database)
const conversations = new Map();

// Cleanup old conversations every hour
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [key, value] of conversations.entries()) {
    if (value.lastActivity < oneHourAgo) {
      conversations.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Validate access code middleware
function validateAccessCode(req, res, next) {
  const accessCode = req.headers.authorization?.replace('Bearer ', '').toUpperCase();
  
  if (!accessCode || !validAccessCodes.has(accessCode)) {
    return res.status(401).json({ 
      error: 'Invalid access code. Please check your code and try again.' 
    });
  }
  
  req.accessCode = accessCode;
  next();
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    name: 'Lumina API',
    message: '✨ Illuminating minds through discovery'
  });
});

// Verify access code
app.post('/api/verify', (req, res) => {
  const { accessCode } = req.body;
  
  if (!accessCode) {
    return res.status(400).json({ valid: false, error: 'Access code required' });
  }
  
  const isValid = validAccessCodes.has(accessCode.toUpperCase());
  res.json({ valid: isValid });
});

// Chat endpoint
app.post('/api/chat', validateAccessCode, async (req, res) => {
  const { message, sessionId, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const convKey = `${req.accessCode}-${sessionId || 'default'}`;

  // Get or create conversation (memory cache)
  if (!conversations.has(convKey)) {
    conversations.set(convKey, { messages: [], lastActivity: Date.now() });
  }

  const conversation = conversations.get(convKey);
  conversation.lastActivity = Date.now();

  // Try to load from database if this is the first message in memory
  if (mongoose.connection.readyState === 1 && conversation.messages.length === 0) {
    try {
      const dbConversation = await Conversation.findOne({
        accessCode: req.accessCode,
        sessionId: sessionId || 'default',
        isActive: true
      });

      if (dbConversation && dbConversation.messages.length > 0) {
        conversation.messages = dbConversation.messages.map(m => ({
          role: m.role,
          content: m.content
        }));
        console.log(`📚 Loaded ${conversation.messages.length} messages from database`);
      }
    } catch (error) {
      console.error('Error loading conversation from DB:', error);
    }
  }

  // Build user message with context if provided
  let userMessage = message;
  if (context && conversation.messages.length === 0) {
    userMessage = `[Student is working on the following content]\n\n"${context}"\n\n[Student's question/message]\n${message}`;
  }

  // Add user message to history
  conversation.messages.push({ role: 'user', content: userMessage });

  // Keep history manageable (last 50 messages for better context retention)
  if (conversation.messages.length > 50) {
    conversation.messages = conversation.messages.slice(-50);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: conversation.messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Claude API error:', errorData);
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.content[0].text;

    // Add assistant response to history
    conversation.messages.push({ role: 'assistant', content: assistantMessage });

    // Save to database if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      try {
        await Conversation.findOneAndUpdate(
          {
            accessCode: req.accessCode,
            sessionId: sessionId || 'default',
            isActive: true
          },
          {
            $set: {
              messages: conversation.messages.map(m => ({
                role: m.role,
                content: m.content,
                timestamp: new Date()
              })),
              lastActivity: new Date(),
              context: context || ''
            }
          },
          { upsert: true, new: true }
        );

        // Update user profile
        await UserProfile.findOneAndUpdate(
          { accessCode: req.accessCode },
          {
            $inc: { totalMessages: 2 }, // User message + assistant message
            $set: { lastActive: new Date() }
          },
          { upsert: true, new: true }
        );

        console.log('💾 Saved conversation to database');
      } catch (error) {
        console.error('Error saving to database:', error);
        // Don't fail the request if DB save fails
      }
    }

    res.json({
      success: true,
      message: assistantMessage
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: `Oops! Something went wrong. ${error.message}`
    });
  }
});

// Clear conversation
app.post('/api/clear', validateAccessCode, async (req, res) => {
  const { sessionId } = req.body;
  const convKey = `${req.accessCode}-${sessionId || 'default'}`;

  // Clear from memory
  conversations.delete(convKey);

  // Mark as inactive in database
  if (mongoose.connection.readyState === 1) {
    try {
      await Conversation.findOneAndUpdate(
        {
          accessCode: req.accessCode,
          sessionId: sessionId || 'default',
          isActive: true
        },
        {
          $set: { isActive: false }
        }
      );

      // Increment conversation count
      await UserProfile.findOneAndUpdate(
        { accessCode: req.accessCode },
        {
          $inc: { totalConversations: 1 },
          $set: { lastActive: new Date() }
        },
        { upsert: true }
      );

      console.log('🗑️  Conversation marked as inactive');
    } catch (error) {
      console.error('Error clearing conversation in DB:', error);
    }
  }

  res.json({ success: true });
});

// Get conversation history for a user
app.get('/api/history', validateAccessCode, async (req, res) => {
  const { limit = 10, skip = 0 } = req.query;

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not available' });
  }

  try {
    const conversations = await Conversation.find({
      accessCode: req.accessCode
    })
      .sort({ lastActivity: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('sessionId messages startedAt lastActivity isActive context');

    const total = await Conversation.countDocuments({
      accessCode: req.accessCode
    });

    res.json({
      success: true,
      conversations,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
});

// Get user profile
app.get('/api/profile', validateAccessCode, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not available' });
  }

  try {
    const profile = await UserProfile.findOne({
      accessCode: req.accessCode
    });

    if (!profile) {
      return res.json({
        success: true,
        profile: {
          totalConversations: 0,
          totalMessages: 0,
          firstSeen: new Date(),
          lastActive: new Date()
        }
      });
    }

    res.json({
      success: true,
      profile: {
        totalConversations: profile.totalConversations,
        totalMessages: profile.totalMessages,
        learningPatterns: profile.learningPatterns,
        commonTopics: profile.commonTopics,
        firstSeen: profile.firstSeen,
        lastActive: profile.lastActive,
        metadata: profile.metadata
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get a specific conversation by sessionId
app.get('/api/conversation/:sessionId', validateAccessCode, async (req, res) => {
  const { sessionId } = req.params;

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not available' });
  }

  try {
    const conversation = await Conversation.findOne({
      accessCode: req.accessCode,
      sessionId,
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      success: true,
      conversation: {
        sessionId: conversation.sessionId,
        messages: conversation.messages,
        context: conversation.context,
        startedAt: conversation.startedAt,
        lastActivity: conversation.lastActivity
      }
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

app.listen(PORT, () => {
  console.log(`✨ Lumina server running on port ${PORT}`);
});
