
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimeShow } from "@/types/anime";
import { getAnilistCoverImage } from "@/services/apiClient";

interface AnimeCardProps {
  anime: AnimeShow;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchCoverImage = async () => {
      try {
        const imageUrl = await getAnilistCoverImage(anime.id);
        setCoverImage(imageUrl);
      } catch (error) {
        console.error("Error fetching cover image:", error);
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoverImage();
  }, [anime.id]);

  // Handle image load errors
  const handleImageError = () => {
    console.log(`Image failed to load for ${anime.english_name || anime.romanji_name}`);
    setImageError(true);
    // Use a different placeholder that's guaranteed to work
    setCoverImage(`https://via.placeholder.com/225x315/1a1a2e/ffffff?text=${encodeURIComponent(anime.english_name || anime.romanji_name || "Anime")}`);
  };

  return (
    <Link to={`/anime/${anime.id}`}>
      <Card className="overflow-hidden h-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-anime-red/10 border border-anime-gray bg-anime-darker">
        <div className="relative aspect-[2/3] overflow-hidden">
          {isLoading ? (
            <div className="w-full h-full bg-anime-gray animate-pulse flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <img
              src={coverImage || "https://via.placeholder.com/225x315/1a1a2e/ffffff?text=No+Image"}
              alt={anime.english_name || anime.romanji_name || "Anime cover"}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
          {anime.is_dubbed && (
            <Badge variant="info" className="absolute top-2 right-2">
              Dubbed
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold truncate text-lg">
            {anime.english_name || anime.romanji_name || "Unknown Title"}
          </h3>
          {anime.english_name && anime.romanji_name && (
            <p className="text-sm text-muted-foreground truncate">{anime.romanji_name}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm">{anime.year}</span>
            <Badge
              variant={
                anime.release_status === "Completed"
                  ? "success"
                  : anime.release_status === "Ongoing"
                  ? "warning"
                  : "secondary"
              }
              className="text-xs"
            >
              {anime.release_status || "Unknown"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
