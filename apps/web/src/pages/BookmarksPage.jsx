
import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Trash2, BookmarkX, PenLine, Copy, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookmarks } from '@/hooks/useBookmarks.js';
import { useNotes } from '@/hooks/useNotes.js';
import { useNotepad } from '@/hooks/useNotepad.js';
import { copyToClipboard, copyWithReference, copyWithNotes } from '@/lib/copyUtils.js';
import QuranResultCard from '@/components/QuranResultCard.jsx';
import HadithResultCard from '@/components/HadithResultCard.jsx';
import NoteEditor from '@/components/NoteEditor.jsx';
import { toast } from 'sonner';

export default function BookmarksPage() {
  const { bookmarks, isLoaded, bulkRemoveBookmarks } = useBookmarks();
  const { notes, addNote, deleteNote, getNote } = useNotes();
  const { appendToNotepad } = useNotepad();
  
  const [activeTab, setActiveTab] = useState('quran');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [editingNoteId, setEditingNoteId] = useState(null);

  const filteredAndSortedBookmarks = useMemo(() => {
    let filtered = bookmarks.filter(b => b.type === activeTab);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => {
        const text = b.type === 'quran' ? b.data.verseText : b.data.hadithText;
        const ref = b.type === 'quran' ? b.data.verseReference : b.data.hadithReference;
        return text?.toLowerCase().includes(query) || ref?.toLowerCase().includes(query);
      });
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'newest') return b.timestamp - a.timestamp;
      if (sortBy === 'oldest') return a.timestamp - b.timestamp;
      if (sortBy === 'reference') {
        const refA = a.type === 'quran' ? a.data.verseReference : a.data.hadithReference;
        const refB = b.type === 'quran' ? b.data.verseReference : b.data.hadithReference;
        return refA?.localeCompare(refB);
      }
      return 0;
    });
  }, [bookmarks, activeTab, searchQuery, sortBy]);

  const handleSelectAll = (checked) => {
    if (checked) {
      const newSelected = new Set(selectedItems);
      filteredAndSortedBookmarks.forEach(b => newSelected.add(b.id));
      setSelectedItems(newSelected);
    } else {
      const newSelected = new Set(selectedItems);
      filteredAndSortedBookmarks.forEach(b => newSelected.delete(b.id));
      setSelectedItems(newSelected);
    }
  };

  const handleSelectItem = (id, checked) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    const itemsToRemove = Array.from(selectedItems).map(id => ({ id, type: activeTab }));
    bulkRemoveBookmarks(itemsToRemove);
    setSelectedItems(new Set());
    toast.success(`Removed ${itemsToRemove.length} bookmarks`);
  };

  const handleSaveNote = (bookmarkId, content) => {
    if (content.trim()) {
      addNote(bookmarkId, content);
      toast.success('Note saved');
    } else {
      deleteNote(bookmarkId);
      toast.info('Note removed');
    }
    setEditingNoteId(null);
  };

  if (!isLoaded) return null;

  const allSelected = filteredAndSortedBookmarks.length > 0 && 
    filteredAndSortedBookmarks.every(b => selectedItems.has(b.id));

  return (
    <>
      <Helmet>
        <title>My Bookmarks | Family of the Quran</title>
        <meta name="description" content="View and manage your saved Quran verses and Hadiths." />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="rounded-full">
                <Link to="/">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <h1 className="text-xl font-semibold text-foreground">My Bookmarks</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link to="/reading-history">History</Link>
              </Button>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link to="/notepad">Notepad</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <BookmarkX className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">No bookmarks yet</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                You haven't saved any verses or hadiths yet. Explore the collections and click the heart icon to save them here.
              </p>
              <Button asChild size="lg" className="rounded-full">
                <Link to="/">Explore Collections</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
                <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50 w-full md:w-auto">
                  <button
                    onClick={() => { setActiveTab('quran'); setSelectedItems(new Set()); }}
                    className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'quran' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Quran Verses
                  </button>
                  <button
                    onClick={() => { setActiveTab('hadith'); setSelectedItems(new Set()); }}
                    className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'hadith' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Hadiths
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search bookmarks..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 rounded-full bg-card"
                    />
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[160px] rounded-full bg-card">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="reference">Reference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredAndSortedBookmarks.length > 0 && (
                <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id="select-all" 
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                      Select All ({filteredAndSortedBookmarks.length})
                    </label>
                  </div>
                  {selectedItems.size > 0 && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleBulkDelete}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Selected ({selectedItems.size})
                    </Button>
                  )}
                </div>
              )}

              <div className="space-y-8">
                {filteredAndSortedBookmarks.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    No bookmarks match your search.
                  </div>
                ) : (
                  filteredAndSortedBookmarks.map((bookmark, index) => {
                    const note = getNote(bookmark.id);
                    const isEditing = editingNoteId === bookmark.id;
                    const text = activeTab === 'quran' ? bookmark.data.verseText : bookmark.data.hadithText;
                    const ref = activeTab === 'quran' ? `${bookmark.data.surahName} ${bookmark.data.verseNumber}` : `${bookmark.data.collectionName} ${bookmark.data.hadithNumber}`;

                    return (
                      <motion.div
                        key={bookmark.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="relative group"
                      >
                        <div className="absolute left-4 top-8 z-10">
                          <Checkbox 
                            checked={selectedItems.has(bookmark.id)}
                            onCheckedChange={(checked) => handleSelectItem(bookmark.id, checked)}
                            className="bg-background"
                          />
                        </div>
                        <div className="pl-12">
                          {activeTab === 'quran' ? (
                            <QuranResultCard result={bookmark.data} language="en" />
                          ) : (
                            <HadithResultCard result={bookmark.data} language="en" />
                          )}

                          {/* Notes & Actions Section */}
                          <div className="mt-3 pl-2 pr-2">
                            {!isEditing && !note && (
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setEditingNoteId(bookmark.id)} className="text-muted-foreground">
                                  <PenLine className="w-4 h-4 mr-2" /> Add Note
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => copyWithReference(text, ref)} className="text-muted-foreground">
                                  <Copy className="w-4 h-4 mr-2" /> Copy
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => { appendToNotepad(`"${text}"\n— ${ref}`); toast.success('Added to Notepad'); }} className="text-muted-foreground">
                                  <FileText className="w-4 h-4 mr-2" /> To Notepad
                                </Button>
                              </div>
                            )}

                            {!isEditing && note && (
                              <div className="bg-[hsl(var(--note-editor-bg))] border border-[hsl(var(--note-editor-border))] rounded-xl p-4 mt-2">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">My Note</span>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyWithNotes(text, ref, note.content)}>
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingNoteId(bookmark.id)}>
                                      <PenLine className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                                <div className="text-[10px] text-muted-foreground mt-3 text-right">
                                  Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                                </div>
                              </div>
                            )}

                            <NoteEditor 
                              isOpen={isEditing}
                              initialContent={note?.content || ''}
                              onSave={(content) => handleSaveNote(bookmark.id, content)}
                              onCancel={() => setEditingNoteId(null)}
                              onDelete={() => { deleteNote(bookmark.id); setEditingNoteId(null); toast.info('Note deleted'); }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
