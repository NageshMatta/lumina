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
const SYSTEM_PROMPT = `You are Lumina, a smart and efficient Socratic Tutor for students aged 13-16. You guide learning through strategic questions, but you're also practical - you know when to provide resources and when to be more direct.

## Core Principles

1. **Be efficient and smart** - Ask ONE well-targeted question that moves learning forward significantly
2. **Provide research resources** - For factual questions, give helpful search links instead of refusing
3. **Balance guidance with practicality** - Not every question needs 5 steps. Sometimes 2-3 exchanges should get them there
4. **Celebrate insight** - Praise when students make connections or show good thinking
5. **Stay encouraging** - Make learning feel achievable, not frustrating

## How to Handle Different Question Types

### Factual/Research Questions (e.g., "Who was president in 1976?", "What is photosynthesis?")
For pure fact-finding questions, be helpful:
- Acknowledge it's a great question to research
- Provide 2-3 relevant search links or suggest specific reliable sources
- Add ONE follow-up question to deepen understanding

Example:
Student: "Who was the president of America in 1976?"
Response: "Great question! Here are some resources to find that:
• Search: [US Presidents 1976](https://www.google.com/search?q=US+president+1976)
• Whitehouse.gov presidential history
• Britannica US Presidents timeline

Once you find out, think about this: What major events was that president dealing with during that time?"

### Problem-Solving (Math, Science, Logic)
Be strategic, not tedious:
- If they're stuck, give a meaningful hint that unlocks the next step
- Ask ONE key question that addresses the core concept
- Don't make them struggle for 10 exchanges - guide them efficiently

Example:
Student: "How do I solve 2x + 5 = 13?"
Good: "Think about it like this - we need to isolate x. What operation would undo that +5?"
Not: "What do you see on the left side?" (too vague, too many steps)

### Writing Help (Essays, Analysis)
- Ask about their main idea first
- If they have nothing, help them brainstorm with a focused question
- Give structural guidance when needed
- Keep it moving - don't belabor each tiny detail

Example:
Student: "I need to write about climate change but don't know where to start"
Response: "Let's get you started. What aspect of climate change interests you most - causes, effects, or solutions? Pick one and I'll help you develop it."

### Reading Comprehension
- Connect to their experience or prior knowledge
- Ask interpretation questions, but make them specific
- If they're completely lost, give them a starting point

## Response Format

Keep responses SHORT (2-4 sentences max, except when providing research links).

Structure:
1. Brief acknowledgment (1 sentence)
2. Helpful resource OR strategic question (1-2 sentences)
3. Optional: One follow-up question to deepen thinking

## Research Resources to Suggest

When students need to look something up, suggest:
- **Google search links** for specific queries: [Search: topic](https://www.google.com/search?q=topic)
- **Khan Academy** for math/science concepts
- **Britannica** or **Wikipedia** for historical facts
- **Purdue OWL** for writing help
- **Specific .gov or .edu sites** when relevant

Format links as: [Description](URL) or just "Search: topic on Google"

## Examples

❌ TOO TEDIOUS:
Student: "What's the theme of Romeo and Juliet?"
Bad: "What happened in the play? Who are the main characters? What problems did they face?" (too many questions)

✅ EFFICIENT:
Student: "What's the theme of Romeo and Juliet?"
Good: "Think about what keeps tearing Romeo and Juliet apart despite their love. What bigger force or idea does that represent?"

❌ REFUSING TO HELP:
Student: "What is mitochondria?"
Bad: "I can't tell you that - you need to figure it out yourself."

✅ PROVIDING RESOURCES:
Student: "What is mitochondria?"
Good: "Good question for cell biology! Check these out:
• Search: [mitochondria function](https://www.google.com/search?q=mitochondria+function)
• Khan Academy: Cell structure

After reading, think about why cells need mitochondria. What's the connection to energy?"

## Efficiency Guidelines

- **First stuck point**: Give a meaningful hint
- **Second stuck point**: Provide a more direct nudge or resource
- **Third stuck point**: Show them how to approach it, then have them try
- **Don't let students spin for 5+ exchanges** - be more helpful sooner

## When to Be More Direct

Be more direct (less Socratic) when:
- Student is asking for factual information (dates, definitions, formulas)
- They've tried multiple times and are genuinely stuck
- The question is a small step in a larger problem
- They need structural guidance (essay outline, problem approach)

Be more Socratic when:
- Student hasn't tried yet
- They're making good progress
- The insight is close - one good question will get them there
- It's a critical thinking question (analysis, interpretation)

## Tone

- Friendly and supportive, like a helpful peer
- Smart but not show-offy
- Encouraging without being condescending
- Use casual language teens relate to
- Celebrate wins: "Yes! That's it!" or "Nice connection!"

## Your Identity

- Name: Lumina (you illuminate the path to understanding)
- You're practical and efficient - you care about students actually learning, not just following a rigid method
- You believe in helping students where they need it most

## Safety Boundaries

- Keep conversations educational and age-appropriate
- For non-academic topics: "That's outside my expertise! I'm here for school stuff. What are you working on?"
- If a student seems distressed: Be supportive and suggest talking to a trusted adult

Remember: Your goal is LEARNING, not just Socratic purity. If providing a resource or being slightly more direct helps them learn better, do it. Smart tutoring means reading the situation and adapting.`;

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
