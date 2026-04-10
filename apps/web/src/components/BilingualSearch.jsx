
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import SearchHeader from './SearchHeader.jsx';
import QuranSearchForm from './QuranSearchForm.jsx';
import HadithSearchForm from './HadithSearchForm.jsx';
import SearchResults from './SearchResults.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import { useBookmarks } from '@/hooks/useBookmarks.js';

export default function BilingualSearch() {
  const [tab, setTab] = useState('quran');
  const [language, setLanguage] = useState('en');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { bookmarks, isLoaded } = useBookmarks();

  const handleSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = tab === 'quran' ? '/search/quran' : '/search/hadith';
      const response = await apiServerClient.fetch(`${endpoint}?query=${encodeURIComponent(query)}&language=${language}`);
      
      if (!response.ok) {
        let errorMsg = 'Failed to fetch search results. Please try again.';
        try {
          const errData = await response.json();
          if (errData?.error) errorMsg = errData.error;
        } catch (_) { /* ignore parse failure */ }
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An unexpected error occurred.');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setResults(null);
    setError(null);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setResults(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6 sm:p-10 shadow-sm relative">
      {isLoaded && bookmarks.length > 0 && (
        <div className="absolute -top-4 right-6 sm:right-10">
          <Link 
            to="/bookmarks" 
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium shadow-md hover:bg-primary/90 transition-colors"
          >
            <Bookmark className="w-4 h-4 fill-current" />
            <span>{bookmarks.length} Saved</span>
          </Link>
        </div>
      )}

      <SearchHeader 
        activeTab={tab} 
        setActiveTab={handleTabChange} 
        language={language} 
        setLanguage={handleLanguageChange} 
      />
      
      <div className="mt-8">
        {tab === 'quran' ? (
          <QuranSearchForm 
            onSearch={handleSearch} 
            isLoading={isLoading} 
            language={language} 
          />
        ) : (
          <HadithSearchForm 
            onSearch={handleSearch} 
            isLoading={isLoading} 
            language={language} 
          />
        )}
      </div>

      <SearchResults 
        results={results} 
        isLoading={isLoading} 
        error={error} 
        tab={tab} 
        language={language} 
      />
    </div>
  );
}
