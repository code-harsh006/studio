"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import type { Song } from '@/types';
import { getSongs } from '@/app/actions';

interface PlayerContextType {
  isPlaying: boolean;
  currentSong: Song | null;
  currentTime: number;
  duration: number;
  volume: number;
  playlist: Song[];
  playSong: (song: Song) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  addSong: (song: Song) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSong = currentSongIndex !== null ? playlist[currentSongIndex] : null;
  
  useEffect(() => {
    const fetchSongs = async () => {
      const songs = await getSongs();
      setPlaylist(songs);
    };
    fetchSongs();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audioRef.current = audio;
      
      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleLoadedMetadata = () => setDuration(audio.duration);
      const handleEnded = () => playNext();
      
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);

      return () => {
        if(audio) {
          audio.removeEventListener('timeupdate', handleTimeUpdate);
          audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audio.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (audioRef.current.src !== currentSong.songUrl) {
          audioRef.current.src = currentSong.songUrl;
      }
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentSong, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  const playSong = useCallback((song: Song) => {
    const songIndex = playlist.findIndex(s => s.id === song.id);
    if (songIndex !== -1) {
      setCurrentSongIndex(songIndex);
      setIsPlaying(true);
    }
  }, [playlist]);

  const togglePlay = useCallback(() => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
    } else if (playlist.length > 0) {
      setCurrentSongIndex(0);
      setIsPlaying(true);
    }
  }, [currentSong, isPlaying, playlist]);

  const playNext = useCallback(() => {
    if (currentSongIndex !== null) {
      const nextIndex = (currentSongIndex + 1) % playlist.length;
      setCurrentSongIndex(nextIndex);
      setIsPlaying(true);
    }
  }, [currentSongIndex, playlist.length]);

  const playPrev = useCallback(() => {
    if (currentSongIndex !== null) {
      const prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
      setCurrentSongIndex(prevIndex);
      setIsPlaying(true);
    }
  }, [currentSongIndex, playlist.length]);

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
  };
  
  const addSong = (song: Song) => {
    setPlaylist(prev => [song, ...prev]);
  };

  const value = {
    isPlaying,
    currentSong,
    currentTime,
    duration,
    volume,
    playlist,
    playSong,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume,
    addSong,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
