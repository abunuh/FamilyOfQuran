import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

const BOOK_IDS = [
  'bukhari',
  'muslim',
  'tirmidzi',
  'abu-daud',
  'nasai',
  'ibnu-majah',
  'ahmad',
  'darimi',
  'malik',
];
const BOOK_RANGE = '1-300';
const CACHE_TTL_MS = 10 * 60 * 1000;
const ARABIC_DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

const hadithCache = new Map();

function normalizeText(value = '') {
  return String(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeArabic(value = '') {
  return normalizeText(value)
    .replace(ARABIC_DIACRITICS_REGEX, '')
    .replace(/ـ/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه');
}

function formatCollectionName(bookId) {
  return `HR. ${bookId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')}`;
}

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

  try {
    const normalizedQuery = language === 'ar'
      ? normalizeArabic(query)
      : normalizeText(query);
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
        if (language === 'ar') {
          return normalizeArabic(item.arab || '').includes(normalizedQuery);
        }

        const searchableEn = normalizeText(item.id || '');
        return searchableEn.includes(normalizedQuery);
      })
      .slice(0, 50)
      .map((item) => ({
        id: `${item.bookId}-${item.number}`,
        hadithText: item[hadithTextField] || item.id || item.arab,
        collectionName: formatCollectionName(item.bookId),
        hadithNumber: item.number,
        hadithReference: `${item.bookId} ${item.number}`,
      }));

    res.json(results);
  } catch (err) {
    logger.error('Hadith search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
