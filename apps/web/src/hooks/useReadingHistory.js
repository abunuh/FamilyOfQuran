
import { useState, useEffect } from 'react';

const HISTORY_KEY = 'fotq_reading_history';

export function useReadingHistory() {
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadHistory();
    window.addEventListener('readingHistoryUpdated', loadHistory);
    return () => window.removeEventListener('readingHistoryUpdated', loadHistory);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  const deleteItem = (id) => {
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    setHistory(updated);
  };

  return {
    history,
    isLoaded,
    clearHistory,
    deleteItem
  };
}
