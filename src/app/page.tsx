import { PlayerProvider } from "@/context/PlayerContext";
import { RecentUploads } from "@/components/RecentUploads";
import { SongPlayer } from "@/components/SongPlayer";
import { UploadTrackDialog } from "@/components/UploadTrackDialog";

export default function Home() {
  return (
    <PlayerProvider>
      <main className="container mx-auto p-4 md:p-8 pb-32">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
              fill="currentColor"
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g style={{ filter: 'url(#glow)' }}>
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3h-6Z" />
              </g>
            </svg>
            <h1 className="text-4xl font-bold tracking-tighter font-headline text-primary-foreground">
              vibe-loop
            </h1>
          </div>
          <UploadTrackDialog />
        </header>

        <RecentUploads />
      </main>
      <SongPlayer />
    </PlayerProvider>
  );
}
