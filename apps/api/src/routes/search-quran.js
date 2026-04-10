import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, '').trim();
const ARABIC_DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ARABIC_QURAN_CACHE_TTL_MS = 60 * 60 * 1000;

const normalizeQuery = (value = '', language = 'en') => {
  const normalized = String(value).normalize('NFKC').trim();
  if (language !== 'ar') {
    return normalized;
  }

  return normalized
    .replace(ARABIC_DIACRITICS_REGEX, '')
    .replace(/ـ/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
};

const chapterCache = {
  en: null,
  ar: null,
};

const arabicQuranCache = {
  verses: null,
  fetchedAt: 0,
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

async function getArabicVerses() {
  if (arabicQuranCache.verses && (Date.now() - arabicQuranCache.fetchedAt) < ARABIC_QURAN_CACHE_TTL_MS) {
    return arabicQuranCache.verses;
  }

  const response = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani', {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Arabic Quran API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const verses = (data.data?.surahs || []).flatMap((surah) =>
    (surah.ayahs || []).map((ayah) => ({
      id: ayah.number,
      surahId: surah.number,
      verseNumber: ayah.numberInSurah,
      verseText: ayah.text,
    }))
  );

  arabicQuranCache.verses = verses;
  arabicQuranCache.fetchedAt = Date.now();

  return verses;
}

router.get('/quran', async (req, res) => {
  const { query, language = 'en' } = req.query;
  const normalizedQuery = normalizeQuery(query, language);

  if (!normalizedQuery) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  if (!['en', 'ar'].includes(language)) {
    return res.status(400).json({ error: 'Language must be either "en" or "ar"' });
  }

  logger.info(`Searching Quran with query: "${query}" in language: ${language}`);

  const params = new URLSearchParams({
    q: normalizedQuery,
    language: language,
    size: '20',
  });

  try {
    if (language === 'ar') {
      const [chapterMap, arabicVerses] = await Promise.all([
        getChapterMap('ar'),
        getArabicVerses(),
      ]);

      const results = arabicVerses
        .filter((verse) => normalizeQuery(verse.verseText, 'ar').includes(normalizedQuery))
        .slice(0, 20)
        .map((verse) => {
          const surahName = chapterMap.get(verse.surahId) || `سورة ${verse.surahId}`;

          return {
            id: verse.id,
            surahName,
            verseNumber: verse.verseNumber,
            verseText: verse.verseText,
            verseReference: `${surahName} ${verse.verseNumber}`,
          };
        });

      return res.json(results);
    }

    const response = await fetch(`https://api.quran.com/api/v4/search?${params}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Quran.com API error: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    if (!responseText.trim()) {
      throw new Error('Quran.com API returned an empty response');
    }

    const data = JSON.parse(responseText);
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
