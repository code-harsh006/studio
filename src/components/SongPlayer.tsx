"use client";

import Image from 'next/image';
import { usePlayer } from '@/context/PlayerContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export function SongPlayer() {
  const { 
    currentSong, 
    isPlaying, 
    togglePlay, 
    playNext, 
    playPrev, 
    currentTime, 
    duration, 
    seek,
    volume,
    setVolume
  } = usePlayer();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const neonIcon = "text-primary-foreground drop-shadow-[0_0_5px_hsl(var(--primary))] hover:drop-shadow-[0_0_10px_hsl(var(--primary))] transition-all";

  if (!isMounted) return null;

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 h-24 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm border-t border-primary/20">
        <p className="text-muted-foreground">Select a song to start vibing!</p>
      </div>
    );
  }

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };
  
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  }

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-t-lg border-t border-primary/20 bg-background/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Image
            src={currentSong.albumArtUrl}
            alt={`Album art for ${currentSong.title}`}
            width={64}
            height={64}
            className="rounded-md shadow-lg"
            data-ai-hint="music album"
          />
          <div className="flex-grow min-w-0">
            <p className="font-bold text-lg truncate">{currentSong.title}</p>
            <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={playPrev} aria-label="Previous song">
              <SkipBack className={cn("h-6 w-6", neonIcon)} />
            </Button>
            <Button variant="ghost" size="icon" onClick={togglePlay} className="h-12 w-12 bg-primary/20 hover:bg-primary/30" aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause className={cn("h-8 w-8", neonIcon)} /> : <Play className={cn("h-8 w-8 fill-primary-foreground", neonIcon)} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={playNext} aria-label="Next song">
              <SkipForward className={cn("h-6 w-6", neonIcon)} />
            </Button>
          </div>
          <div className="hidden md:flex items-center gap-2 w-32">
            <Button variant="ghost" size="icon" onClick={() => setVolume(volume > 0 ? 0 : 0.8)} aria-label={volume > 0 ? "Mute" : "Unmute"}>
                {volume > 0 ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
            </Button>
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.01}
              aria-label="Volume control"
            />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-10 text-center">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            max={duration || 0}
            step={1}
            aria-label="Song progress"
          />
          <span className="text-xs text-muted-foreground w-10 text-center">{formatTime(duration)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
