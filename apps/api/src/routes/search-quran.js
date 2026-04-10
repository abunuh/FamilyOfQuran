import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, '').trim();

const chapterCache = {
  en: null,
  ar: null,
};

async function getChapterMap(language) {
  const key = language === 'ar' ? 'ar' : 'en';
  if (chapterCache[key]) {
    return chapterCache[key];
  }

  const response = await fetch(`https://api.quran.com/api/v4/chapters?language=${key}`);
  if (!response.ok) {
    throw new Error(`Quran chapters API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  chapterCache[key] = new Map(
    (data.chapters || []).map((chapter) => [
      Number(chapter.id),
      key === 'ar' ? chapter.name_arabic : chapter.name_simple,
    ])
  );

  return chapterCache[key];
}

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
    size: '20',
  });

  try {
    const response = await fetch(`https://api.quran.com/api/v4/search?${params}`);

    if (!response.ok) {
      throw new Error(`Quran.com API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const chapterMap = await getChapterMap(language);

    const results = (data.search?.results || []).map((result) => {
      const [surahIdText, verseNumberText] = String(result.verse_key || '').split(':');
      const surahId = Number(surahIdText);
      const verseNumber = Number(verseNumberText);
      const surahName = chapterMap.get(surahId) || `Surah ${surahId}`;
      const translationText = stripHtml(result.translations?.[0]?.text || '');

      return {
        id: result.verse_id,
        surahName,
        verseNumber,
        verseText: language === 'ar' ? result.text : (translationText || stripHtml(result.text || '')),
        verseReference: `${surahName} ${verseNumber}`,
        translation: language === 'en' ? translationText : undefined,
      };
    });

    res.json(results);
  } catch (err) {
    logger.error('Quran search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
