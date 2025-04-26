import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Separator } from "@/components/ui/separator";

const About = () => {
  // Add a dummy state for search to satisfy the Navbar props
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dummy search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar onSearch={handleSearch} searchQuery={searchQuery} />
      <main className="flex-1 container py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">About This App</h1>
            <p className="text-muted-foreground leading-relaxed">
              This is a personal anime database viewer that displays information from a local SQLite database.
              It provides a clean, organized interface to browse and search your anime collection.
            </p>
          </div>
          
          <Separator className="bg-anime-gray/50" />
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Database Structure</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium mb-3">Show Table</h3>
                <div className="bg-anime-darker border border-anime-gray rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-muted-foreground">
{`CREATE TABLE show (
  id INTEGER NOT NULL, 
  english_name VARCHAR(255), 
  romanji_name VARCHAR(255), 
  year INTEGER, 
  num_seasons INTEGER, 
  is_dubbed BOOLEAN, 
  show_path VARCHAR(255), 
  season_path VARCHAR(255), 
  soundtrack_path VARCHAR(255), 
  sonarr_id INTEGER, 
  sonarr_monitor_status BOOLEAN, 
  season_number INTEGER,
  episodes INTEGER,
  episodes_dl INTEGER,
  anilist_progress INTEGER,
  release_status VARCHAR(255), 
  PRIMARY KEY (id)
)`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-3">Soundtrack Table</h3>
                <div className="bg-anime-darker border border-anime-gray rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-muted-foreground">
{`CREATE TABLE soundtrack (
  soundtrack_path VARCHAR NOT NULL, 
  albums_count INTEGER, 
  albums_missing INTEGER, 
  lossless VARCHAR, 
  album_list VARCHAR, 
  file_formats VARCHAR, 
  download_status VARCHAR,
  PRIMARY KEY (soundtrack_path), 
  FOREIGN KEY(soundtrack_path) REFERENCES show (soundtrack_path)
)`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="bg-anime-gray/50" />
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">External Integrations</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium">AniList</h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  This app uses the AniList GraphQL API to fetch cover images for anime based on their AniList ID.
                  The ID in the database corresponds directly to each show's AniList ID.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-medium">Sonarr</h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  The app also contains Sonarr integration capabilities, with Sonarr IDs stored in the database.
                  This allows for potential future features like monitoring status updates and more.
                </p>
              </div>
            </div>
          </div>
          
          <Separator className="bg-anime-gray/50" />
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Technologies Used</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>React with TypeScript for the frontend</li>
              <li>React Router for navigation</li>
              <li>Tailwind CSS for styling</li>
              <li>Shadcn UI for component library</li>
              <li>SQLite database (connected via backend)</li>
              <li>AniList GraphQL API for cover images</li>
            </ul>
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

export default About;
