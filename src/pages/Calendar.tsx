
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { AnimeShow } from "@/types/anime";
import { ApiClient } from "@/services/apiClient";
import { AnilistClient, AiringAnime } from "@/services/anilistClient";

interface AnimeRelease {
  id: number;
  title: string;
  episode: number;
  airingDate: Date;
  isFromDatabase: boolean;
  coverImage?: string;
}

const Calendar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [animeList, setAnimeList] = useState<AnimeShow[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [animeReleases, setAnimeReleases] = useState<AnimeRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReleaseData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch both database anime and AniList airing data
        const [databaseAnime, airingAnime] = await Promise.all([
          ApiClient.getAnimeList(),
          AnilistClient.getAiringAnime()
        ]);

        setAnimeList(databaseAnime);
        
        // Convert both data sources to unified release format
        const releases: AnimeRelease[] = [];
        
        // Add releases from database anime (for ongoing shows)
        const ongoingDatabaseAnime = databaseAnime.filter(
          anime => anime.release_status === "Ongoing" || anime.watch_status === "CURRENT"
        );
        
        // Add releases from AniList airing data
        airingAnime.forEach(anime => {
          if (anime.nextAiringEpisode) {
            const airingDate = new Date(anime.nextAiringEpisode.airingAt * 1000);
            
            // Check if this anime is also in our database
            const dbAnime = databaseAnime.find(db => db.id === anime.id);
            
            releases.push({
              id: anime.id,
              title: anime.title.english || anime.title.romaji,
              episode: anime.nextAiringEpisode.episode,
              airingDate,
              isFromDatabase: !!dbAnime,
              coverImage: anime.coverImage.medium
            });
          }
        });
        
        // Sort releases by date
        releases.sort((a, b) => a.airingDate.getTime() - b.airingDate.getTime());
        
        setAnimeReleases(releases);
      } catch (error) {
        console.error("Error fetching release data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReleaseData();
  }, []);

  const getAnimeForDate = (date: Date) => {
    if (!date) return [];
    
    const releases = animeReleases.filter(release => {
      const releaseDate = release.airingDate;
      return (
        releaseDate.getDate() === date.getDate() &&
        releaseDate.getMonth() === date.getMonth() &&
        releaseDate.getFullYear() === date.getFullYear()
      );
    });
    
    // Sort by library status (library shows first) then by episode number
    return releases.sort((a, b) => {
      if (a.isFromDatabase && !b.isFromDatabase) return -1;
      if (!a.isFromDatabase && b.isFromDatabase) return 1;
      return a.episode - b.episode;
    });
  };

  const selectedDateReleases = selectedDate ? getAnimeForDate(selectedDate) : [];

  const getDatesWithReleases = () => {
    return animeReleases.map(release => release.airingDate);
  };

  // Get upcoming releases for the next 30 days
  const getUpcomingReleases = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return animeReleases
      .filter(release => release.airingDate >= now && release.airingDate <= thirtyDaysFromNow)
      .slice(0, 15);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Release Calendar</h1>
          <p className="text-muted-foreground">
            Showing real-time airing schedules from AniList for currently releasing anime. Library shows appear first.
          </p>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Releases</CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      hasRelease: getDatesWithReleases()
                    }}
                    modifiersStyles={{
                      hasRelease: {
                        backgroundColor: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                        fontWeight: 'bold'
                      }
                    }}
                  />
                </CardContent>
              </Card>

              {/* Releases for Selected Date */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDate 
                      ? `Releases on ${selectedDate.toLocaleDateString()}`
                      : "Select a date"
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDateReleases.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateReleases.map((release) => (
                        <div key={`${release.id}-${release.episode}`} className="flex items-center gap-4 p-4 border rounded-lg">
                          {release.coverImage && (
                            <img 
                              src={release.coverImage} 
                              alt={release.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <Link 
                              to={`/anime/${release.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {release.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">
                                Episode {release.episode}
                              </Badge>
                              <Badge variant={release.isFromDatabase ? "default" : "outline"}>
                                {release.isFromDatabase ? "In Library" : "AniList"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {release.airingDate.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      {selectedDate 
                        ? "No releases scheduled for this date"
                        : "Select a date to see releases"
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Upcoming Releases List */}
          {!isLoading && animeReleases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Next 30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUpcomingReleases().map((release) => (
                    <div key={`${release.id}-${release.episode}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {release.coverImage && (
                          <img 
                            src={release.coverImage} 
                            alt={release.title}
                            className="w-10 h-14 object-cover rounded"
                          />
                        )}
                        <div>
                          <Link 
                            to={`/anime/${release.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {release.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              Episode {release.episode}
                            </Badge>
                            <Badge variant={release.isFromDatabase ? "default" : "outline"} className="text-xs">
                              {release.isFromDatabase ? "In Library" : "AniList"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {release.airingDate.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {release.airingDate.toLocaleDateString('en-US', { weekday: 'long' })} • {
                            release.airingDate.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <footer className="border-t border-border bg-anime-darker py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with React, Tailwind and Shadcn UI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Calendar;
