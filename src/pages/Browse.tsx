
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, Star } from "lucide-react";

interface TrendingAnime {
  id: number;
  title: {
    english: string | null;
    romaji: string;
  };
  coverImage: {
    large: string;
  };
  averageScore: number | null;
  seasonYear: number;
  season: string;
  episodes: number | null;
  status: string;
  genres: string[];
  description: string | null;
}

const SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 12 || month <= 2) return 'WINTER';
  if (month >= 3 && month <= 5) return 'SPRING';
  if (month >= 6 && month <= 8) return 'SUMMER';
  return 'FALL';
};

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingAnime, setTrendingAnime] = useState<TrendingAnime[]>([]);
  const [searchResults, setSearchResults] = useState<TrendingAnime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(getCurrentSeason());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchTrendingAnime = async (season: string, year: number) => {
    try {
      setIsLoading(true);
      
      const query = `
        query {
          Page(page: 1, perPage: 20) {
            media(
              season: ${season}
              seasonYear: ${year}
              type: ANIME
              sort: TRENDING_DESC
              isAdult: false
            ) {
              id
              title {
                english
                romaji
              }
              coverImage {
                large
              }
              averageScore
              seasonYear
              season
              episodes
              status
              genres
              description(asHtml: false)
            }
          }
        }
      `;

      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch trending anime: ${response.status}`);
      }

      const data = await response.json();
      setTrendingAnime(data.data.Page.media);
    } catch (error) {
      console.error("Error fetching trending anime:", error);
      setTrendingAnime([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchAnilist = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      
      const graphqlQuery = `
        query ($search: String) {
          Page(page: 1, perPage: 20) {
            media(search: $search, type: ANIME, isAdult: false) {
              id
              title {
                english
                romaji
              }
              coverImage {
                large
              }
              averageScore
              seasonYear
              season
              episodes
              status
              genres
              description(asHtml: false)
            }
          }
        }
      `;

      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          query: graphqlQuery,
          variables: { search: query }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to search anime: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.data.Page.media);
    } catch (error) {
      console.error("Error searching anime:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchAnilist(query);
  };

  useEffect(() => {
    fetchTrendingAnime(selectedSeason, selectedYear);
  }, [selectedSeason, selectedYear]);

  const truncateDescription = (description: string | null, maxLength: number = 150) => {
    if (!description) return "No description available.";
    
    // Remove HTML tags
    const cleanDescription = description.replace(/<[^>]*>/g, '');
    
    if (cleanDescription.length <= maxLength) return cleanDescription;
    return cleanDescription.substr(0, maxLength) + "...";
  };

  const displayedAnime = searchQuery.trim() ? searchResults : trendingAnime;
  const currentlyLoading = searchQuery.trim() ? isSearching : isLoading;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar onSearch={handleSearch} searchQuery={searchQuery} />
      
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">
              {searchQuery.trim() ? `Search Results for "${searchQuery}"` : 'Browse Trending Anime'}
            </h1>
          </div>
          
          {/* Season and Year Selector - only show when not searching */}
          {!searchQuery.trim() && (
            <div className="flex gap-4 items-center">
              <div className="flex gap-2">
                {SEASONS.map((season) => (
                  <Button
                    key={season}
                    variant={selectedSeason === season ? "default" : "outline"}
                    onClick={() => setSelectedSeason(season)}
                    size="sm"
                  >
                    {season}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                {[selectedYear - 1, selectedYear, selectedYear + 1].map((year) => (
                  <Button
                    key={year}
                    variant={selectedYear === year ? "default" : "outline"}
                    onClick={() => setSelectedYear(year)}
                    size="sm"
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {currentlyLoading && (
            <div className="flex justify-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Anime Grid */}
          {!currentlyLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedAnime.map((anime) => (
                <Card key={anime.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img
                      src={anime.coverImage.large}
                      alt={anime.title.english || anime.title.romaji}
                      className="w-full h-full object-cover"
                    />
                    {anime.averageScore && (
                      <div className="absolute top-2 right-2 bg-black/80 rounded-md p-1 backdrop-blur-sm">
                        <div className="flex items-center gap-1 text-yellow-400 text-sm">
                          <Star className="w-3 h-3" />
                          {(anime.averageScore / 10).toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {anime.title.english || anime.title.romaji}
                    </CardTitle>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {anime.season && anime.seasonYear ? `${anime.season} ${anime.seasonYear}` : 'Unknown'}
                      {anime.episodes && <span>• {anime.episodes} eps</span>}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {truncateDescription(anime.description)}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {anime.genres.slice(0, 3).map((genre) => (
                          <Badge key={genre} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                        {anime.genres.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{anime.genres.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <Button asChild className="w-full" size="sm">
                        <Link to={`/anime/${anime.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {!currentlyLoading && displayedAnime.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery.trim() 
                  ? `No anime found for "${searchQuery}"`
                  : `No trending anime found for ${selectedSeason} ${selectedYear}`
                }
              </p>
            </div>
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

export default Browse;
