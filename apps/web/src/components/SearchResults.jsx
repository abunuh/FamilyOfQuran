
import React from 'react';
import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import QuranResultCard from './QuranResultCard.jsx';
import HadithResultCard from './HadithResultCard.jsx';

export default function SearchResults({ results, isLoading, error, tab, language }) {
  if (isLoading) {
    return (
      <div className="space-y-6 mt-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-2xl border border-border/50 bg-card">
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-center">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  if (results.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-16 flex flex-col items-center justify-center text-center p-8"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <SearchX className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {language === 'ar' ? 'لم يتم العثور على نتائج' : 'No results found'}
        </h3>
        <p className="text-muted-foreground max-w-md">
          {language === 'ar' 
            ? 'حاول استخدام كلمات مفتاحية مختلفة أو تأكد من صحة الإملاء.' 
            : 'Try adjusting your search terms or check for spelling errors.'}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mt-12 space-y-6">
      <div className="text-sm font-medium text-muted-foreground mb-6 px-2">
        {language === 'ar' 
          ? `تم العثور على ${results.length} نتيجة` 
          : `Found ${results.length} results`}
      </div>
      
      {results.map((result, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          {tab === 'quran' ? (
            <QuranResultCard result={result} language={language} />
          ) : (
            <HadithResultCard result={result} language={language} />
          )}
        </motion.div>
      ))}
    </div>
  );
}
