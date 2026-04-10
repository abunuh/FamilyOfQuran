
const HISTORY_KEY = 'fotq_reading_history';

export const addToHistory = (item, type) => {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    
    // Avoid duplicate consecutive entries
    if (history.length > 0) {
      const lastItem = history[0];
      const currentId = item.id || (type === 'quran' ? item.verseReference : item.hadithReference);
      const lastId = lastItem.data.id || (lastItem.type === 'quran' ? lastItem.data.verseReference : lastItem.data.hadithReference);
      
      if (currentId === lastId && lastItem.type === type) {
        return; // Skip duplicate
      }
    }

    const newEntry = {
      id: crypto.randomUUID(),
      type,
      data: item,
      timestamp: Date.now()
    };

    const updatedHistory = [newEntry, ...history].slice(0, 100); // Keep last 100
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    
    // Dispatch custom event for hooks to listen to
    window.dispatchEvent(new Event('readingHistoryUpdated'));
  } catch (error) {
    console.error('Failed to add to reading history:', error);
  }
};
