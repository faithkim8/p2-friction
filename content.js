// YouTube popup extension with bring-to-front feature

// YouTube livestream URLs with complete hiding parameters
const videos = [
  'https://www.youtube.com/embed/B4-L2nfGcuE?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3', // Big Bear Bald Eagle
  'https://www.youtube.com/embed/4ElanH9Gzjw?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3', // Sea Lions
  'https://www.youtube.com/embed/VI8Wj5EwoRM?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3', // Banzai
  'https://www.youtube.com/embed/jJI5w_RVGtQ?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3', // Northern Lights
  'https://www.youtube.com/embed/tJ0fHAHihPA?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3', // Yellowstone Bison
  'https://www.youtube.com/embed/T-iBupPtIFw?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3', // More Bison
  'https://www.youtube.com/embed/WUqQdNAUC1c?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3', // River Wildlife
  'https://www.youtube.com/embed/f5Rjm5tiEkU?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3'  // Mountain View
];

// Names for the videos
const videoNames = [
  'Big Bear Bald Eagle',
  'Sea Lions',
  'Banzai',
  'Northern Lights',
  'Yellowstone Bison',
  'More Bison',
  'River Wildlife',
  'Mountain View'
];

// Keep track of open videos
const openVideos = new Set();

// Track the current highest z-index
let highestZIndex = 10000;

// --- Global variables for text popup sequence ---
let textSequenceActive = false;
let currentTextIndex = 0;
let videosClosedCount = 0; // Count how many video popups have been closed

// --- Updated array of text messages (in order) ---
const textMessages = [
  "don’t leave.",
  "where are you going?",
  "back to your other screens?",
  "do you hate your job?",
  "when’s the last time you saw an eagle?",
  "the sunrise?",
  "the clouds?",
  "wouldn’t it be nice to lay in the grass?",
  "go on a walk",
  "soak up the sun"
];

// Helper: Bring a popup to front by increasing its z-index
function bringToFront(popup) {
  highestZIndex += 1;
  popup.style.zIndex = highestZIndex;
}

// Helper: Get a random size from a list (maintaining 16:9 aspect ratio)
function getRandomSize() {
  const sizes = [
    { width: 320, height: 180 },
    { width: 384, height: 216 },
    { width: 448, height: 252 },
    { width: 512, height: 288 }
  ];
  return sizes[Math.floor(Math.random() * sizes.length)];
}

// Helper: Get a random position within the viewport
function getRandomPosition(width, height) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const maxX = viewportWidth - width - 20; // 20px safety margin
  const maxY = viewportHeight - height - 20; // 20px safety margin
  const randomX = Math.floor(Math.random() * (maxX - 50)) + 50;
  const randomY = Math.floor(Math.random() * (maxY - 50)) + 50;
  return { x: randomX, y: randomY };
}

// Helper: Spawn the next text popup in sequence if not a duplicate
function spawnNextTextPopup() {
  if (currentTextIndex < textMessages.length - 1) {
    currentTextIndex++;
    const nextMessage = textMessages[currentTextIndex];
    let duplicate = false;
    document.querySelectorAll('.text-popup').forEach(p => {
      if (p.innerText.trim() === nextMessage.trim()) {
        duplicate = true;
      }
    });
    if (!duplicate) {
      showTextPopupSequence(currentTextIndex);
    }
  } else {
    textSequenceActive = false;
  }
}

