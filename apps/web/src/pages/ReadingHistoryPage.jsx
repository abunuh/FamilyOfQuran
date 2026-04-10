
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Trash2, History, BookOpen, ScrollText, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReadingHistory } from '@/hooks/useReadingHistory.js';
import { useBookmarks } from '@/hooks/useBookmarks.js';
import { copyWithReference } from '@/lib/copyUtils.js';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ReadingHistoryPage() {
  const { history, isLoaded, clearHistory, deleteItem } = useReadingHistory();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isLoaded) return null;

  const filteredHistory = history.filter(item => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const text = item.type === 'quran' ? item.data.verseText : item.data.hadithText;
    const ref = item.type === 'quran' ? item.data.verseReference : item.data.hadithReference;
    return text?.toLowerCase().includes(query) || ref?.toLowerCase().includes(query);
  });

  const handleBookmark = (item) => {
    const id = item.data.id || (item.type === 'quran' ? item.data.verseReference : item.data.hadithReference);
    const added = toggleBookmark(id, item.type, item.data);
    if (added) toast.success('Added to bookmarks');
    else toast.info('Removed from bookmarks');
  };

  return (
    <>
      <Helmet>
        <title>Reading History | Family of the Quran</title>
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="rounded-full">
                <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
              </Button>
              <h1 className="text-xl font-semibold text-foreground">Reading History</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <History className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">No history yet</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Items you view will automatically appear here.
              </p>
              <Button asChild size="lg" className="rounded-full">
                <Link to="/">Start Reading</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search history..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 rounded-full bg-card"
                  />
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                      Clear History
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your reading history. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => { clearHistory(); toast.success('History cleared'); }}>
                        Clear History
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="space-y-4">
                {filteredHistory.map((item, index) => {
                  const isQuran = item.type === 'quran';
                  const text = isQuran ? item.data.verseText : item.data.hadithText;
                  const ref = isQuran ? item.data.verseReference : item.data.hadithReference;
                  const title = isQuran ? item.data.surahName : item.data.collectionName;
                  const id = item.data.id || ref;
                  const bookmarked = isBookmarked(id, item.type);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="bg-[hsl(var(--history-card-bg))] border border-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {isQuran ? <BookOpen className="w-4 h-4 text-primary" /> : <ScrollText className="w-4 h-4 text-secondary-foreground" />}
                          <span className="text-sm font-medium text-foreground">{title}</span>
                          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">{ref}</span>
                          <span className="text-xs text-[hsl(var(--history-timestamp-color))] ml-auto">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-foreground line-clamp-2 text-sm leading-relaxed" dir="auto">
                          {text}
                        </p>
                      </div>
                      
                      <div className="flex sm:flex-col gap-2 justify-end sm:justify-start border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-4">
                        <Button variant="ghost" size="sm" onClick={() => handleBookmark(item)} className={bookmarked ? 'text-primary' : 'text-muted-foreground'}>
                          {bookmarked ? 'Saved' : 'Save'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => copyWithReference(text, ref)} className="text-muted-foreground">
                          Copy
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)} className="text-destructive hover:bg-destructive/10">
                          Delete
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
                {filteredHistory.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">No matching history found.</div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
