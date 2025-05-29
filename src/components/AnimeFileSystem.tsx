
import React from "react";
import { AnimeShowWithSoundtrack } from "@/types/anime";

interface AnimeFileSystemProps {
  anime: AnimeShowWithSoundtrack;
}

// Helper component for displaying detail items
const DetailItem = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  
  return (
    <div>
      <span className="text-sm text-muted-foreground block">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
};

export function AnimeFileSystem({ anime }: AnimeFileSystemProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">File System</h2>
      <div className="grid grid-cols-1 gap-y-4">
        <DetailItem label="Show Path" value={anime.show_path} />
        <DetailItem label="Season Path" value={anime.season_path} />
        <DetailItem label="Soundtrack Path" value={anime.soundtrack_path} />
      </div>
    </div>
  );
}
