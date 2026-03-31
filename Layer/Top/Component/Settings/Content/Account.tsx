import { useState } from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/Top/Component/UI/separator";
import { Skeleton } from "@/Top/Component/UI/skeleton";
import { Input } from "@/Top/Component/UI/input";
import { Switch } from "@/Top/Component/UI/switch";
import { SlidingPill } from "@/Top/Component/Sliding-Pill";
import { useApp } from "@/Middle/Context/App";
import { useBookmarks } from "@/Middle/Hook/Use-Bookmarks";
import { useReadingProgress } from "@/Middle/Hook/Use-Reading-Progress";
import { useNotes } from "@/Middle/Hook/Use-Notes";
import { surahList } from "@/Bottom/API/Quran";
import { supabase } from "@/Bottom/Integration/Supabase/client";
import { toast } from "sonner";
import {
  User, Bookmark, FileText, Clock, Target, ChevronRight,
  Bell, KeyRound, Eye, EyeOff, RotateCcw, LogOut, Trash2, BookOpen,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/Top/Component/UI/alert-dialog";

interface AccountSectionProps {
  user: any;
  displayName: string;
  initials: string;
  handleSignOut: () => void;
  navigate: (path: string) => void;
  setSettingsSidebarOpen: (open: boolean) => void;
}

export function AccountSection({
  user, displayName, initials, handleSignOut, navigate, setSettingsSidebarOpen,
}: AccountSectionProps) {
  const { bookmarks, isLoading: bookmarksLoading, removeBookmark } = useBookmarks();
  const { progress } = useReadingProgress();
  const { notes, isLoading: notesLoading, deleteNote } = useNotes();

  const [accountTab, setAccountTab] = useState("profile");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    setTheme, setQuranFont, setFontSize, setTranslationFontSize,
    setHoverTranslation, setHoverRecitation,
    setInlineTranslation, setVerseTranslation,
    setSelectedTranslations, setCurrentLanguage, setShowArabicText,
  } = useApp();

  if (!user) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="glass-icon-btn w-16 h-16 mx-auto pointer-events-none">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">Sign in to access your account.</p>
        <button
          onClick={() => { navigate("/Sign-In"); setSettingsSidebarOpen(false); }}
          className="glass-btn px-6 py-2 bg-primary text-primary-foreground text-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  const continueReadingSurah = progress ? surahList.find((s) => s.id === progress.last_surah_id) : null;

  const handleResetSettings = () => {
    setTheme("auto");
    setQuranFont("uthmani");
    setFontSize(5);
    setTranslationFontSize(3);
    setHoverTranslation(true);
    setHoverRecitation(true);
    setInlineTranslation(false);
    setVerseTranslation(true);
    setSelectedTranslations(["translation"]);
    setCurrentLanguage("en");
    setShowArabicText(true);
    toast.success("Settings reset to defaults");
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await Promise.all([
        supabase.from("bookmarks").delete().eq("user_id", user.id),
        supabase.from("notes").delete().eq("user_id", user.id),
        supabase.from("reading_progress").delete().eq("user_id", user.id),
        supabase.from("goal_progress").delete().eq("user_id", user.id),
        supabase.from("quran_goals").delete().eq("user_id", user.id),
        supabase.from("profiles").delete().eq("user_id", user.id),
      ]);
      await supabase.auth.signOut();
      toast.success("Account deleted successfully");
      setSettingsSidebarOpen(false);
      navigate("/");
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const accountTabs = [
    { id: "profile",   icon: <User className="h-3.5 w-3.5" />,     label: "Profile" },
    { id: "bookmarks", icon: <Bookmark className="h-3.5 w-3.5" />,  label: "Bookmarks" },
    { id: "notes",     icon: <FileText className="h-3.5 w-3.5" />,  label: "Notes" },
    { id: "history",   icon: <Clock className="h-3.5 w-3.5" />,     label: "History" },
  ];

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
          {initials}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <SlidingPill value={accountTab} onChange={setAccountTab} options={accountTabs} size="md" />

      <Separator />

      {/* Profile Tab */}
      {accountTab === "profile" && (
        <div className="space-y-3">
          <button
            onClick={() => { navigate("/Quran/Goals"); setSettingsSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
          >
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground flex-1">My Learning Plans</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="px-3 py-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Notifications</span>
            </div>
            <p className="text-xs text-muted-foreground ml-6">Coming soon</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Change Password</span>
            </div>
            <div className="space-y-2 px-1">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-muted/50 border-0 pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !newPassword}
                className="glass-btn px-4 py-2 text-sm w-full disabled:opacity-50"
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>

          <Separator />

          <button
            onClick={handleResetSettings}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
          >
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Reset Settings</span>
          </button>

          <Separator />

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-destructive/10 transition-colors text-left text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-destructive/10 transition-colors text-left text-destructive/70">
                <Trash2 className="h-4 w-4" />
                <span className="text-sm">Delete Account</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-card border-none">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove all your data including bookmarks, notes, and reading progress.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="glass-btn">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeletingAccount ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Bookmarks Tab */}
      {accountTab === "bookmarks" && (
        <div className="space-y-2">
          {bookmarksLoading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-6">
              <Bookmark className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No bookmarks yet</p>
            </div>
          ) : bookmarks.map((bookmark) => {
            const surah = surahList.find((s) => s.id === bookmark.surah_id);
            return (
              <div key={bookmark.id} className="flex items-center gap-3 px-3 py-3 rounded-lg bg-muted/30 group">
                <Link
                  to={`/Quran/Surah/${bookmark.surah_id}${bookmark.ayah_id ? `?verse=${bookmark.ayah_id}` : ""}`}
                  onClick={() => setSettingsSidebarOpen(false)}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate">{surah?.englishName}</p>
                  <p className="text-xs text-muted-foreground">{bookmark.ayah_id ? `Ayah ${bookmark.ayah_id}` : "Surah"}</p>
                </Link>
                <button
                  onClick={() => removeBookmark(bookmark.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity glass-icon-btn w-7 h-7"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Notes Tab */}
      {accountTab === "notes" && (
        <div className="space-y-2">
          {notesLoading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          ) : notes.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No notes yet</p>
            </div>
          ) : notes.map((note) => {
            const surah = surahList.find((s) => s.id === note.surah_id);
            return (
              <div key={note.id} className="px-3 py-3 rounded-lg bg-muted/30 group relative">
                <Link
                  to={`/Quran/Surah/${note.surah_id}${note.ayah_id ? `?verse=${note.ayah_id}` : ""}`}
                  onClick={() => setSettingsSidebarOpen(false)}
                  className="block"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-primary">
                      {surah?.englishName} {note.ayah_id ? `${note.surah_id}:${note.ayah_id}` : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{note.content}</p>
                </Link>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity glass-icon-btn w-6 h-6"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* History Tab */}
      {accountTab === "history" && (
        <div className="space-y-2">
          {continueReadingSurah ? (
            <Link
              to={`/Quran/Surah/${progress?.last_surah_id}?verse=${progress?.last_ayah_id}`}
              onClick={() => setSettingsSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">{continueReadingSurah.id}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{continueReadingSurah.englishName}</p>
                <p className="text-xs text-muted-foreground">Ayah {progress?.last_ayah_id}</p>
              </div>
              <span className="font-arabic text-sm" dir="rtl">{continueReadingSurah.name}</span>
            </Link>
          ) : (
            <div className="text-center py-6">
              <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No reading history yet</p>
              <Link
                to="/Quran"
                onClick={() => setSettingsSidebarOpen(false)}
                className="glass-btn px-4 py-1.5 text-xs mt-3 inline-flex items-center gap-1"
              >
                Start Reading
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}