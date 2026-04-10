
import { useState, useEffect } from 'react';

const NOTES_KEY = 'fotq_bookmark_notes';

export function useNotes() {
  const [notes, setNotes] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTES_KEY);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveNotes = (newNotes) => {
    setNotes(newNotes);
    localStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
  };

  const addNote = (bookmarkId, content) => {
    const newNotes = {
      ...notes,
      [bookmarkId]: {
        content,
        updatedAt: Date.now()
      }
    };
    saveNotes(newNotes);
  };

  const deleteNote = (bookmarkId) => {
    const newNotes = { ...notes };
    delete newNotes[bookmarkId];
    saveNotes(newNotes);
  };

  const getNote = (bookmarkId) => notes[bookmarkId];

  return {
    notes,
    isLoaded,
    addNote,
    deleteNote,
    getNote
  };
}
