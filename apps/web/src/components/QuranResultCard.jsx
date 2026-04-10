
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart, Share2, ChevronDown, Copy, Twitter, Facebook, MessageCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookmarks } from '@/hooks/useBookmarks.js';
import { useNotepad } from '@/hooks/useNotepad.js';
import { copyToClipboard, copyWithReference } from '@/lib/copyUtils.js';
import { addToHistory } from '@/lib/readingHistoryTracker.js';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export default function QuranResultCard({ result, language }) {
  const isArabic = language === 'ar';
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimatingHeart, setIsAnimatingHeart] = useState(false);
  
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { appendToNotepad } = useNotepad();
  
  const verseId = result.id || result.verseReference;
  const bookmarked = isBookmarked(verseId, 'quran');

  const handleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (newExpanded) {
      addToHistory(result, 'quran');
    }
  };

  const handleBookmark = () => {
    setIsAnimatingHeart(true);
    const added = toggleBookmark(verseId, 'quran', result);
    if (added) {
      toast.success('Verse added to bookmarks');
    } else {
      toast.info('Verse removed from bookmarks');
    }
    setTimeout(() => setIsAnimatingHeart(false), 300);
  };

  const handleAddToNotepad = () => {
    const text = `"${result.verseText}"\n— ${result.surahName} ${result.verseNumber}`;
    appendToNotepad(text);
    toast.success('Added to Notepad');
  };

  const shareText = `"${result.verseText}" - ${result.surahName} ${result.verseNumber} | Family of the Quran`;

  const handleShare = (platform) => {
    const encodedText = encodeURIComponent(shareText);
    let url = '';
    switch (platform) {
      case 'twitter': url = `https://twitter.com/intent/tweet?text=${encodedText}`; break;
      case 'whatsapp': url = `https://wa.me/?text=${encodedText}`; break;
      case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`; break;
      default: return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border-border/50">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-foreground text-lg">
                  {result.surahName}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {result.revelationType || 'Meccan'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Verse {result.verseNumber}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground whitespace-nowrap mr-2">
              {result.verseReference}
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBookmark}
              className={`rounded-full transition-colors ${bookmarked ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Heart className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''} ${isAnimatingHeart ? 'animate-heart-pulse' : ''}`} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                  <Share2 className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => copyToClipboard(result.verseText)} className="cursor-pointer">
                  <Copy className="w-4 h-4 mr-2" /> Copy Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyWithReference(result.verseText, `${result.surahName} ${result.verseNumber}`)} className="cursor-pointer">
                  <Copy className="w-4 h-4 mr-2" /> Copy with Reference
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAddToNotepad} className="cursor-pointer">
                  <FileText className="w-4 h-4 mr-2" /> Add to Notepad
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleShare('twitter')} className="cursor-pointer">
                  <Twitter className="w-4 h-4 mr-2" /> Share to X
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="cursor-pointer">
                  <MessageCircle className="w-4 h-4 mr-2" /> Share to WhatsApp
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div 
          className={`mt-6 text-foreground ${
            isArabic 
              ? 'font-arabic text-2xl sm:text-3xl leading-loose text-right' 
              : 'text-lg leading-relaxed'
          }`}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {result.verseText}
        </div>

        <div className="mt-6 pt-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleExpand}
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </Button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2 space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <span className="block text-muted-foreground mb-1">Surah Meaning</span>
                      <span className="font-medium text-foreground">{result.surahMeaning || 'The Opening'}</span>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <span className="block text-muted-foreground mb-1">Revelation</span>
                      <span className="font-medium text-foreground">{result.revelationType || 'Meccan'}</span>
                    </div>
                  </div>
                  {result.translation && (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <span className="block text-muted-foreground mb-2 font-medium">Translation</span>
                      <p className="text-foreground leading-relaxed">{result.translation}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
