
import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { AnimeGrid } from "@/components/AnimeGrid";
import { AnimeShow } from "@/types/anime";
import { ApiClient } from "@/services/apiClient";

const Index = () => {
  const [animeList, setAnimeList] = useState<AnimeShow[]>([]);
  const [filteredAnimeList, setFilteredAnimeList] = useState<AnimeShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAnimeList = async () => {
      try {
        setIsLoading(true);
        const data = await ApiClient.getAnimeList();
        setAnimeList(data);
        setFilteredAnimeList(data);
      } catch (error) {
        console.error("Error fetching anime list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimeList();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    try {
      setIsLoading(true);
      const results = await ApiClient.searchAnime(query);
      setFilteredAnimeList(results);
    } catch (error) {
      console.error("Error searching anime:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="space-y-10">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Anime Database</h1>
            <p className="text-muted-foreground">
              Browse and search your personal anime collection
            </p>
          </div>
          
          <div className="mb-8">
            <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
          </div>
          
          <AnimeGrid animeList={filteredAnimeList} isLoading={isLoading} />
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

export default Index;
