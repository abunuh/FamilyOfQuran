
import React, { useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function QuranSearchForm({ onSearch, isLoading, language }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  const isArabic = language === 'ar';

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <div className={`absolute ${isArabic ? 'right-4' : 'left-4'} text-muted-foreground`}>
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
        
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isArabic ? "ابحث في القرآن الكريم..." : "Search the Holy Quran..."}
          dir={isArabic ? "rtl" : "ltr"}
          className={`w-full h-14 pl-12 pr-12 text-lg rounded-2xl border-2 border-muted bg-card shadow-sm focus-visible:ring-0 focus-visible:border-primary transition-colors ${
            isArabic ? 'font-arabic pr-12 pl-12' : ''
          }`}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute ${isArabic ? 'left-4' : 'right-4'} p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="mt-4 flex justify-center">
        <Button 
          type="submit" 
          disabled={!query.trim() || isLoading}
          size="lg"
          className="rounded-full px-8"
        >
          {isArabic ? 'بحث' : 'Search'}
        </Button>
      </div>
    </form>
  );
}
