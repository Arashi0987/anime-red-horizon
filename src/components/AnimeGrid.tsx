
import React from "react";
import { AnimeCard } from "@/components/AnimeCard";
import { AnimeShow } from "@/types/anime";

interface AnimeGridProps {
  animeList: AnimeShow[];
  isLoading?: boolean;
}

export function AnimeGrid({ animeList, isLoading = false }: AnimeGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg overflow-hidden h-80 bg-anime-gray animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (animeList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-xl font-semibold mb-2">No anime found</h3>
        <p className="text-muted-foreground">Try a different search term or reset filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {animeList.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}
