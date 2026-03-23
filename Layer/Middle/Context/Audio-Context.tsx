import { createContext, useContext, useState, useRef, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { getSurahAudioUrl, getPageAudioUrl } from "@/Bottom/API/Quran";
import { useApp } from "@/Middle/Context/App-Context";

type PlaybackMode = 'surah' | 'page';

interface AudioContextType {
  isPlaying: boolean;
  isLoading: boolean;
  currentSurah: number | null;
  currentPage: number | null;
  currentTime: number;
  duration: number;
  progress: number;
  playbackMode: PlaybackMode;
  playFullSurah: (surahNumber: number) => void;
  playPage: (pageNumber: number) => void;
  togglePlayPause: () => void;
  stop: () => void;
  seekTo: (progress: number) => void;
  setVolume: (volume: number) => void;
  repeatMode: 'none' | 'surah' | 'page';
  setRepeatMode: (mode: 'none' | 'surah' | 'page') => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
}

const AppAudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const { selectedReciter } = useApp();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [repeatMode, setRepeatMode] = useState<'none' | 'surah' | 'page'>('none');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('surah');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackModeRef = useRef<PlaybackMode>('surah');

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleAudioEnded = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const shouldRepeat =
      (playbackModeRef.current === 'surah' && repeatMode === 'surah') ||
      (playbackModeRef.current === 'page'  && repeatMode === 'page');

    if (shouldRepeat) {
      audio.currentTime = 0;
      audio.play();
    } else {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }
  }, [repeatMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.addEventListener('ended', handleAudioEnded);
    return () => audio.removeEventListener('ended', handleAudioEnded);
  }, [handleAudioEnded]);

  const loadAndPlay = useCallback(async (src: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsLoading(true);
    audio.src = src;
    audio.playbackRate = playbackSpeed;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsLoading(false);
    }
  }, [playbackSpeed]);

  const playFullSurah = useCallback(async (surahNumber: number) => {
    playbackModeRef.current = 'surah';
    setPlaybackMode('surah');
    setCurrentPage(null);
    setCurrentSurah(surahNumber);
    const url = await getSurahAudioUrl(surahNumber, selectedReciter);
    if (url) {
      loadAndPlay(url);
    } else {
      console.error(`No audio found for surah ${surahNumber} reciter ${selectedReciter}`);
      setIsLoading(false);
    }
  }, [loadAndPlay, selectedReciter]);

  const playPage = useCallback(async (pageNumber: number) => {
    playbackModeRef.current = 'page';
    setPlaybackMode('page');
    setCurrentSurah(null);
    setCurrentPage(pageNumber);
    const url = await getPageAudioUrl(pageNumber, selectedReciter);
    if (url) {
      loadAndPlay(url);
    } else {
      console.error(`No audio found for page ${pageNumber} reciter ${selectedReciter}`);
      setIsLoading(false);
    }
  }, [loadAndPlay, selectedReciter]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    }
    setIsPlaying(false);
    setCurrentSurah(null);
    setCurrentPage(null);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const seekTo = useCallback((newProgress: number) => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = (newProgress / 100) * audio.duration;
      setProgress(newProgress);
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }, []);

  const contextValue = useMemo(() => ({
    isPlaying,
    isLoading,
    currentSurah,
    currentPage,
    currentTime,
    duration,
    progress,
    playbackMode,
    playFullSurah,
    playPage,
    togglePlayPause,
    stop,
    seekTo,
    setVolume,
    repeatMode,
    setRepeatMode,
    playbackSpeed,
    setPlaybackSpeed,
  }), [
    isPlaying, isLoading, currentSurah, currentPage,
    currentTime, duration, progress, playbackMode,
    playFullSurah, playPage, togglePlayPause, stop,
    seekTo, setVolume, repeatMode, playbackSpeed,
  ]);

  return (
    <AppAudioContext.Provider value={contextValue}>
      {children}
    </AppAudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AppAudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}