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

// Handle Clear All Notes button
document.getElementById('clear-btn').addEventListener('click', () => {
  document.getElementById('note-container').innerHTML = '';
  localStorage.removeItem('notes');
});

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
        const noteContainer = document.getElementById('note-container');
        noteContainer.appendChild(createNoteElement(text));
        updateLocalStorage();
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
        const noteContainer = document.getElementById('note-container');
        noteContainer.appendChild(createNoteElement(text.trim()));
        updateLocalStorage();
      }
    } catch (err) {
      alert('Unable to read clipboard: ' + err);
    }
  });
};
