
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AnimeHeader } from "@/components/AnimeHeader";
import { AnimeCover } from "@/components/AnimeCover";
import { AnimeProgress } from "@/components/AnimeProgress";
import { AnilistProgress } from "@/components/AnilistProgress";
import { AnimeDetails } from "@/components/AnimeDetails";
import { AnimeSoundtrack } from "@/components/AnimeSoundtrack";
import { AnimeFileSystem } from "@/components/AnimeFileSystem";
import { AnimeShowWithSoundtrack, ExternalLinks } from "@/types/anime";
import { ApiClient, getAnilistCoverImage } from "@/services/apiClient";
import { AnilistClient, AnilistAnime } from "@/services/anilistClient";
import { ArrowLeft } from "lucide-react";

const AnimeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<AnimeShowWithSoundtrack | null>(null);
  const [anilistAnime, setAnilistAnime] = useState<AnilistAnime | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [externalLinks, setExternalLinks] = useState<ExternalLinks | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInDatabase, setIsInDatabase] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
  
      try {
        setIsLoading(true);
        setError(null);
        const parsedId = parseInt(id, 10);
        
        if (isNaN(parsedId)) {
          setError("Invalid anime ID");
          return;
        }
        
        // Always try to fetch from AniList first for reliability
        const anilistData = await AnilistClient.getAnimeById(parsedId);
        setAnilistAnime(anilistData);
        
        if (!anilistData) {
          setError("Anime not found on AniList");
          return;
        }
        
        // Set cover image from AniList
        setCoverImage(anilistData.coverImage.large);
        
        // Try to get from our database
        try {
          const animeData = await ApiClient.getAnimeById(parsedId);
          if (animeData) {
            setAnime(animeData);
            setIsInDatabase(true);
            
            // Fetch external links with plex_id for database anime
            const links = await ApiClient.getExternalLinks(parsedId, animeData.sonarr_id, animeData.plex_id);
            setExternalLinks(links);
            
            // Override cover image if we have one in database
            if (animeData.cover_image) {
              const filePath = animeData.cover_image;
              if (filePath.startsWith("/Media")) {
                const relativePath = filePath.replace("/Media", "");
                const encoded = encodeURI(relativePath);
                const imageUrl = `http://panther:5000/media${encoded}`;
                setCoverImage(imageUrl);
              } else {
                setCoverImage(filePath);
              }
            }
          } else {
            // Anime is not in our database, use AniList data only
            setIsInDatabase(false);
            setExternalLinks({
              plexUrl: null,
              anilistUrl: `https://anilist.co/anime/${parsedId}`,
              sonarrUrl: null
            });
          }
        } catch (dbError) {
          console.log("Anime not in database, using AniList data only");
          setIsInDatabase(false);
          setExternalLinks({
            plexUrl: null,
            anilistUrl: `https://anilist.co/anime/${parsedId}`,
            sonarrUrl: null
          });
        }
      } catch (error) {
        console.error("Error fetching anime details:", error);
        setError("Failed to load anime details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [id]);

  const handleAnimeUpdate = (updatedAnime: AnimeShowWithSoundtrack) => {
    setAnime(updatedAnime);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} />
        <main className="flex-1 container py-8">
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading anime details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !anilistAnime) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} />
        <main className="flex-1 container py-8">
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-muted-foreground mb-8">{error || "Anime not found"}</p>
            <Button asChild>
              <Link to={isInDatabase ? "/" : "/browse"}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {isInDatabase ? "Back to My Anime" : "Back to Browse"}
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Use data from our database if available, otherwise use AniList data
  const title = anime?.english_name || anime?.romanji_name || anilistAnime.title.english || anilistAnime.title.romaji || "Unknown Title";
  const score = anime?.anilist_score || (anilistAnime.averageScore ? anilistAnime.averageScore / 10 : null);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} />
      <main className="flex-1 container py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to={isInDatabase ? "/" : "/browse"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isInDatabase ? "Back to My Anime" : "Back to Browse"}
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cover Image */}
          <AnimeCover
            coverImage={coverImage}
            title={title}
            score={score}
            anime={anime}
            anilistAnime={anilistAnime}
            isInDatabase={isInDatabase}
            externalLinks={externalLinks}
          />

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            <AnimeHeader
              anime={anime}
              anilistAnime={anilistAnime}
              isInDatabase={isInDatabase}
            />

            {/* Description Section - Always show from AniList */}
            {anilistAnime.description && (
              <>
                <Separator className="bg-anime-gray/50" />
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Synopsis</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {AnilistClient.cleanDescription(anilistAnime.description)}
                  </p>
                </div>
              </>
            )}

            {/* Progress and Status Section */}
            <Separator className="bg-anime-gray/50" />
            {isInDatabase && anime ? (
              <AnimeProgress anime={anime} onAnimeUpdate={handleAnimeUpdate} />
            ) : (
              <AnilistProgress anilistAnime={anilistAnime} />
            )}

            <Separator className="bg-anime-gray/50" />

            <AnimeDetails
              anime={anime}
              anilistAnime={anilistAnime}
              isInDatabase={isInDatabase}
            />

            {/* File System - Only for database anime */}
            {isInDatabase && anime && (
              <>
                <Separator className="bg-anime-gray/50" />
                <AnimeFileSystem anime={anime} />
              </>
            )}

            {/* Soundtrack Information - Only for database anime */}
            {isInDatabase && anime?.soundtrack_info && (
              <>
                <Separator className="bg-anime-gray/50" />
                <AnimeSoundtrack anime={anime} />
              </>
            )}
          </div>
        </div>
      </main>
      
      <footer className="border-t border-border bg-anime-darker py-6 mt-16">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with React, Tailwind and Shadcn UI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AnimeDetail;
