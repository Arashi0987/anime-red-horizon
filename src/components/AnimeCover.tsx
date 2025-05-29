
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { AnilistAnime } from "@/services/anilistClient";
import { AnimeShowWithSoundtrack, ExternalLinks } from "@/types/anime";

interface AnimeCoverProps {
  coverImage: string | null;
  title: string;
  score: number | null;
  anime: AnimeShowWithSoundtrack | null;
  anilistAnime: AnilistAnime | null;
  isInDatabase: boolean;
  externalLinks: ExternalLinks | null;
}

export function AnimeCover({ 
  coverImage, 
  title, 
  score, 
  anime, 
  anilistAnime, 
  isInDatabase, 
  externalLinks 
}: AnimeCoverProps) {
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-24">
        <div className="rounded-lg overflow-hidden border border-anime-gray bg-anime-darker relative">
          <img
            src={coverImage || "https://via.placeholder.com/350x500?text=No+Image"}
            alt={title}
            className="w-full object-cover"
          />
          {score && (
            <div className="absolute top-2 left-2 bg-black/80 rounded-md p-2 backdrop-blur-sm">
              <div className="text-xl font-bold text-yellow-400">
                {score.toFixed(1)}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 space-y-2">
          {/* Status badges for database anime */}
          {isInDatabase && anime?.release_status && (
            <Badge
              variant={
                anime.release_status === "Completed"
                  ? "success"
                  : anime.release_status === "Ongoing"
                  ? "warning"
                  : "secondary"
              }
              className="w-full justify-center text-sm py-1"
            >
              {anime.release_status}
            </Badge>
          )}
          
          {/* Status badge for AniList anime */}
          {!isInDatabase && anilistAnime?.status && (
            <Badge variant="secondary" className="w-full justify-center text-sm py-1">
              {anilistAnime.status.replace('_', ' ')}
            </Badge>
          )}
          
          {isInDatabase && anime?.is_dubbed && (
            <Badge variant="info" className="w-full justify-center text-sm py-1">
              Dubbed Available
            </Badge>
          )}
          
          {isInDatabase && anime?.sonarr_monitor_status && (
            <Badge variant="secondary" className="w-full justify-center text-sm py-1">
              Monitored in Sonarr
            </Badge>
          )}
        </div>
      
        {/* External Links */}
        <div className="mt-4 space-y-2">
          {externalLinks?.plexUrl && (
            <Button variant="outline" className="w-full" asChild>
              <a href={externalLinks.plexUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Plex
              </a>
            </Button>
          )}
          {externalLinks?.anilistUrl && (
            <Button variant="outline" className="w-full" asChild>
              <a href={externalLinks.anilistUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View on AniList
              </a>
            </Button>
          )}
          {externalLinks?.sonarrUrl && (
            <Button variant="outline" className="w-full" asChild>
              <a href={externalLinks.sonarrUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Sonarr
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
