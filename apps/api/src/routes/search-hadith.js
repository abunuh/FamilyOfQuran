import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/hadith', async (req, res) => {
  const { query, language = 'en' } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  if (!['en', 'ar'].includes(language)) {
    return res.status(400).json({ error: 'Language must be either "en" or "ar"' });
  }

  logger.info(`Searching Hadith with query: "${query}" in language: ${language}`);

  const params = new URLSearchParams({
    q: query,
    language: language,
  });

  const response = await fetch(`https://api.sunnah.com/v1/search?${params}`);

  if (!response.ok) {
    throw new Error(`Sunnah.com API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  const results = data.results?.map((result) => ({
    hadithText: result.text,
    collectionName: result.collection_name,
    hadithNumber: result.hadith_number,
    hadithReference: `${result.collection_name} ${result.hadith_number}`,
  })) || [];

  res.json(results);
});

export default router;