// --- Video Popup Creation ---
function createPopup(videoUrl, videoName, index) {
  openVideos.add(index);
  const size = getRandomSize();
  const position = getRandomPosition(size.width, size.height);
  
  const popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.width = size.width + 'px';
  popup.style.height = size.height + 'px';
  popup.style.top = position.y + 'px';
  popup.style.left = position.x + 'px';
  popup.style.backgroundColor = 'rgba(255, 255, 255, 0)';
  popup.style.zIndex = highestZIndex;
  popup.style.borderRadius = '0px';
  popup.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0)';
  popup.style.overflow = 'hidden';
  popup.className = 'youtube-popup';
  
  popup.addEventListener('mousedown', function() {
    bringToFront(popup);
  });
  
  // Draggable area for video popup
  const dragArea = document.createElement('div');
  dragArea.style.position = 'absolute';
  dragArea.style.top = '0';
  dragArea.style.left = '0';
  dragArea.style.width = '100%';
  dragArea.style.height = '100%';
  dragArea.style.zIndex = '5';
  dragArea.style.cursor = 'move';
  dragArea.style.opacity = '0';
  dragArea.style.pointerEvents = 'auto';
  
  let isDragging = false;
  let offsetX, offsetY;
  
  dragArea.addEventListener('mousedown', function(e) {
    bringToFront(popup);
    isDragging = true;
    offsetX = e.clientX - popup.getBoundingClientRect().left;
    offsetY = e.clientY - popup.getBoundingClientRect().top;
    
    const overlay = document.createElement('div');
    overlay.className = 'drag-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '9999';
    document.body.appendChild(overlay);
    
    function movePopup(e) {
      if (!isDragging) return;
      const newLeft = e.clientX - offsetX;
      const newTop = e.clientY - offsetY;
      const maxX = window.innerWidth - popup.offsetWidth;
      const maxY = window.innerHeight - popup.offsetHeight;
      popup.style.left = Math.max(0, Math.min(newLeft, maxX)) + 'px';
      popup.style.top = Math.max(0, Math.min(newTop, maxY)) + 'px';
    }
    
    function stopDragging() {
      isDragging = false;
      document.removeEventListener('mousemove', movePopup);
      document.removeEventListener('mouseup', stopDragging);
      const overlay = document.querySelector('.drag-overlay');
      if (overlay) overlay.remove();
    }
    
    document.addEventListener('mousemove', movePopup);
    document.addEventListener('mouseup', stopDragging);
  });
  
  // Close button for video popup (green)
  const closeBtn = document.createElement('div');
  closeBtn.textContent = 'X';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '5px';
  closeBtn.style.right = '5px';
  closeBtn.style.color = 'rgb(0, 255, 98)'; // green for video popups
  closeBtn.style.padding = '1px 6px';
  closeBtn.style.borderRadius = '50%';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.zIndex = '6';
  closeBtn.style.fontWeight = 'bold';
  closeBtn.style.fontSize = '14px';
  closeBtn.style.userSelect = 'none';
  closeBtn.style.opacity = '0';
  closeBtn.style.transition = 'opacity 0.3s';
  
  closeBtn.onclick = function(e) {
    e.stopPropagation();
    openVideos.delete(index);
    popup.remove();
    videosClosedCount++; // Increment count for each closed video popup

    // If text sequence is not active and we've closed 2 or more video popups, start the sequence.
    if (!textSequenceActive && videosClosedCount >= 2) {
      textSequenceActive = true;
      currentTextIndex = 0;
      showTextPopupSequence(currentTextIndex);
    }
    // If text sequence is active, spawn a new text popup with the next message (if not duplicate).
    else if (textSequenceActive) {
      spawnNextTextPopup();
    }
    // Always create a new video popup to keep livestreams continuous.
    createRandomPopup();
  };
  
  popup.addEventListener('mouseenter', function() {
    closeBtn.style.opacity = '1';
  });
  
  popup.addEventListener('mouseleave', function() {
    closeBtn.style.opacity = '0';
  });
  
  // Video container and iframe setup
  const videoContainer = document.createElement('div');
  videoContainer.style.position = 'absolute';
  videoContainer.style.top = '0';
  videoContainer.style.left = '0';
  videoContainer.style.width = '100%';
  videoContainer.style.height = '100%';
  videoContainer.style.overflow = 'hidden';
  
  const iframe = document.createElement('iframe');
  iframe.src = videoUrl;
  iframe.frameBorder = '0';
  iframe.style.position = 'absolute';
  iframe.style.width = '100%';
  iframe.style.height = '170%'; // For better cropping
  iframe.style.top = '-35%';      // Adjust cropping
  iframe.style.left = '0';
  iframe.style.zIndex = '1';
  iframe.style.pointerEvents = 'none';
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  
  videoContainer.appendChild(iframe);
  popup.appendChild(videoContainer);
  popup.appendChild(dragArea);
  popup.appendChild(closeBtn);
  
  document.body.appendChild(popup);
  console.log("Created popup for: " + videoName + " with size " + size.width + "x" + size.height);
  
  highestZIndex += 1;
}

// Create a new random video popup
function createRandomPopup() {
  const availableIndices = [];
  for (let i = 0; i < videos.length; i++) {
    if (!openVideos.has(i)) {
      availableIndices.push(i);
    }
  }
  if (availableIndices.length === 0) {
    console.log("All videos are currently open");
    return;
  }
  const randomPosition = Math.floor(Math.random() * availableIndices.length);
  const newIndex = availableIndices[randomPosition];
  createPopup(videos[newIndex], videoNames[newIndex], newIndex);
}

// Show initial video popups
function showPopups() {
  console.log("Showing popups...");
  document.querySelectorAll('.youtube-popup').forEach(el => el.remove());
  openVideos.clear();
  highestZIndex = 10000;
  videosClosedCount = 0; // Reset counter for fresh start
  const count = Math.min(4, videos.length);
  for (let i = 0; i < count; i++) {
    createPopup(videos[i], videoNames[i], i);
  }
}

