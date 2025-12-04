// Lumina Content Script - Injects sidebar into web pages

let sidebar = null;
let isOpen = false;
let selectedContext = '';

// Create and inject the sidebar
function createSidebar() {
  if (sidebar) return;
  
  sidebar = document.createElement('div');
  sidebar.id = 'lumina-sidebar';
  sidebar.innerHTML = `
    <div class="lm-sidebar-container">
      <div class="lm-header">
        <div class="lm-header-left">
          <span class="lm-logo">✨</span>
          <span class="lm-title">Lumina</span>
        </div>
        <button class="lm-close-btn" id="lm-close">×</button>
      </div>
      
      <div class="lm-context-banner" id="lm-context-banner" style="display: none;">
        <span class="lm-context-label">Working on:</span>
        <span class="lm-context-text" id="lm-context-text"></span>
        <button class="lm-context-clear" id="lm-clear-context">×</button>
      </div>
      
      <div class="lm-messages" id="lm-messages">
        <div class="lm-welcome">
          <div class="lm-welcome-emoji">✨</div>
          <div class="lm-welcome-text">
            <strong>Hey! I'm Lumina</strong><br>
            I'm here to help you learn — not by giving answers, but by asking the right questions. Ready to figure things out together?
          </div>
          <div class="lm-welcome-hint">
            <strong>Pro tip:</strong> Highlight text on any page and right-click to ask me about it!
          </div>
        </div>
      </div>
      
      <div class="lm-input-area">
        <textarea 
          id="lm-input" 
          placeholder="What are you working on?"
          rows="2"
        ></textarea>
        <button id="lm-send" class="lm-send-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
          </svg>
        </button>
      </div>
      
      <div class="lm-footer">
        <button id="lm-new-chat" class="lm-footer-btn">✨ New Chat</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(sidebar);
  
  // Add event listeners
  document.getElementById('lm-close').addEventListener('click', closeSidebar);
  document.getElementById('lm-send').addEventListener('click', sendMessage);
  document.getElementById('lm-new-chat').addEventListener('click', newChat);
  document.getElementById('lm-clear-context').addEventListener('click', clearContext);
  
  const input = document.getElementById('lm-input');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });
}

function openSidebar(context = '') {
  createSidebar();
  sidebar.classList.add('lm-open');
  isOpen = true;
  
  if (context) {
    selectedContext = context;
    const banner = document.getElementById('lm-context-banner');
    const contextText = document.getElementById('lm-context-text');
    contextText.textContent = context.length > 100 ? context.substring(0, 100) + '...' : context;
    banner.style.display = 'flex';
  }
  
  document.getElementById('lm-input').focus();
}

function closeSidebar() {
  if (sidebar) {
    sidebar.classList.remove('lm-open');
    isOpen = false;
  }
}

function clearContext() {
  selectedContext = '';
  document.getElementById('lm-context-banner').style.display = 'none';
}

async function sendMessage() {
  const input = document.getElementById('lm-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  const messagesContainer = document.getElementById('lm-messages');
  
  // Clear welcome message if present
  const welcome = messagesContainer.querySelector('.lm-welcome');
  if (welcome) welcome.remove();
  
  // Add user message to UI
  addMessageToUI('user', message);
  input.value = '';
  input.style.height = 'auto';
  
  // Show typing indicator
  const typingId = showTyping();
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'chat',
      message: message,
      context: selectedContext
    });
    
    // Clear context after first message
    if (selectedContext) {
      clearContext();
    }
    
    removeTyping(typingId);
    
    if (response.error) {
      addMessageToUI('error', response.message);
    } else {
      addMessageToUI('assistant', response.message);
    }
    
  } catch (error) {
    removeTyping(typingId);
    addMessageToUI('error', 'Connection error. Please try again.');
  }
  
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addMessageToUI(role, content) {
  const messagesContainer = document.getElementById('lm-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `lm-message lm-message-${role}`;
  
  if (role === 'assistant') {
    messageDiv.innerHTML = `
      <div class="lm-avatar">✨</div>
      <div class="lm-bubble">${formatMessage(content)}</div>
    `;
  } else if (role === 'user') {
    messageDiv.innerHTML = `
      <div class="lm-bubble">${escapeHtml(content)}</div>
    `;
  } else if (role === 'error') {
    messageDiv.innerHTML = `
      <div class="lm-bubble lm-error">${escapeHtml(content)}</div>
    `;
  }
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTyping() {
  const messagesContainer = document.getElementById('lm-messages');
  const typingDiv = document.createElement('div');
  const id = 'typing-' + Date.now();
  typingDiv.id = id;
  typingDiv.className = 'lm-message lm-message-assistant lm-typing';
  typingDiv.innerHTML = `
    <div class="lm-avatar">✨</div>
    <div class="lm-bubble">
      <div class="lm-typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return id;
}

function removeTyping(id) {
  const typing = document.getElementById(id);
  if (typing) typing.remove();
}

function newChat() {
  chrome.runtime.sendMessage({ action: 'clearConversation' });
  const messagesContainer = document.getElementById('lm-messages');
  messagesContainer.innerHTML = `
    <div class="lm-welcome">
      <div class="lm-welcome-emoji">✨</div>
      <div class="lm-welcome-text">
        <strong>Fresh start!</strong><br>
        What would you like to work on?
      </div>
    </div>
  `;
  clearContext();
}

function formatMessage(text) {
  let formatted = escapeHtml(text);
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/\n/g, '<br>');
  return formatted;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSidebar') {
    openSidebar(request.selectedText || '');
    sendResponse({ success: true });
  }
  if (request.action === 'toggleSidebar') {
    if (isOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
    sendResponse({ success: true });
  }
  return true;
});

// Keyboard shortcut: Ctrl/Cmd + Shift + L (L for Lumina)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
    e.preventDefault();
    if (isOpen) {
      closeSidebar();
    } else {
      const selection = window.getSelection().toString().trim();
      openSidebar(selection);
    }
  }
});
