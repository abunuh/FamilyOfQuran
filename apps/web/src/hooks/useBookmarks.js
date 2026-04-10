
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'fotq_bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveBookmarks = (newBookmarks) => {
    setBookmarks(newBookmarks);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  };

  const addBookmark = (id, type, data) => {
    if (isBookmarked(id, type)) return;
    
    const newBookmark = {
      id,
      type,
      data,
      timestamp: Date.now()
    };
    
    saveBookmarks([...bookmarks, newBookmark]);
  };

  const removeBookmark = (id, type) => {
    saveBookmarks(bookmarks.filter(b => !(b.id === id && b.type === type)));
  };

  const toggleBookmark = (id, type, data) => {
    if (isBookmarked(id, type)) {
      removeBookmark(id, type);
      return false;
    } else {
      addBookmark(id, type, data);
      return true;
    }
  };

  const isBookmarked = (id, type) => {
    return bookmarks.some(b => b.id === id && b.type === type);
  };

  const getAllBookmarks = () => bookmarks;

  const getBookmarksByType = (type) => {
    return bookmarks.filter(b => b.type === type);
  };

  const bulkRemoveBookmarks = (idsWithType) => {
    const toRemove = new Set(idsWithType.map(item => `${item.type}-${item.id}`));
    saveBookmarks(bookmarks.filter(b => !toRemove.has(`${b.type}-${b.id}`)));
  };

  return {
    bookmarks,
    isLoaded,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    getAllBookmarks,
    getBookmarksByType,
    bulkRemoveBookmarks
  };
}
