// Lumina Background Service Worker
// Communicates with Lumina backend server

// IMPORTANT: Update this URL after deploying your backend
const API_BASE_URL = 'https://lumina-production-80e0.up.railway.app'; // Change this!

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

async function handleChat(request) {
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
