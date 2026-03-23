import { useState, useRef, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/Top/Component/UI/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Top/Component/UI/select";
import { Avatar, AvatarFallback } from "@/Top/Component/UI/avatar";
import { Heart, MessageCircle, Share2, MoreHorizontal, Info, Sparkles, BookOpen, ArrowUp } from "lucide-react";
import { surahList } from "@/Bottom/API/Quran";

import { cn } from "@/Middle/Library/utils";
import { useIsMobile } from "@/Middle/Hook/Use-Mobile";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { PanelHeader } from "@/Top/Component/Layout/Panel-Header";


interface ReflectionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahId: number;
  ayahId?: number;
}

const MOCK_REFLECTIONS = [
  {
    id: "1", author: "A Siddiqui", avatar: "AS", timeAgo: "4 years ago", reference: "1:1",
    content: "Imagine sitting in a room that has no internet connection. And then all of a sudden, a powerful wifi connection becomes available. You can't see it, you can't feel it, you can't hear it, or sense it any way, but your environment and the potential ability you have to connect with almost anything or anyone in the world has changed drastically.",
    likes: 120, comments: 26,
  },
  {
    id: "2", author: "M Rahman", avatar: "MR", timeAgo: "2 years ago", reference: "1:2",
    content: "The phrase 'Lord of all the worlds' reminds us that Allah's mercy and sovereignty extends to all creation - not just humans, but every living thing, every world, every dimension.",
    likes: 85, comments: 12,
  },
];

const MOCK_LESSONS = [
  { id: "1", title: "The Foundation of Worship", content: "Al-Fatiha teaches us that all acts of worship begin with acknowledging Allah's mercy and seeking His guidance." },
  { id: "2", title: "The Straight Path", content: "Asking for guidance to the straight path is a continuous need - we ask for it in every prayer because we need constant direction in our lives." },
];

export const ReflectionsDialog = memo(function ReflectionsDialog({ open, onOpenChange, surahId, ayahId }: ReflectionsDialogProps) {
  const [currentAyah, setCurrentAyah] = useState(ayahId || 1);
  const [activeTab, setActiveTab] = useState<"reflections" | "lessons">("reflections");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const surah = surahList.find((s) => s.id === surahId);

  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "flex flex-col p-0 gap-0 overflow-hidden",
        isMobile || isFullscreen
          ? "w-full h-full max-w-full max-h-full rounded-none border-0" 
          : "max-w-2xl max-h-[85vh] rounded-2xl",
        "[&>button]:hidden"
      )}>
        <DialogDescription className="sr-only">Reflections and Lessons for {surah?.englishName}</DialogDescription>

        <PanelHeader
          title={`Reflections – ${surah?.englishName || ''}`}
          icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          onClose={() => onOpenChange(false)}
        />

        {/* Sub-header with selectors & tabs */}
        <div className="px-4 py-3 border-b border-border/50 bg-muted/30 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={String(surahId)}>
              <SelectTrigger className="w-28 sm:w-32 h-8 sm:h-9 glass-input border-0 text-xs sm:text-sm">
                <SelectValue>{surah?.englishName}</SelectValue>
              </SelectTrigger>
              <SelectContent className="glass-dropdown">
                {surahList.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.id}. {s.englishName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(currentAyah)} onValueChange={(v) => setCurrentAyah(Number(v))}>
              <SelectTrigger className="w-20 sm:w-24 h-8 sm:h-9 glass-input border-0 text-xs sm:text-sm">
                <SelectValue>Ayah {currentAyah}</SelectValue>
              </SelectTrigger>
              <SelectContent className="glass-dropdown">
                {Array.from({ length: surah?.numberOfAyahs || 7 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>Ayah {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all", activeTab === "reflections" ? "bg-primary text-primary-foreground shadow-lg" : "glass-btn py-2 px-4")}
              onClick={() => setActiveTab("reflections")}
            >Reflections</button>
            <button
              className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5", activeTab === "lessons" ? "bg-primary text-primary-foreground shadow-lg" : "glass-btn py-2 px-4")}
              onClick={() => setActiveTab("lessons")}
            >Lessons</button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain relative" style={{ WebkitOverflowScrolling: 'touch' }}>
          
          <div className="p-4 sm:p-6">
            {activeTab === "reflections" && (
              <div className="space-y-4">
                <div className="glass-card p-4 text-center">
                  <p className="font-arabic text-xl leading-loose" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                  <p className="text-sm text-muted-foreground mt-2">In the name of God, the Lord of Mercy, the Giver of Mercy!</p>
                </div>
                <div className="glass-card p-3 flex items-start gap-3">
                  <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">Reflections are personal perspectives (reviewed for quality) and should not be taken as authoritative.</p>
                </div>
                {MOCK_REFLECTIONS.map((reflection) => (
                  <div key={reflection.id} className="glass-card p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 glass-icon-btn"><AvatarFallback className="text-primary bg-transparent">{reflection.avatar}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-medium">{reflection.author}</p>
                          <p className="text-xs text-muted-foreground">{reflection.timeAgo} · Ayah {reflection.reference}</p>
                        </div>
                      </div>
                      <button className="glass-icon-btn w-8 h-8"><MoreHorizontal className="h-4 w-4" /></button>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed">{reflection.content}<button className="text-primary ml-1 hover:underline">See more</button></p>
                    <div className="flex items-center gap-4 mt-4 text-muted-foreground text-sm">
                      <button className="flex items-center gap-1.5 glass-hover px-2 py-1 -ml-2 rounded-lg"><Heart className="h-4 w-4" /> {reflection.likes}</button>
                      <button className="flex items-center gap-1.5 glass-hover px-2 py-1 rounded-lg"><MessageCircle className="h-4 w-4" /> {reflection.comments}</button>
                      <button className="flex items-center gap-1.5 glass-hover px-2 py-1 rounded-lg"><Share2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
                <div className="pt-8 pb-4 text-center">
                  <button onClick={scrollToTop} className="glass-btn px-6 py-3 text-sm font-medium inline-flex items-center gap-2"><ArrowUp className="h-4 w-4" />Go Back To Top</button>
                </div>
              </div>
            )}
            {activeTab === "lessons" && (
              <div className="space-y-4">
                {MOCK_LESSONS.map((lesson) => (
                  <div key={lesson.id} className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-3"><BookOpen className="h-4 w-4 text-primary" /><h4 className="font-semibold">{lesson.title}</h4></div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{lesson.content}</p>
                  </div>
                ))}
                <div className="pt-8 pb-4 text-center">
                  <button onClick={scrollToTop} className="glass-btn px-6 py-3 text-sm font-medium inline-flex items-center gap-2"><ArrowUp className="h-4 w-4" />Go Back To Top</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
