document.getElementById('save-btn').addEventListener('click', () => {
  const note = document.getElementById('note-input').value;
  if (note) {
    const noteContainer = document.getElementById('note-container');
    const newNote = document.createElement('div');
    newNote.textContent = note;
    noteContainer.appendChild(newNote);
    localStorage.setItem('notes', noteContainer.innerHTML);
    document.getElementById('note-input').value = '';
  }
});

window.onload = () => {
  const savedNotes = localStorage.getItem('notes');
  if (savedNotes) {
    document.getElementById('note-container').innerHTML = savedNotes;
  }
};
