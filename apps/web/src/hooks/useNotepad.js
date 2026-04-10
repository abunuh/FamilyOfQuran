
import { useState, useEffect, useCallback } from 'react';

const NOTEPAD_KEY = 'fotq_notepad_content';

export function useNotepad() {
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTEPAD_KEY);
      if (stored) {
        setContent(stored);
      }
    } catch (error) {
      console.error('Failed to load notepad:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveContent = useCallback((newContent) => {
    setContent(newContent);
    localStorage.setItem(NOTEPAD_KEY, newContent);
    setLastSaved(Date.now());
  }, []);

  const appendToNotepad = useCallback((text) => {
    setContent((prev) => {
      const newContent = prev ? `${prev}\n\n${text}` : text;
      localStorage.setItem(NOTEPAD_KEY, newContent);
      setLastSaved(Date.now());
      return newContent;
    });
  }, []);

  const clearNotepad = useCallback(() => {
    setContent('');
    localStorage.removeItem(NOTEPAD_KEY);
    setLastSaved(Date.now());
  }, []);

  return {
    content,
    lastSaved,
    isLoaded,
    saveContent,
    appendToNotepad,
    clearNotepad
  };
}
