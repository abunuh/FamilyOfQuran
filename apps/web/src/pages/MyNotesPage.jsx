
import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Copy, Trash2, Heading } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNotepad } from '@/hooks/useNotepad.js';
import { copyToClipboard } from '@/lib/copyUtils.js';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

export default function MyNotesPage() {
  const { content, lastSaved, isLoaded, saveContent, clearNotepad } = useNotepad();
  const textareaRef = useRef(null);

  if (!isLoaded) return null;

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleExportTXT = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'My_Islamic_Notes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as TXT');
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica");
      const splitText = doc.splitTextToSize(content, 180);
      doc.text(splitText, 15, 20);
      doc.save('My_Islamic_Notes.pdf');
      toast.success('Exported as PDF');
    } catch (err) {
      toast.error('Failed to export PDF');
    }
  };

  const insertHeader = () => {
    const header = '\n\n=== New Section ===\n\n';
    const newContent = content + header;
    saveContent(newContent);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <>
      <Helmet>
        <title>My Notepad | Family of the Quran</title>
      </Helmet>

      <div className="min-h-screen bg-[hsl(var(--notepad-bg))] flex flex-col">
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="rounded-full">
                <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
              </Button>
              <h1 className="text-xl font-semibold text-foreground">My Notepad</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportTXT} className="hidden sm:flex">
                <Download className="w-4 h-4 mr-2" /> TXT
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF} className="hidden sm:flex">
                <Download className="w-4 h-4 mr-2" /> PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(content)}>
                <Copy className="w-4 h-4 mr-2" /> Copy All
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={insertHeader}>
                <Heading className="w-4 h-4 mr-2" /> Add Section
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { if(confirm('Clear all notes?')) clearNotepad(); }} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Clear
              </Button>
            </div>
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                Saved {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
          </div>

          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => saveContent(e.target.value)}
            placeholder="Start typing your notes, reflections, or paste verses here..."
            className="flex-1 min-h-[60vh] bg-transparent border-[hsl(var(--notepad-border))] focus-visible:ring-1 focus-visible:ring-primary text-[hsl(var(--notepad-text))] text-lg leading-relaxed p-6 rounded-xl shadow-sm resize-none"
          />

          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>
        </main>
      </div>
    </>
  );
}
