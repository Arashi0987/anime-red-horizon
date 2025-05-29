
import React from "react";
import { Badge } from "@/components/ui/badge";
import { AnilistAnime } from "@/services/anilistClient";
import { AnimeShowWithSoundtrack } from "@/types/anime";

interface AnimeDetailsProps {
  anime: AnimeShowWithSoundtrack | null;
  anilistAnime: AnilistAnime | null;
  isInDatabase: boolean;
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

export function AnimeDetails({ anime, anilistAnime, isInDatabase }: AnimeDetailsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
        {/* Show different details based on data source */}
        {isInDatabase && anime ? (
          <>
            <DetailItem label="Season Number" value={anime.season_number?.toString()} />
            <DetailItem label="Episodes Downloaded" value={`${anime.episodes_dl} / ${anime.episodes}`} />
            <DetailItem label="Sonarr ID" value={anime.sonarr_id?.toString()} />
          </>
        ) : anilistAnime ? (
          <>
            <DetailItem label="Format" value={anilistAnime.format} />
            <DetailItem label="Season" value={anilistAnime.season && anilistAnime.seasonYear ? `${anilistAnime.season} ${anilistAnime.seasonYear}` : null} />
            <DetailItem label="Duration" value={anilistAnime.duration ? `${anilistAnime.duration} min` : null} />
            <DetailItem label="Studio" value={anilistAnime.studios.nodes.find(s => s.isMain)?.name} />
          </>
        ): null}
      </div>
      
      {/* Genres - from AniList data */}
      {anilistAnime?.genres && anilistAnime.genres.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Genres:</h4>
          <div className="flex flex-wrap gap-2">
            {anilistAnime.genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
