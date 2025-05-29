import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { AnimeShowWithSoundtrack, ExternalLinks } from "@/types/anime";
import { ApiClient, getAnilistCoverImage } from "@/services/apiClient";
import { AnilistClient, AnilistAnime } from "@/services/anilistClient";
import { ArrowLeft, ExternalLink, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WATCH_STATUSES = ['CURRENT', 'PLANNING', 'COMPLETED', 'REPEATING', 'PAUSED'] as const;

const AnimeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<AnimeShowWithSoundtrack | null>(null);
  const [anilistAnime, setAnilistAnime] = useState<AnilistAnime | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [externalLinks, setExternalLinks] = useState<ExternalLinks | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProgress, setEditingProgress] = useState(false);
  const [tempProgress, setTempProgress] = useState<number>(0);
  const [editingStatus, setEditingStatus] = useState(false);
  const [isInDatabase, setIsInDatabase] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
  
      try {
        setIsLoading(true);
        const parsedId = parseInt(id, 10);
        
        // First try to get from our database
        const animeData = await ApiClient.getAnimeById(parsedId);
        
        if (animeData) {
          // Anime is in our database
          setAnime(animeData);
          setIsInDatabase(true);
          setTempProgress(animeData.anilist_progress || 0);
  
          // Fetch external links with plex_id
          const links = await ApiClient.getExternalLinks(parsedId, animeData.sonarr_id, animeData.plex_id);
          setExternalLinks(links);

          // Handle cover image from database or fallback to Anilist
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
          } else {
            const imageUrl = await getAnilistCoverImage(animeData.id);
            setCoverImage(imageUrl);
          }
        }
        
        // Always fetch from AniList for additional info (description, etc.)
        const anilistData = await AnilistClient.getAnimeById(parsedId);
        setAnilistAnime(anilistData);
        
        if (!animeData && anilistData) {
          // Anime is not in our database, use AniList data only
          setIsInDatabase(false);
          setCoverImage(anilistData.coverImage.large);
          setExternalLinks({
            plexUrl: null,
            anilistUrl: `https://anilist.co/anime/${parsedId}`,
            sonarrUrl: null
          });
        }
        
        if (!animeData && !anilistData) {
          setError("Anime not found");
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

  const handleProgressSave = () => {
    if (anime && tempProgress <= (anime.episodes || 0)) {
      setAnime({ ...anime, anilist_progress: tempProgress });
      setEditingProgress(false);
      toast({
        title: "Progress Updated",
        description: `Progress set to ${tempProgress}`,
      });
    } else {
      toast({
        title: "Invalid Progress",
        description: "Progress cannot exceed total episodes",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (newStatus: typeof WATCH_STATUSES[number]) => {
    if (anime) {
      setAnime({ ...anime, watch_status: newStatus });
      setEditingStatus(false);
      toast({
        title: "Status Updated",
        description: `Status changed to ${newStatus}`,
      });
    }
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

  if (error || (!anime && !anilistAnime)) {
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
  const displayAnime = anime || anilistAnime;
  const title = anime?.english_name || anime?.romanji_name || anilistAnime?.title.english || anilistAnime?.title.romaji || "Unknown Title";
  const secondaryTitle = anime?.romanji_name || anilistAnime?.title.romaji;
  const score = anime?.anilist_score || (anilistAnime?.averageScore ? anilistAnime.averageScore / 10 : null);

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

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-8">
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

            {/* Description Section */}
            {anilistAnime?.description && (
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

            {/* Progress and Status Section - Only for database anime */}
            {isInDatabase && anime && (
              <>
                <Separator className="bg-anime-gray/50" />
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Progress & Status</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="progress">AniList Progress</Label>
                      {editingProgress ? (
                        <div className="flex gap-2">
                          <Input
                            id="progress"
                            type="number"
                            min="0"
                            max={anime.episodes || 0}
                            value={tempProgress}
                            onChange={(e) => setTempProgress(parseInt(e.target.value) || 0)}
                            className="flex-1"
                          />
                          <Button onClick={handleProgressSave} size="sm">Save</Button>
                          <Button 
                            onClick={() => {
                              setEditingProgress(false);
                              setTempProgress(anime.anilist_progress || 0);
                            }} 
                            variant="outline" 
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{anime.anilist_progress || 0} / {anime.episodes || 0}</span>
                          <Button onClick={() => setEditingProgress(true)} variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Watch Status</Label>
                      {editingStatus ? (
                        <div className="flex gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="flex-1 justify-between">
                                {anime.watch_status || "Select Status"}
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full bg-background border border-border">
                              {WATCH_STATUSES.map((status) => (
                                <DropdownMenuItem 
                                  key={status} 
                                  onClick={() => handleStatusChange(status)}
                                  className="cursor-pointer"
                                >
                                  {status}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button onClick={() => setEditingStatus(false)} variant="outline" size="sm">
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              anime.watch_status === "COMPLETED" ? "success" :
                              anime.watch_status === "CURRENT" ? "warning" :
                              "secondary"
                            }
                          >
                            {anime.watch_status || "Unknown"}
                          </Badge>
                          <Button onClick={() => setEditingStatus(true)} variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator className="bg-anime-gray/50" />

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
                )}
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

            {/* File System - Only for database anime */}
            {isInDatabase && anime && (
              <>
                <Separator className="bg-anime-gray/50" />
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">File System</h2>
                  <div className="grid grid-cols-1 gap-y-4">
                    <DetailItem label="Show Path" value={anime.show_path} />
                    <DetailItem label="Season Path" value={anime.season_path} />
                    <DetailItem label="Soundtrack Path" value={anime.soundtrack_path} />
                  </div>
                </div>
              </>
            )}

            {/* Soundtrack Information - Only for database anime */}
            {isInDatabase && anime?.soundtrack_info && (
              <>
                <Separator className="bg-anime-gray/50" />
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

export default AnimeDetail;
