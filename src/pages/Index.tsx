
import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { AnimeGrid } from "@/components/AnimeGrid";
import { SortControls } from "@/components/SortControls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimeShow } from "@/types/anime";
import { ApiClient } from "@/services/apiClient";
import { SortField, SortDirection, sortAnimeList } from "@/utils/sorting";

const WATCH_STATUSES = ['ALL', 'CURRENT', 'PLANNING', 'COMPLETED', 'REPEATING', 'PAUSED'] as const;

const Index = () => {
  const [animeList, setAnimeList] = useState<AnimeShow[]>([]);
  const [filteredAnimeList, setFilteredAnimeList] = useState<AnimeShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [activeTab, setActiveTab] = useState<typeof WATCH_STATUSES[number]>("ALL");

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

  const filterAndSortAnime = (query: string, status: typeof WATCH_STATUSES[number]) => {
    let filtered = animeList;

    // Apply search filter
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(
        (anime) =>
          anime.english_name?.toLowerCase().includes(searchLower) ||
          anime.romanji_name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (status !== "ALL") {
      filtered = filtered.filter((anime) => anime.watch_status === status);
    }

    // Apply sorting
    filtered = sortAnimeList(filtered, sortField, sortDirection);

    setFilteredAnimeList(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterAndSortAnime(query, activeTab);
  };

  const handleTabChange = (status: typeof WATCH_STATUSES[number]) => {
    setActiveTab(status);
    filterAndSortAnime(searchQuery, status);
  };

  useEffect(() => {
    filterAndSortAnime(searchQuery, activeTab);
  }, [sortField, sortDirection]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar onSearch={handleSearch} searchQuery={searchQuery} />
      <main className="flex-1 container py-8">
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight">Anime Database</h1>
              <SortControls
                sortField={sortField}
                sortDirection={sortDirection}
                onSortFieldChange={setSortField}
                onSortDirectionChange={setSortDirection}
              />
            </div>
          </div>

          <Tabs defaultValue="ALL" className="w-full">
            <TabsList>
              {WATCH_STATUSES.map((status) => (
                <TabsTrigger
                  key={status}
                  value={status}
                  onClick={() => handleTabChange(status)}
                >
                  {status}
                </TabsTrigger>
              ))}
            </TabsList>
            {WATCH_STATUSES.map((status) => (
              <TabsContent key={status} value={status}>
                <AnimeGrid animeList={filteredAnimeList} isLoading={isLoading} />
              </TabsContent>
            ))}
          </Tabs>
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