// --- Text Popup Functions ---
// Creates a text-based popup that shows a message.
// When its close button is clicked, the text popup is removed and a new text popup is spawned.
function createTextPopup(message, sequenceIndex) {
  const pos = getRandomPosition(300, 100);
  
  const popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.width = '300px';
  popup.style.height = '100px';
  popup.style.top = pos.y + 'px';
  popup.style.left = pos.x + 'px';
  // For text popups, use the chosen green background with black text.
  popup.style.backgroundColor = 'rgb(0, 255, 98)';
  popup.style.color = '#000';
  popup.style.display = 'flex';
  popup.style.alignItems = 'center';
  popup.style.justifyContent = 'center';
  popup.style.fontSize = '20px';
  popup.style.borderRadius = '8px';
  popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  popup.style.zIndex = highestZIndex;
  popup.className = 'text-popup';
  
  // Close button for text popup (white)
  const closeBtn = document.createElement('div');
  closeBtn.textContent = 'X';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '5px';
  closeBtn.style.right = '5px';
  closeBtn.style.color = 'black';
  closeBtn.style.padding = '1px 6px';
  closeBtn.style.borderRadius = '50%';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontWeight = 'bold';
  closeBtn.style.fontSize = '14px';
  closeBtn.style.userSelect = 'none';
  closeBtn.style.opacity = '0';
  closeBtn.style.transition = 'opacity 0.3s';
  closeBtn.style.zIndex = '10';
  
  // When the text popup's close button is clicked, remove it and spawn the next text popup.
  closeBtn.onclick = function(e) {
    e.stopPropagation();
    popup.remove();
    spawnNextTextPopup();
  };
  
  popup.addEventListener('mouseenter', function() {
    closeBtn.style.opacity = '1';
  });
  
  popup.addEventListener('mouseleave', function() {
    closeBtn.style.opacity = '0';
  });
  
  // Draggable area for text popup
  const dragArea = document.createElement('div');
  dragArea.style.position = 'absolute';
  dragArea.style.top = '0';
  dragArea.style.left = '0';
  dragArea.style.width = '100%';
  dragArea.style.height = '100%';
  dragArea.style.cursor = 'move';
  dragArea.style.opacity = '0';
  dragArea.style.pointerEvents = 'auto';
  
  dragArea.addEventListener('mousedown', function(e) {
    bringToFront(popup);
    let isDragging = true;
    let offsetX = e.clientX - popup.getBoundingClientRect().left;
    let offsetY = e.clientY - popup.getBoundingClientRect().top;
    
    const overlay = document.createElement('div');
    overlay.className = 'drag-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '9999';
    document.body.appendChild(overlay);
    
    function movePopup(e) {
      if (!isDragging) return;
      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;
      const maxX = window.innerWidth - popup.offsetWidth;
      const maxY = window.innerHeight - popup.offsetHeight;
      popup.style.left = Math.max(0, Math.min(newLeft, maxX)) + 'px';
      popup.style.top = Math.max(0, Math.min(newTop, maxY)) + 'px';
    }
    
    function stopDragging() {
      isDragging = false;
      document.removeEventListener('mousemove', movePopup);
      document.removeEventListener('mouseup', stopDragging);
      const overlay = document.querySelector('.drag-overlay');
      if (overlay) overlay.remove();
    }
    
    document.addEventListener('mousemove', movePopup);
    document.addEventListener('mouseup', stopDragging);
  });
  
  popup.appendChild(dragArea);
  popup.appendChild(closeBtn);
  
  const msgElem = document.createElement('div');
  msgElem.innerText = message;
  msgElem.style.flexGrow = '1';
  msgElem.style.width = '100%';
  msgElem.style.textAlign = 'center';
  msgElem.style.wordWrap = 'break-word';
  
  popup.appendChild(msgElem);
  
  document.body.appendChild(popup);
  highestZIndex += 1;
}

// Starts the text popup sequence from the given index in the textMessages array.
function showTextPopupSequence(index) {
  if (index < textMessages.length) {
    createTextPopup(textMessages[index], index);
  }
}

// --- Event Listeners ---

// Alt+P hotkey to show video popups
document.addEventListener('keydown', function(e) {
  if (e.altKey && e.key === 'p') {
    console.log("Alt+P pressed");
    showPopups();
  }
});

// Message listener for the extension
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'showPopups') {
      showPopups();
      sendResponse({ status: 'Popups created' });
    }
    return true;
  });
  console.log("Message listener set up");
}

// Auto-show popups if not in an extension environment
setTimeout(function() {
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.log("Not in extension environment, auto-showing popups");
    showPopups();
  }
}, 500);

console.log("YouTube popup script loaded!");
