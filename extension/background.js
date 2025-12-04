// Lumina Background Service Worker
// Communicates with Lumina backend server

// IMPORTANT: Update this URL after deploying your backend
const API_BASE_URL = 'https://lumina-production-80e0.up.railway.app'; // Change this!

// TEST MODE: Set to true to use mock responses (no API calls)
const TEST_MODE = true; // Change to false for production

// Generate unique session ID for this browser session
const sessionId = crypto.randomUUID();

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'chat') {
    handleChat(request).then(sendResponse);
    return true;
  }
  
  if (request.action === 'clearConversation') {
    clearConversation().then(sendResponse);
    return true;
  }
  
  if (request.action === 'verifyCode') {
    verifyAccessCode(request.code).then(sendResponse);
    return true;
  }
  
  if (request.action === 'getAuthStatus') {
    chrome.storage.local.get(['accessCode', 'apiUrl'], (result) => {
      sendResponse({ 
        isAuthenticated: !!result.accessCode,
        apiUrl: result.apiUrl || API_BASE_URL
      });
    });
    return true;
  }
});

async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['accessCode', 'apiUrl'], (result) => {
      resolve({
        accessCode: result.accessCode || '',
        apiUrl: result.apiUrl || API_BASE_URL
      });
    });
  });
}

async function verifyAccessCode(code) {
  // TEST MODE: Accept any code
  if (TEST_MODE) {
    console.log('🧪 TEST MODE: Auto-accepting access code');
    await chrome.storage.local.set({ accessCode: code });
    return { success: true };
  }

  // PRODUCTION MODE: Verify with API
  const config = await getConfig();

  try {
    const response = await fetch(`${config.apiUrl}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessCode: code })
    });

    const data = await response.json();

    if (data.valid) {
      // Save the access code
      await chrome.storage.local.set({ accessCode: code });
      return { success: true };
    } else {
      return { success: false, error: 'Invalid access code' };
    }
  } catch (error) {
    return { success: false, error: 'Could not connect to server. Please try again.' };
  }
}

// Mock responses for testing (Socratic style)
const MOCK_RESPONSES = [
  "That's an interesting question! Before we dive in, what do you already know about this topic?",
  "Great start! Let's break this down step by step. What's the first thing you notice about this problem?",
  "I can see you're working through this. What approach have you tried so far?",
  "Good thinking! Now, what do you think would happen if you tried a different method?",
  "You're on the right track! Can you explain your reasoning to me?",
  "Let's think about this together. What information does the problem give us?",
  "That's a thoughtful approach. What's making this challenging for you right now?",
  "Excellent question! Before I guide you further, what's your initial instinct?",
  "I like how you're thinking about this. What if we simplified the problem - what would change?",
  "You're making progress! What do you think the next logical step would be?",
  "That's a great observation. How does this connect to what you've learned before?",
  "Nice work so far! What patterns or relationships do you see here?",
  "I can see you're really engaging with this. What's your hypothesis?",
  "Good effort! Let's pause for a moment - what are you trying to find or prove?",
  "You're asking the right questions. What evidence supports your thinking?"
];

function getMockResponse() {
  // Add small delay to simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      resolve({
        success: true,
        message: randomResponse
      });
    }, 500 + Math.random() * 1000); // Random delay between 0.5-1.5 seconds
  });
}

async function handleChat(request) {
  // TEST MODE: Return mock response
  if (TEST_MODE) {
    console.log('🧪 TEST MODE: Using mock response');
    return getMockResponse();
  }

  // PRODUCTION MODE: Call real API
  const config = await getConfig();

  if (!config.accessCode) {
    return {
      error: true,
      message: 'Please enter your access code first!'
    };
  }

  try {
    const response = await fetch(`${config.apiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.accessCode}`
      },
      body: JSON.stringify({
        message: request.message,
        context: request.context,
        sessionId: sessionId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    return {
      success: true,
      message: data.message
    };

  } catch (error) {
    console.error('Chat error:', error);
    return {
      error: true,
      message: error.message || 'Connection error. Please try again.'
    };
  }
}

async function clearConversation() {
  const config = await getConfig();
  
  if (!config.accessCode) {
    return { success: true };
  }
  
  try {
    await fetch(`${config.apiUrl}/api/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.accessCode}`
      },
      body: JSON.stringify({ sessionId })
    });
  } catch (error) {
    console.error('Clear error:', error);
  }
  
  return { success: true };
}

// Create context menu for text selection
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'lumina-tutor',
    title: 'Ask Lumina about this ✨',
    contexts: ['selection']
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'lumina-tutor' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'openSidebar',
      selectedText: info.selectionText
    });
  }
});
