import { useState, useEffect, useRef, memo } from "react";
import { Textarea } from "@/Top/Component/UI/textarea";
import { useNotes } from "@/Middle/Hook/Use-Notes";
import { useAuth } from "@/Middle/Context/Auth-Context";
import { surahList } from "@/Bottom/API/Quran";
import { Loader2, NotebookPen, Save, Trash2, Lightbulb, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/Middle/Hook/Use-Mobile";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { ScrollArea } from "@/Top/Component/UI/scroll-area";

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahId: number;
  ayahId?: number;
  verseText?: string;
}

export const NotesDialog = memo(function NotesDialog({ 
  open, 
  onOpenChange, 
  surahId, 
  ayahId, 
  verseText 
}: NotesDialogProps) {
  const { user } = useAuth();
  const { saveNote, getNote, deleteNote, isLoading } = useNotes();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const surah = surahList.find((s) => s.id === surahId);
  const existingNote = getNote(surahId, ayahId);

  useEffect(() => {
    if (open && existingNote) {
      setContent(existingNote.content);
    } else if (open) {
      setContent("");
    }
  }, [open, existingNote]);

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    const success = await saveNote(surahId, content, ayahId);
    setIsSaving(false);
    if (success) onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!existingNote) return;
    setIsDeleting(true);
    const success = await deleteNote(existingNote.id);
    setIsDeleting(false);
    if (success) {
      setContent("");
      onOpenChange(false);
    }
  };

  if (!open) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-40 bg-background pt-[72px]">
        <div className="h-full overflow-y-auto">
          <div className="p-4 sm:p-6 mx-auto max-w-2xl">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="glass-icon-btn w-16 h-16 mb-4 pointer-events-none">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-6">Please sign in to save your notes.</p>
              <div className="flex gap-3">
                <button className="glass-btn px-6 py-2" onClick={() => onOpenChange(false)}>{t.common.cancel}</button>
                <button className="glass-btn px-6 py-2 bg-primary text-primary-foreground" onClick={() => { onOpenChange(false); navigate("/Sign-In"); }}>Sign In</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="glass-card p-3 flex items-start gap-3">
        <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Reflecting on the Quran (Tadabbur) involves pondering over its meanings and how they apply to your life.
        </p>
      </div>

      {verseText && (
        <div className="glass-card p-4">
          <p className="text-right font-arabic text-lg leading-loose" dir="rtl">{verseText}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
            {existingNote ? t.common.edit : "New"}
          </span>
          Your Note
        </label>
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Use this space to save general notes, or to write a reflection..."
          className="min-h-[200px] resize-none glass-input border-0 rounded-2xl"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        {existingNote ? (
          <button className="glass-btn px-4 py-2 text-destructive text-sm" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            {t.common.delete}
          </button>
        ) : <div />}
        <button className="glass-btn px-6 py-2 bg-primary text-primary-foreground text-sm" onClick={handleSave} disabled={isSaving || !content.trim()}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {t.common.save} Privately
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-40 bg-background pt-[72px]">
        <div ref={scrollRef} className="h-full overflow-y-auto overscroll-contain">
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-semibold text-foreground text-center">
              My Notes – {surah?.englishName} {ayahId ? `${ayahId}` : ''}
            </h2>
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-background pt-[72px]">
      <ScrollArea className="h-full" ref={scrollRef}>
        <div className="p-6 mx-auto max-w-2xl">
          <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
            My Notes – {surah?.englishName} {ayahId ? `${ayahId}` : ''}
          </h2>
          {renderContent()}
        </div>
      </ScrollArea>
    </div>
  );
});