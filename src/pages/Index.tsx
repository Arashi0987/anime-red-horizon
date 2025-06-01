
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

// Keys for localStorage
const STORAGE_KEYS = {
  SORT_FIELD: 'anime_sort_field',
  SORT_DIRECTION: 'anime_sort_direction',
  ACTIVE_TAB: 'anime_active_tab',
  SEARCH_QUERY: 'anime_search_query'
};

const Index = () => {
  const [animeList, setAnimeList] = useState<AnimeShow[]>([]);
  const [filteredAnimeList, setFilteredAnimeList] = useState<AnimeShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load state from localStorage with fallbacks
  const [searchQuery, setSearchQuery] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.SEARCH_QUERY) || ""
  );
  const [sortField, setSortField] = useState<SortField>(() => 
    (localStorage.getItem(STORAGE_KEYS.SORT_FIELD) as SortField) || "id"
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => 
    (localStorage.getItem(STORAGE_KEYS.SORT_DIRECTION) as SortDirection) || "asc"
  );
  const [activeTab, setActiveTab] = useState<typeof WATCH_STATUSES[number]>(() => 
    (localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) as typeof WATCH_STATUSES[number]) || "ALL"
  );

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
    localStorage.setItem(STORAGE_KEYS.SEARCH_QUERY, query);
    filterAndSortAnime(query, activeTab);
  };

  const handleTabChange = (status: typeof WATCH_STATUSES[number]) => {
    setActiveTab(status);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, status);
    filterAndSortAnime(searchQuery, status);
  };

  const handleSortFieldChange = (field: SortField) => {
    setSortField(field);
    localStorage.setItem(STORAGE_KEYS.SORT_FIELD, field);
  };

  const handleSortDirectionChange = (direction: SortDirection) => {
    setSortDirection(direction);
    localStorage.setItem(STORAGE_KEYS.SORT_DIRECTION, direction);
  };

  useEffect(() => {
    filterAndSortAnime(searchQuery, activeTab);
  }, [sortField, sortDirection, animeList]);

  // Apply initial filter when component mounts
  useEffect(() => {
    if (animeList.length > 0) {
      filterAndSortAnime(searchQuery, activeTab);
    }
  }, [animeList]);

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
                onSortFieldChange={handleSortFieldChange}
                onSortDirectionChange={handleSortDirectionChange}
              />
            </div>
          </div>

          <Tabs value={activeTab} className="w-full">
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
