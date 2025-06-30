"use client";

import Image from 'next/image';
import { usePlayer } from '@/context/PlayerContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RecentUploads() {
  const { playlist, playSong, currentSong, isPlaying } = usePlayer();

  return (
    <Card className="w-full bg-card/50">
      <CardHeader>
        <CardTitle>Recently Added</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] -mr-4 pr-4">
          <div className="space-y-2">
            {playlist.map((song) => (
              <div
                key={song.id}
                className={cn(
                  "flex items-center p-2 rounded-md transition-colors duration-300 cursor-pointer group",
                  currentSong?.id === song.id ? "bg-primary/20" : "hover:bg-secondary/50"
                )}
                onClick={() => playSong(song)}
              >
                <div className="relative">
                    <Image
                      src={song.albumArtUrl}
                      alt={`Album art for ${song.title}`}
                      width={48}
                      height={48}
                      className={cn(
                        "rounded-md transition-all duration-300",
                        currentSong?.id === song.id && isPlaying && "opacity-40"
                      )}
                      data-ai-hint="music album"
                    />
                    <div className={cn(
                        "absolute inset-0 flex items-center justify-center bg-black/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        currentSong?.id === song.id && "opacity-100"
                    )}>
                        {currentSong?.id === song.id && isPlaying ? (
                            <Music className="h-6 w-6 text-primary animate-pulse" />
                        ) : (
                            <Play className="h-6 w-6 text-primary" />
                        )}
                    </div>
                </div>

                <div className="ml-4 flex-grow">
                  <p className="font-semibold">{song.title}</p>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
