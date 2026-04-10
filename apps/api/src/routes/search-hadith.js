import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

const BOOK_IDS = ['bukhari', 'muslim', 'tirmidzi'];
const BOOK_RANGE = '1-300';
const CACHE_TTL_MS = 10 * 60 * 1000;

const hadithCache = new Map();

async function getBookHadiths(bookId) {
  const cacheEntry = hadithCache.get(bookId);
  if (cacheEntry && (Date.now() - cacheEntry.fetchedAt) < CACHE_TTL_MS) {
    return cacheEntry.items;
  }

  const response = await fetch(`https://api.hadith.gading.dev/books/${bookId}?range=${BOOK_RANGE}`);
  if (!response.ok) {
    throw new Error(`Hadith API error (${bookId}): ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const items = data?.data?.hadiths || [];
  hadithCache.set(bookId, { fetchedAt: Date.now(), items });
  return items;
}

router.get('/hadith', async (req, res) => {
  const { query, language = 'en' } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  if (!['en', 'ar'].includes(language)) {
    return res.status(400).json({ error: 'Language must be either "en" or "ar"' });
  }

  logger.info(`Searching Hadith with query: "${query}" in language: ${language}`);

  const normalizedQuery = String(query).trim().toLowerCase();
  const hadithTextField = language === 'ar' ? 'arab' : 'id';

  const books = await Promise.all(
    BOOK_IDS.map(async (bookId) => ({
      bookId,
      items: await getBookHadiths(bookId),
    }))
  );

  const results = books
    .flatMap(({ bookId, items }) =>
      items.map((item) => ({
        bookId,
        number: item.number,
        arab: item.arab,
        id: item.id,
      }))
    )
    .filter((item) => {
      const searchable = `${item.id || ''} ${item.arab || ''}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    })
    .slice(0, 50)
    .map((item) => ({
      id: `${item.bookId}-${item.number}`,
      hadithText: item[hadithTextField] || item.id || item.arab,
      collectionName: `HR. ${item.bookId.replace('-', ' ')}`,
      hadithNumber: item.number,
      hadithReference: `${item.bookId} ${item.number}`,
    }));

  res.json(results);
});

export default router;
