import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

const BOOKS = [
  { id: 'bukhari', slug: 'bukhari' },
  { id: 'muslim', slug: 'muslim' },
  { id: 'tirmidzi', slug: 'tirmidhi' },
  { id: 'abu-daud', slug: 'abudawud' },
  { id: 'nasai', slug: 'nasai' },
  { id: 'ibnu-majah', slug: 'ibnmajah' },
  { id: 'ahmad', slug: 'ahmad' },
  { id: 'darimi', slug: 'darimi' },
  { id: 'malik', slug: 'malik' },
];
const CACHE_TTL_MS = 10 * 60 * 1000;
const FETCH_TIMEOUT_MS = 45_000;
const FETCH_RETRY_COUNT = 2;
const HADITH_DATA_BASE_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';
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

function getLanguageEdition(language) {
  return language === 'ar' ? 'ara' : 'eng';
}

function getCacheKey(bookId, language) {
  return `${language}:${bookId}`;
}

async function fetchWithTimeout(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchBookWithRetry(book, language, attempts = FETCH_RETRY_COUNT) {
  let lastError;
  const edition = getLanguageEdition(language);
  const datasetUrl = `${HADITH_DATA_BASE_URL}/${edition}-${book.slug}.json`;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(datasetUrl);
      if (!response.ok) {
        throw new Error(`Hadith API error (${book.id}): ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data?.hadiths || [];
    } catch (error) {
      lastError = error;
      logger.warn(`Hadith fetch failed for ${book.id} attempt ${attempt}/${attempts}: ${error?.message || String(error)}`);
    }
  }

  throw lastError || new Error(`Hadith fetch failed for ${book.id}`);
}

async function getBookHadiths(book, language) {
  const cacheKey = getCacheKey(book.id, language);
  const cacheEntry = hadithCache.get(cacheKey);
  if (cacheEntry && (Date.now() - cacheEntry.fetchedAt) < CACHE_TTL_MS) {
    return cacheEntry.items;
  }

  const items = await fetchBookWithRetry(book, language);
  hadithCache.set(cacheKey, { fetchedAt: Date.now(), items });
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
    const books = [];
    const failedBooks = [];

    for (const book of BOOKS) {
      try {
        const items = await getBookHadiths(book, language);
        books.push({ bookId: book.id, items });
      } catch (error) {
        failedBooks.push(book.id);
        logger.warn(`Skipping hadith collection ${book.id}: ${error?.message || String(error)}`);
      }
    }

    if (failedBooks.length > 0) {
      logger.warn(`Hadith provider unavailable for: ${failedBooks.join(', ')}`);
    }

    if (!books.length) {
      return res.status(502).json({ error: 'Hadith provider temporarily unavailable. Please try again.' });
    }

    const results = books
      .flatMap(({ bookId, items }) =>
        items.map((item) => ({
          bookId,
          number: String(item.hadithnumber || item.arabicnumber || '').trim(),
          text: item.text || '',
        }))
      )
      .filter((item) => {
        if (language === 'ar') {
          return normalizeArabic(item.text || '').includes(normalizedQuery);
        }

        return normalizeText(item.text || '').includes(normalizedQuery);
      })
      .slice(0, 50)
      .map((item) => ({
        id: `${item.bookId}-${item.number}`,
        hadithText: item.text,
        collectionName: formatCollectionName(item.bookId),
        hadithNumber: item.number,
        hadithReference: `${item.bookId} ${item.number}`,
      }));

    res.json(results);
  } catch (err) {
    logger.error('Hadith search error:', err.stack || err.message || err);
    res.status(500).json({ error: 'Hadith search failed. Please try again shortly.' });
  }
});

export default router;
