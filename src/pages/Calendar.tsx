
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { AnimeShow } from "@/types/anime";
import { ApiClient } from "@/services/apiClient";

interface AnimeRelease {
  anime: AnimeShow;
  nextEpisodeDate?: Date;
}

const Calendar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [animeList, setAnimeList] = useState<AnimeShow[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [animeReleases, setAnimeReleases] = useState<AnimeRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnimeList = async () => {
      try {
        setIsLoading(true);
        const data = await ApiClient.getAnimeList();
        setAnimeList(data);
        
        // For now, we'll create mock release dates since we don't have this data in the database
        // In a real implementation, you'd fetch actual airing schedules from AniList
        const releases: AnimeRelease[] = data
          .filter(anime => anime.release_status === "Ongoing" || anime.watch_status === "CURRENT")
          .map(anime => ({
            anime,
            nextEpisodeDate: getNextEpisodeDate(anime)
          }))
          .filter(release => release.nextEpisodeDate);
        
        setAnimeReleases(releases);
      } catch (error) {
        console.error("Error fetching anime list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimeList();
  }, []);

  // Mock function to generate next episode dates - in real app, this would come from AniList
  const getNextEpisodeDate = (anime: AnimeShow): Date | undefined => {
    if (anime.release_status !== "Ongoing" && anime.watch_status !== "CURRENT") {
      return undefined;
    }
    
    // Generate a random date within the next 30 days for demo purposes
    const today = new Date();
    const randomDays = Math.floor(Math.random() * 30);
    const releaseDate = new Date(today);
    releaseDate.setDate(today.getDate() + randomDays);
    
    return releaseDate;
  };

  const getAnimeForDate = (date: Date) => {
    if (!date) return [];
    
    return animeReleases.filter(release => {
      if (!release.nextEpisodeDate) return false;
      
      const releaseDate = release.nextEpisodeDate;
      return (
        releaseDate.getDate() === date.getDate() &&
        releaseDate.getMonth() === date.getMonth() &&
        releaseDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const selectedDateReleases = selectedDate ? getAnimeForDate(selectedDate) : [];

  const getDatesWithReleases = () => {
    return animeReleases
      .map(release => release.nextEpisodeDate)
      .filter(date => date) as Date[];
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Release Calendar</h1>
          
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
                      {selectedDateReleases.map(({ anime }) => (
                        <div key={anime.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="flex-1">
                            <Link 
                              to={`/anime/${anime.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {anime.english_name || anime.romanji_name}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">
                                Episode {(anime.anilist_progress || 0) + 1}
                              </Badge>
                              {anime.watch_status && (
                                <Badge variant="outline">
                                  {anime.watch_status}
                                </Badge>
                              )}
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
                <CardTitle>All Upcoming Releases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {animeReleases
                    .sort((a, b) => {
                      if (!a.nextEpisodeDate || !b.nextEpisodeDate) return 0;
                      return a.nextEpisodeDate.getTime() - b.nextEpisodeDate.getTime();
                    })
                    .slice(0, 10)
                    .map(({ anime, nextEpisodeDate }) => (
                      <div key={anime.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Link 
                            to={`/anime/${anime.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {anime.english_name || anime.romanji_name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Episode {(anime.anilist_progress || 0) + 1}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {nextEpisodeDate?.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {nextEpisodeDate?.toLocaleDateString('en-US', { weekday: 'long' })}
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
