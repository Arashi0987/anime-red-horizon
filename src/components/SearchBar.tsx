
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export function SearchBar({ onSearch, initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search anime by title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pr-12 pl-4 py-3 bg-anime-darker border-anime-gray focus:border-anime-red focus:ring-anime-red/20"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
