import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/quran', async (req, res) => {
  const { query, language = 'en' } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  if (!['en', 'ar'].includes(language)) {
    return res.status(400).json({ error: 'Language must be either "en" or "ar"' });
  }

  logger.info(`Searching Quran with query: "${query}" in language: ${language}`);

  const params = new URLSearchParams({
    q: query,
    language: language,
  });

  const response = await fetch(`https://api.quran.com/v4/search?${params}`);

  if (!response.ok) {
    throw new Error(`Quran.com API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  const results = data.results?.map((result) => ({
    surahName: result.surah_name,
    verseNumber: result.verse_number,
    verseText: result.text,
    verseReference: `${result.surah_name} ${result.verse_number}`,
  })) || [];

  res.json(results);
});

export default router;
