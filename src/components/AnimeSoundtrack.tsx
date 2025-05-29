
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimeShowWithSoundtrack } from "@/types/anime";

interface AnimeSoundtrackProps {
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

export function AnimeSoundtrack({ anime }: AnimeSoundtrackProps) {
  if (!anime.soundtrack_info) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Soundtrack Information</h2>
      <Card className="bg-anime-darker border-anime-gray">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailItem
              label="Albums"
              value={`${anime.soundtrack_info.albums_count || 0} (${
                anime.soundtrack_info.albums_missing
                  ? `${anime.soundtrack_info.albums_missing} missing`
                  : "Complete"
              })`}
            />
            <DetailItem label="Lossless" value={anime.soundtrack_info.lossless || "No"} />
            <DetailItem
              label="File Formats"
              value={anime.soundtrack_info.file_formats || "Unknown"}
            />
            <DetailItem
              label="Download Status"
              value={anime.soundtrack_info.download_status || "Unknown"}
            />
          </div>

          {anime.soundtrack_info.album_list && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Album List:</h4>
              <p className="text-sm text-muted-foreground">
                {anime.soundtrack_info.album_list}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
