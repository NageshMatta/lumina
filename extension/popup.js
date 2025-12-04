// Lumina Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const authSection = document.getElementById('auth-section');
  const readySection = document.getElementById('ready-section');
  const accessCodeInput = document.getElementById('accessCode');
  const verifyBtn = document.getElementById('verifyBtn');
  const statusDiv = document.getElementById('status');
  const openBtn = document.getElementById('openBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  // Check if already authenticated
  const authStatus = await chrome.runtime.sendMessage({ action: 'getAuthStatus' });
  
  if (authStatus.isAuthenticated) {
    showReadyState();
  }
  
  // Handle access code verification
  verifyBtn.addEventListener('click', verifyCode);
  accessCodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') verifyCode();
  });
  
  async function verifyCode() {
    const code = accessCodeInput.value.trim();
    
    if (!code) {
      showStatus('Please enter your access code', 'error');
      return;
    }
    
    verifyBtn.textContent = 'Checking...';
    verifyBtn.disabled = true;
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'verifyCode',
        code: code
      });
      
      if (response.success) {
        showStatus('Welcome to Lumina! ✨', 'success');
        setTimeout(() => {
          showReadyState();
        }, 1000);
      } else {
        showStatus(response.error || 'Invalid code. Please try again.', 'error');
      }
    } catch (error) {
      showStatus('Connection error. Please try again.', 'error');
    }
    
    verifyBtn.textContent = 'Start Learning ✨';
    verifyBtn.disabled = false;
  }
  
  // Open Lumina sidebar
  openBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
      window.close();
    }
  });
  
  // Logout
  logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['accessCode']);
    showAuthState();
  });
  
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
    
    if (type === 'success') {
      setTimeout(() => {
        statusDiv.className = 'status';
      }, 3000);
    }
  }
  
  function showReadyState() {
    authSection.classList.add('hidden');
    readySection.classList.add('active');
  }
  
  function showAuthState() {
    authSection.classList.remove('hidden');
    readySection.classList.remove('active');
    accessCodeInput.value = '';
    statusDiv.className = 'status';
  }
});
