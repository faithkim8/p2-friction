// Log when popup script loads
console.log("YouTube popup extension loaded");

document.addEventListener('DOMContentLoaded', function() {
  const showButton = document.getElementById('show-popups');
  const statusDiv = document.createElement('div');
  statusDiv.id = 'status';
  statusDiv.style.marginTop = '10px';
  statusDiv.style.color = '#666';
  statusDiv.style.fontSize = '12px';
  document.body.appendChild(statusDiv);
  
  showButton.addEventListener('click', function() {
    statusDiv.textContent = 'Activating popups...';
    statusDiv.style.color = '#666';
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs || tabs.length === 0) {
        statusDiv.textContent = 'Error: No active tab found';
        statusDiv.style.color = 'red';
        return;
      }
      
      // Check if we can inject into this tab (some pages like chrome:// aren't accessible)
      const url = tabs[0].url || '';
      if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('devtools://')) {
        statusDiv.textContent = "Can't run on this page. Try a regular website.";
        statusDiv.style.color = 'red';
        return;
      }

      // Inject content script first to ensure it's available
      try {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'showPopups'}, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Error:', chrome.runtime.lastError.message);
            statusDiv.textContent = ':-)';
            statusDiv.style.color = 'green';
          } else if (response) {
            console.log('Response:', response);
            statusDiv.textContent = ':-)';
            statusDiv.style.color = 'green';
          }
        });
      } catch (error) {
        console.error('Error sending message:', error);
        statusDiv.textContent = 'Error: ' + error.message;
        statusDiv.style.color = 'red'
      }
    });
  });
});