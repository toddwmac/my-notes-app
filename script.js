// Function to update local storage with current notes
function updateLocalStorage() {
  const notes = [];
  document.querySelectorAll('.note').forEach(noteEl => {
    const noteText = noteEl.querySelector('.note-text').textContent;
    notes.push(noteText);
  });
  localStorage.setItem('notes', JSON.stringify(notes));
}

// Function to create a note element with Save and Delete buttons
function createNoteElement(noteText) {
  const noteEl = document.createElement('div');
  noteEl.className = 'note';

  const textEl = document.createElement('span');
  textEl.className = 'note-text';
  textEl.textContent = noteText;
  noteEl.appendChild(textEl);

  // Create a container for buttons
  const buttonsContainer = document.createElement('span');
  buttonsContainer.className = 'note-buttons';

  // Save to file button
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save to File';
  saveBtn.addEventListener('click', () => {
    // Create a blob from the note text
    const blob = new Blob([noteText], { type: 'text/plain' });
    // Create a download link and trigger it
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Todds_Quick_Note_' + new Date().getTime() + '.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  buttonsContainer.appendChild(saveBtn);

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => {
    noteEl.remove();
    updateLocalStorage();
  });
  buttonsContainer.appendChild(deleteBtn);

  // Append button container to note element
  noteEl.appendChild(buttonsContainer);

  return noteEl;
}

// Handle saving new note
document.getElementById('save-btn').addEventListener('click', () => {
  const noteInput = document.getElementById('note-input');
  const noteText = noteInput.value.trim();
  if (noteText) {
    const noteContainer = document.getElementById('note-container');
    const newNoteEl = createNoteElement(noteText);
    noteContainer.appendChild(newNoteEl);
    updateLocalStorage();
    noteInput.value = '';
  }
});

// Handle Clear All Notes button - now only clears the edit window
document.getElementById('clear-btn').addEventListener('click', () => {
  // Clear the text input area
  document.getElementById('note-input').value = '';
  // Update markdown display
  updateMarkdownDisplay();
});

// Function to update markdown display
function updateMarkdownDisplay() {
  const noteInput = document.getElementById('note-input');
  const markdownDisplay = document.getElementById('markdown-display');
  const text = noteInput.value;

  if (text.trim()) {
    // Use marked library to convert markdown to HTML
    const html = marked.parse(text);
    markdownDisplay.innerHTML = html;
  } else {
    markdownDisplay.innerHTML = '<p style="color: #999; font-style: italic;">Start typing to see markdown preview...</p>';
  }
}

// On window load, load notes from localStorage
window.onload = () => {
  document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  const savedNotes = localStorage.getItem('notes');
  if (savedNotes) {
    const notesArray = JSON.parse(savedNotes);
    const noteContainer = document.getElementById('note-container');
    notesArray.forEach(noteText => {
      const noteEl = createNoteElement(noteText);
      noteContainer.appendChild(noteEl);
    });
  }

  // Add event listeners for new features after DOM is ready
  // Load note from file
  document.getElementById('load-file-btn').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });

  document.getElementById('file-input').addEventListener('change', evt => {
    const file = evt.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result.trim();
      if (text) {
        // Put the file content into the text input area
        const noteInput = document.getElementById('note-input');
        noteInput.value = text;
        // Update the markdown preview
        updateMarkdownDisplay();
      }
      // reset value so selecting same file again triggers change
      evt.target.value = '';
    };
    reader.readAsText(file);
  });

  // Paste from clipboard
  document.getElementById('paste-btn').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        // Put the clipboard content into the text input area
        const noteInput = document.getElementById('note-input');
        noteInput.value = text.trim();
        // Update the markdown preview
        updateMarkdownDisplay();
      }
    } catch (err) {
      alert('Unable to read clipboard: ' + err);
    }
  });

  // Add real-time markdown preview
  const noteInput = document.getElementById('note-input');
  noteInput.addEventListener('input', updateMarkdownDisplay);
  noteInput.addEventListener('paste', () => {
    // Small delay to allow paste content to be processed
    setTimeout(updateMarkdownDisplay, 10);
  });

  // Copy markdown HTML button
  document.getElementById('copy-markdown-btn').addEventListener('click', async () => {
    const markdownDisplay = document.getElementById('markdown-display');
    const htmlContent = markdownDisplay.innerHTML;

    if (htmlContent && !htmlContent.includes('Start typing to see markdown preview')) {
      try {
        await navigator.clipboard.writeText(htmlContent);
        const btn = document.getElementById('copy-markdown-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.backgroundColor = '#20c997';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '';
        }, 2000);
      } catch (err) {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = htmlContent;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          const btn = document.getElementById('copy-markdown-btn');
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          btn.style.backgroundColor = '#20c997';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
          }, 2000);
        } catch (fallbackErr) {
          alert('Unable to copy to clipboard');
        }
        document.body.removeChild(textArea);
      }
    } else {
      alert('No markdown content to copy');
    }
  });

  // Initialize markdown display
  updateMarkdownDisplay();
  
  // Setup markdown toolbar
  setupMarkdownToolbar();

  // Select All button for input textarea
  document.getElementById('select-all-input-btn').addEventListener('click', () => {
    const noteInput = document.getElementById('note-input');
    noteInput.focus();
    noteInput.select();
    
    // Provide visual feedback
    const btn = document.getElementById('select-all-input-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Selected!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 1000);
  });
  
  // Select All button for preview
  document.getElementById('select-all-preview-btn').addEventListener('click', () => {
    const markdownDisplay = document.getElementById('markdown-display');
    
    if (window.getSelection && document.createRange) {
      // Modern browsers
      const selection = window.getSelection();
      const range = document.createRange();
      
      try {
        // Select the content of the markdown display
        range.selectNodeContents(markdownDisplay);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Provide visual feedback
        const btn = document.getElementById('select-all-preview-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Selected!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 1000);
      } catch (e) {
        alert('Could not select text: ' + e);
      }
    } else if (document.body.createTextRange) {
      // IE fallback
      const range = document.body.createTextRange();
      range.moveToElementText(markdownDisplay);
      range.select();
    }
  });

  // Copy Formatted Text button (like Windows right-click copy)
  document.getElementById('copy-formatted-btn').addEventListener('click', async () => {
    const markdownDisplay = document.getElementById('markdown-display');

    // Create a temporary div to hold the content
    // This ensures we get the formatted text, not the HTML
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    
    // Clone the markdown display content to preserve formatting
    const clone = markdownDisplay.cloneNode(true);
    tempDiv.appendChild(clone);
    document.body.appendChild(tempDiv);
    
    // Select the cloned content
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(clone);
    selection.removeAllRanges();
    selection.addRange(range);

    try {
      // Use document.execCommand which preserves formatting on Windows
      const success = document.execCommand('copy');

      if (success) {
        const btn = document.getElementById('copy-formatted-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.backgroundColor = '#20c997';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '';
        }, 2000);
      } else {
        throw new Error('Copy command failed');
      }
    } catch (err) {
      // Try an alternative approach for Windows
      try {
        // For Windows, we can try using the Clipboard API with 'text/html' format
        const htmlContent = markdownDisplay.innerHTML;
        const plainText = markdownDisplay.innerText || markdownDisplay.textContent;
        
        const clipboardItem = new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' })
        });
        
        await navigator.clipboard.write([clipboardItem]);
        
        const btn = document.getElementById('copy-formatted-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.backgroundColor = '#20c997';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '';
        }, 2000);
      } catch (clipErr) {
        alert('Unable to copy formatted text: ' + err);
      }
    } finally {
      // Clean up
      selection.removeAllRanges();
      document.body.removeChild(tempDiv);
    }
  });

  // Markdown Help Modal functionality
  const markdownHelpModal = document.getElementById('markdown-help-modal');
  const markdownHelpBtn = document.getElementById('markdown-help-btn');
  const closeModalBtn = document.querySelector('.close-modal');

  // Ensure modal is hidden by default
  markdownHelpModal.style.display = 'none';

  // Show modal as popup when help button is clicked
  markdownHelpBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    markdownHelpModal.style.display = 'block';

    // Add a small delay before applying focus to ensure modal is visible
    setTimeout(() => {
      closeModalBtn.focus();
    }, 100);
  });

  // Close modal when close button is clicked
  closeModalBtn.addEventListener('click', () => {
    closeModal();
  });

  // Function to close the modal with animation
  function closeModal() {
    // Add closing animation
    const modalContent = markdownHelpModal.querySelector('.modal-content');
    modalContent.style.animation = 'modalClose 0.2s ease-in forwards';

    // Wait for animation to complete before hiding modal
    setTimeout(() => {
      markdownHelpModal.style.display = 'none';
      modalContent.style.animation = 'modalPop 0.3s ease-out';
    }, 200);
  }

  // Close modal when clicking outside of it
  window.addEventListener('click', (event) => {
    if (event.target === markdownHelpModal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && markdownHelpModal.style.display === 'block') {
      closeModal();
    }
  });
};
// Markdown Toolbar Functionality
function setupMarkdownToolbar() {
  const noteInput = document.getElementById('note-input');
  
  // Helper function to wrap selected text with markdown syntax
  function wrapText(beforeText, afterText, defaultText) {
    const start = noteInput.selectionStart;
    const end = noteInput.selectionEnd;
    const selectedText = noteInput.value.substring(start, end);
    const beforeSelection = noteInput.value.substring(0, start);
    const afterSelection = noteInput.value.substring(end);
    
    // Check if we need to add a space after the tag
    const needsSpaceAfter = afterSelection.length > 0 && 
                           !afterSelection.startsWith(' ') && 
                           !afterSelection.startsWith('\n') &&
                           !afterSelection.startsWith(',') &&
                           !afterSelection.startsWith('.') &&
                           !afterSelection.startsWith(';') &&
                           !afterSelection.startsWith(':') &&
                           !afterSelection.startsWith('!') &&
                           !afterSelection.startsWith('?');
    
    // If no text is selected, insert default text
    if (start === end) {
      const insertText = beforeText + defaultText + afterText;
      const spaceAfter = needsSpaceAfter ? ' ' : '';
      
      noteInput.value = beforeSelection + insertText + spaceAfter + afterSelection;
      noteInput.focus();
      noteInput.setSelectionRange(start + beforeText.length, start + beforeText.length + defaultText.length);
    } else {
      // Check if the selection already has this formatting
      const checkBefore = noteInput.value.substring(Math.max(0, start - beforeText.length), start);
      const checkAfter = noteInput.value.substring(end, Math.min(noteInput.value.length, end + afterText.length));
      
      // Check for alternate formatting (for cycling between ** and __)
      const altFormats = {
        '**': '__',
        '__': '**',
        '*': '_',
        '_': '*'
      };
      
      const altBefore = altFormats[beforeText];
      const altAfter = altFormats[afterText];
      
      if (checkBefore === beforeText && checkAfter === afterText) {
        // Remove the formatting
        noteInput.value = beforeSelection.substring(0, beforeSelection.length - beforeText.length) + 
                          selectedText + 
                          afterSelection.substring(afterText.length);
        noteInput.focus();
        noteInput.setSelectionRange(start - beforeText.length, end - beforeText.length);
      } else if (altBefore && altAfter && 
                 noteInput.value.substring(Math.max(0, start - altBefore.length), start) === altBefore && 
                 noteInput.value.substring(end, Math.min(noteInput.value.length, end + altAfter.length)) === altAfter) {
        // Remove alternate formatting and apply new formatting
        const newBeforeSelection = beforeSelection.substring(0, beforeSelection.length - altBefore.length);
        const newAfterSelection = afterSelection.substring(altAfter.length);
        
        // Check if we need to add a space after the tag
        const spaceAfter = needsSpaceAfter ? ' ' : '';
        
        // Apply the new formatting without spaces
        noteInput.value = newBeforeSelection + beforeText + selectedText + afterText + spaceAfter + newAfterSelection;
        noteInput.focus();
        noteInput.setSelectionRange(start - altBefore.length + beforeText.length, end - altBefore.length + beforeText.length);
      } else {
        // Check if we need to add a space after the tag
        const spaceAfter = needsSpaceAfter ? ' ' : '';
        
        // Apply the formatting without spaces
        noteInput.value = beforeSelection + beforeText + selectedText + afterText + spaceAfter + afterSelection;
        noteInput.focus();
        noteInput.setSelectionRange(start + beforeText.length, end + beforeText.length);
      }
    }
    
    // Update the markdown preview
    updateMarkdownDisplay();
  }
  
  // Bold button - cycles between ** and __
  let boldState = 0; // 0 = **, 1 = __
  document.getElementById('bold-btn').addEventListener('click', () => {
    const formats = [
      { before: '**', after: '**', default: 'bold text' },
      { before: '__', after: '__', default: 'bold text' }
    ];
    
    const format = formats[boldState];
    wrapText(format.before, format.after, format.default);
    
    // Cycle to next format
    boldState = (boldState + 1) % formats.length;
  });
  
  // Italic button - cycles between * and _
  let italicState = 0; // 0 = *, 1 = _
  document.getElementById('italic-btn').addEventListener('click', () => {
    const formats = [
      { before: '*', after: '*', default: 'italic text' },
      { before: '_', after: '_', default: 'italic text' }
    ];
    
    const format = formats[italicState];
    wrapText(format.before, format.after, format.default);
    
    // Cycle to next format
    italicState = (italicState + 1) % formats.length;
  });
  
  // Strikethrough button
  document.getElementById('strike-btn').addEventListener('click', () => {
    wrapText('~~', '~~', 'strikethrough text');
  });
  
  // Header buttons
  document.getElementById('h1-btn').addEventListener('click', () => {
    const start = noteInput.selectionStart;
    const lineStart = noteInput.value.lastIndexOf('\n', start);
    const actualLineStart = lineStart === -1 ? 0 : lineStart + 1;
    
    // Check if line already starts with #
    const lineEnd = noteInput.value.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? noteInput.value.length : lineEnd;
    const currentLine = noteInput.value.substring(actualLineStart, actualLineEnd);
    
    if (currentLine.startsWith('# ')) {
      // Remove header
      noteInput.value = noteInput.value.substring(0, actualLineStart) + 
                        currentLine.substring(2) + 
                        noteInput.value.substring(actualLineEnd);
    } else if (currentLine.startsWith('## ') || currentLine.startsWith('### ')) {
      // Replace with H1
      noteInput.value = noteInput.value.substring(0, actualLineStart) + 
                        '# ' + currentLine.replace(/^#+\s/, '') + 
                        noteInput.value.substring(actualLineEnd);
    } else {
      // Add H1
      noteInput.value = noteInput.value.substring(0, actualLineStart) + 
                        '# ' + currentLine + 
                        noteInput.value.substring(actualLineEnd);
    }
    
    noteInput.focus();
    updateMarkdownDisplay();
  });
  
  document.getElementById('h2-btn').addEventListener('click', () => {
    const start = noteInput.selectionStart;
    const lineStart = noteInput.value.lastIndexOf('\n', start);
    const actualLineStart = lineStart === -1 ? 0 : lineStart + 1;
    
    // Check if line already starts with ##
    const lineEnd = noteInput.value.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? noteInput.value.length : lineEnd;
    const currentLine = noteInput.value.substring(actualLineStart, actualLineEnd);
    
    if (currentLine.startsWith('## ')) {
      // Remove header
      noteInput.value = noteInput.value.substring(0, actualLineStart) + 
                        currentLine.substring(3) + 
                        noteInput.value.substring(actualLineEnd);
    } else if (currentLine.startsWith('# ') || currentLine.startsWith('### ')) {
      // Replace with H2
      noteInput.value = noteInput.value.substring(0, actualLineStart) + 
                        '## ' + currentLine.replace(/^#+\s/, '') + 
                        noteInput.value.substring(actualLineEnd);
    } else {
      // Add H2
      noteInput.value = noteInput.value.substring(0, actualLineStart) + 
                        '## ' + currentLine + 
                        noteInput.value.substring(actualLineEnd);
    }
    
    noteInput.focus();
    updateMarkdownDisplay();
  });
  
  document.getElementById('h3-btn').addEventListener('click', () => {
    const start = noteInput.selectionStart;
    const lineStart = noteInput.value.lastIndexOf('\n', start);
    const actualLineStart = lineStart === -1 ? 0 : lineStart + 1;
    
    // Check if line already starts with ###
    const lineEnd = noteInput.value.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? noteInput.value.length : lineEnd;
    const currentLine = noteInput.value.substring(actualLineStart, actualLineEnd);
    
    if (currentLine.startsWith('### ')) {
      // Remove header
      noteInput.value = noteInput.value.substring(0, actualLineStart) + 
                        currentLine.substring(4) + 
                        noteInput.value.substring(actualLineEnd);
    } else if (currentLine.startsWith('# ') || currentLine.startsWith('## ')) {
      // Replace with H3
      noteInput.value = noteInput.value.substring(0, actualLineStart) + 
                        '### ' + currentLine.replace(/^#+\s/, '') + 
                        noteInput.value.substring(actualLineEnd);
    } else {
      // Add H3
      noteInput.value = noteInput.value.substring(0, actualLineStart) + 
                        '### ' + currentLine + 
                        noteInput.value.substring(actualLineEnd);
    }
    
    noteInput.focus();
    updateMarkdownDisplay();
  });
  
  // Add keyboard shortcuts
  noteInput.addEventListener('keydown', (e) => {
    // Bold: Ctrl+B
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      document.getElementById('bold-btn').click();
    }
    
    // Italic: Ctrl+I
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      document.getElementById('italic-btn').click();
    }
  });
}