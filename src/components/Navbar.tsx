
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";

interface NavbarProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function Navbar({ onSearch, searchQuery }: NavbarProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-primary font-bold text-2xl">ANIMEDB</span>
        </Link>
        
        <div className="flex-1 max-w-md mx-4">
          <SearchBar onSearch={onSearch} initialQuery={searchQuery} />
        </div>
        
        <nav className="flex gap-4 sm:gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              isActive('/') ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            My Anime
          </Link>
          <Link
            to="/browse"
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              isActive('/browse') ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Browse
          </Link>
          <Link
            to="/calendar"
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              isActive('/calendar') ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Calendar
          </Link>
          <Link
            to="/about"
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              isActive('/about') ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
