import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Layout";
import { useAuth } from "@/Middle/Context/Auth-Context";
import { useBookmarks } from "@/Middle/Hook/Use-Bookmarks";
import { useReadingProgress } from "@/Middle/Hook/Use-Reading-Progress";
import { useNotes } from "@/Middle/Hook/Use-Notes";
import { Avatar, AvatarFallback } from "@/Top/Component/UI/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Top/Component/UI/tabs";
import { Skeleton } from "@/Top/Component/UI/skeleton";
import { surahList } from "@/Bottom/API/Quran";
import { LogOut, Loader2, BookOpen, Bookmark, FileText, Target, Settings, Trash2 } from "lucide-react";
import { toast } from "@/Middle/Hook/Use-Toast";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { supabase } from "@/Bottom/Integration/Supabase/client";
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
} from "@/Top/Component/UI/alert-dialog";

export default function Profile() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { bookmarks, isLoading: bookmarksLoading, removeBookmark } = useBookmarks();
  const { progress } = useReadingProgress();
  const { notes, isLoading: notesLoading, deleteNote } = useNotes();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/Sign-In");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeletingAccount(true);
    try {
      // Delete all user data first
      await Promise.all([
        supabase.from("bookmarks").delete().eq("user_id", user.id),
        supabase.from("notes").delete().eq("user_id", user.id),
        supabase.from("reading_progress").delete().eq("user_id", user.id),
        supabase.from("goal_progress").delete().eq("user_id", user.id),
        supabase.from("quran_goals").delete().eq("user_id", user.id),
        supabase.from("profiles").delete().eq("user_id", user.id),
      ]);

      // Sign out
      await signOut();
      toast({ title: "Account deleted successfully" });
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  // Get continue reading info
  const continueReadingSurah = progress ? surahList.find((s) => s.id === progress.last_surah_id) : null;

  return (
    <Layout>
      <div className="container py-8 max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="glass-card p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 text-2xl sm:text-3xl">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-xl sm:text-2xl font-bold">{displayName}</h1>
              <p className="text-muted-foreground text-sm sm:text-base">{user.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                <span className="glass-btn px-3 py-1 text-xs flex items-center gap-1">
                  <Bookmark className="h-3 w-3" />
                  {bookmarks.length} Bookmarks
                </span>
                <span className="glass-btn px-3 py-1 text-xs flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {notes.length} Notes
                </span>
              </div>
            </div>
            <Link to="/Quran/Goals" className="glass-btn px-4 py-2 text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              My Goals
            </Link>
          </div>
        </div>

        {/* Continue Reading */}
        {continueReadingSurah && (
          <div className="glass-card p-5 sm:p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Continue Reading
            </h2>
            <Link to={`/Quran/Surah/${progress?.last_surah_id}?verse=${progress?.last_ayah_id}`}>
              <div className="flex items-center gap-4 p-4 rounded-2xl glass-btn transition-all hover:scale-[1.02]">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">{continueReadingSurah.id}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{continueReadingSurah.englishName}</p>
                  <p className="text-sm text-muted-foreground">
                    Surah {continueReadingSurah.id} · Ayah {progress?.last_ayah_id}
                  </p>
                </div>
                <span className="font-arabic text-xl" dir="rtl">{continueReadingSurah.name}</span>
              </div>
            </Link>
          </div>
        )}

        {/* Tabs for Bookmarks and Notes */}
        <Tabs defaultValue="bookmarks" className="mb-8">
          <TabsList className="glass-card p-1 mb-4">
            <TabsTrigger value="bookmarks" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-xl px-4 py-2">
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmarks
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-xl px-4 py-2">
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bookmarks">
            {bookmarksLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="glass-card text-center py-12">
                <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">You don't have any bookmarks yet</p>
                <Link to="/Quran" className="glass-btn px-4 py-2 text-sm inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Browse Quran
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((bookmark) => {
                  const surah = surahList.find((s) => s.id === bookmark.surah_id);
                  return (
                    <div key={bookmark.id} className="glass-card p-4 group relative">
                      <Link
                        to={`/Quran/Surah/${bookmark.surah_id}${bookmark.ayah_id ? `?verse=${bookmark.ayah_id}` : ""}`}
                        className="block"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-muted-foreground">
                            {surah?.englishNameTranslation}
                          </p>
                          <span className="text-sm font-medium glass-btn px-2 py-0.5">{bookmark.surah_id}</span>
                        </div>
                        <p className="font-semibold">Surah {surah?.englishName}</p>
                        <div className="mt-3 p-3 bg-white/5 rounded-xl">
                          <p className="font-arabic text-lg text-center" dir="rtl">
                            {surah?.name}
                          </p>
                          {bookmark.ayah_id && (
                            <p className="text-center text-sm text-muted-foreground mt-1">
                              Ayah {bookmark.ayah_id}
                            </p>
                          )}
                        </div>
                      </Link>
                      <button
                        onClick={() => removeBookmark(bookmark.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity glass-icon-btn w-8 h-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes">
            {notesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="glass-card text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">You don't have any notes yet</p>
                <Link to="/Quran" className="glass-btn px-4 py-2 text-sm inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Start Reading
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => {
                  const surah = surahList.find((s) => s.id === note.surah_id);
                  return (
                    <div key={note.id} className="glass-card p-4 sm:p-5 group relative">
                      <Link
                        to={`/Quran/Surah/${note.surah_id}${note.ayah_id ? `?verse=${note.ayah_id}` : ""}`}
                        className="block"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="glass-btn px-2 py-1 text-xs">
                            {surah?.englishName} {note.ayah_id ? `${note.surah_id}:${note.ayah_id}` : ""}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-foreground line-clamp-3">{note.content}</p>
                      </Link>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity glass-icon-btn w-8 h-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Account Actions */}
        <div className="glass-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleSignOut}
              className="glass-btn px-6 py-2.5 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="text-destructive hover:text-destructive/80 text-sm flex items-center gap-1">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-card border-none">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data including bookmarks, notes, and reading progress.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="glass-btn">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeletingAccount ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </Layout>
  );
}