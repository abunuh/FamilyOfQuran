
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function NoteEditor({ initialContent = '', onSave, onCancel, onDelete, isOpen }) {
  const [content, setContent] = useState(initialContent);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden mt-4"
      >
        <div className="bg-[hsl(var(--note-editor-bg))] border border-[hsl(var(--note-editor-border))] rounded-xl p-4 shadow-sm">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your reflections or notes here..."
            className="min-h-[120px] bg-transparent border-none focus-visible:ring-0 resize-y p-0 text-foreground placeholder:text-muted-foreground"
          />
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[hsl(var(--note-editor-border))]">
            <div className="text-xs text-muted-foreground">
              {content.length} characters
            </div>
            <div className="flex items-center gap-2">
              {onDelete && initialContent && (
                <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button size="sm" onClick={() => onSave(content)}>
                <Save className="w-4 h-4 mr-2" /> Save Note
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
