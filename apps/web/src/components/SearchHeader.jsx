
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function SearchHeader({ activeTab, setActiveTab, language, setLanguage }) {
  const tabs = [
    { id: 'quran', label: 'Search Quran' },
    { id: 'hadith', label: 'Search Hadith' }
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
      {/* Tabs */}
      <div className="relative flex items-center p-1 bg-muted/50 rounded-xl border border-border/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
              activeTab === tab.id ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeSearchTab"
                className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Language Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
        className="flex items-center gap-2 rounded-full px-4 border-border/50 hover:bg-muted/50"
      >
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">{language === 'en' ? 'English' : 'العربية'}</span>
      </Button>
    </div>
  );
}
