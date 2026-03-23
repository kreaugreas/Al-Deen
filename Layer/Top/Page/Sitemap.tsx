import { Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Layout";
import { surahList } from "@/Bottom/API/Quran";
import { hadithCollections } from "@/Bottom/API/Hadith";
import { Book, FileText, HelpCircle, Shield, BookOpen, Target, User } from "lucide-react";

export default function Sitemap() {
  return (
    <Layout>
      <div className="container py-8 sm:py-12 max-w-6xl mx-auto">
        <div className="glass-card p-6 sm:p-8 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Sitemap</h1>
          <p className="text-muted-foreground">
            Navigate through all pages and content on Al-Deen.org
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="glass-icon-btn w-10 h-10"><FileText className="h-5 w-5 text-primary" /></div>
              Main Pages
            </h2>
            <ul className="space-y-3">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 -mx-3 block">Home</Link></li>
              <li><Link to="/Quran" className="text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 -mx-3 block">Quran</Link></li>
              <li><Link to="/Hadiths" className="text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 -mx-3 block">Hadiths</Link></li>
              <li><Link to="/Duas" className="text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 -mx-3 block">Duas</Link></li>
            </ul>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="glass-icon-btn w-10 h-10"><Target className="h-5 w-5 text-primary" /></div>
              Features
            </h2>
            <ul className="space-y-3">
              <li><Link to="/Quran/Goals" className="text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 -mx-3 block">Quran Goals</Link></li>
              <li><Link to="/Profile" className="text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 -mx-3 block">Profile</Link></li>
              <li><Link to="/Search" className="text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 -mx-3 block">Search</Link></li>
            </ul>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="glass-icon-btn w-10 h-10"><HelpCircle className="h-5 w-5 text-primary" /></div>
              Support
            </h2>
            <ul className="space-y-3">
              <li><Link to="/Help" className="text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 -mx-3 block">Help & FAQ</Link></li>
              <li><Link to="/Feedback" className="text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 -mx-3 block">Feedback</Link></li>
            </ul>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="glass-icon-btn w-10 h-10"><User className="h-5 w-5 text-primary" /></div>
              Account
            </h2>
            <ul className="space-y-3">
              <li><Link to="/Sign-In" className="text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 -mx-3 block">Sign In</Link></li>
              <li><Link to="/Sign-Up" className="text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 -mx-3 block">Sign Up</Link></li>
              <li><Link to="/Forgot-Password" className="text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 -mx-3 block">Forgot Password</Link></li>
            </ul>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="glass-icon-btn w-10 h-10"><Shield className="h-5 w-5 text-primary" /></div>
              Legal
            </h2>
            <ul className="space-y-3">
              <li><Link to="/Privacy" className="text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 -mx-3 block">Privacy Policy</Link></li>
              <li><Link to="/Terms" className="text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 -mx-3 block">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="glass-icon-btn w-10 h-10"><BookOpen className="h-5 w-5 text-primary" /></div>
              Hadith Collections
            </h2>
            <ul className="space-y-3">
              {hadithCollections.map((c) => (
                <li key={c.id}><Link to={`/Hadiths/${c.id}`} className="text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 -mx-3 block">{c.name}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="glass-card p-6 mt-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <div className="glass-icon-btn w-10 h-10"><Book className="h-5 w-5 text-primary" /></div>
            All Surahs
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {surahList.map((surah) => (
              <Link key={surah.id} to={`/Quran/Surah/${surah.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors glass-hover px-3 py-2 rounded-xl">
                {surah.id}. {surah.englishName}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
