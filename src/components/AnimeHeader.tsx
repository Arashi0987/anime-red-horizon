
import React from "react";
import { Badge } from "@/components/ui/badge";
import { AnilistAnime } from "@/services/anilistClient";
import { AnimeShowWithSoundtrack } from "@/types/anime";

interface AnimeHeaderProps {
  anime: AnimeShowWithSoundtrack | null;
  anilistAnime: AnilistAnime | null;
  isInDatabase: boolean;
}

export function AnimeHeader({ anime, anilistAnime, isInDatabase }: AnimeHeaderProps) {
  const title = anime?.english_name || anime?.romanji_name || anilistAnime?.title.english || anilistAnime?.title.romaji || "Unknown Title";
  const secondaryTitle = anime?.romanji_name || anilistAnime?.title.romaji;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {secondaryTitle && secondaryTitle !== title && (
        <p className="text-xl text-muted-foreground mt-1">{secondaryTitle}</p>
      )}
      <div className="flex items-center gap-2 mt-3">
        {(anime?.year || anilistAnime?.seasonYear) && (
          <span className="text-sm">{anime?.year || anilistAnime?.seasonYear}</span>
        )}
        {(anime?.episodes || anilistAnime?.episodes) && (
          <>
            <span>•</span>
            <span className="text-sm">{anime?.episodes || anilistAnime?.episodes} Episodes</span>
          </>
        )}
        {anime?.num_seasons && anime.num_seasons > 1 && (
          <>
            <span>•</span>
            <span className="text-sm">{anime.num_seasons} Seasons</span>
          </>
        )}
      </div>
    </div>
  );
}
