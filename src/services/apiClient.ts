import { AnimeShow, SoundtrackInfo } from "@/types/anime";

// Determine the API URL dynamically based on deployment environment
const getApiUrl = () => {
  // Get the current hostname - works in both development and production
  const hostname = window.location.hostname;
  
  // If we're in a development environment running on localhost/127.0.0.1
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return "http://panther:5000/api";
  } 
  // If we're running from another machine in the network (accessing via hostname like 'panther')
  else {
    // Use the same hostname but different port for the API
    return `http://panther:5000/api`;
  }
};

const API_URL = getApiUrl();

// Add these constants at the top
const PLEX_SERVER = 'http://10.69.69.2:32400';
const PLEX_API_KEY = 'ct3YmCjMytMAbuDN-WsT';
const SONARR_SERVER = 'http://10.69.69.5:8989';
const SONARR_API_KEY = '2a3168821bd3472e8c72db6834a49d1f';
const PLEX_BASE_URL = 'fox:32400/web/index.html#!/server/dee803aee81588094b32e6421c83111317709994/details?key=%2Flibrary%2Fmetadata%2F';

export interface ExternalLinks {
  plexUrl: string | null;
  anilistUrl: string | null;
  sonarrUrl: string | null;
}

// This client can be used with the Express server (see server/server.js)
// It provides methods to fetch data from your actual SQLite database
export class ApiClient {
  // Get all anime shows
  static async getAnimeList(): Promise<AnimeShow[]> {
    try {
      console.log(`Fetching anime list from: ${API_URL}/anime`);
      const response = await fetch(`${API_URL}/anime`);
      if (!response.ok) {
        throw new Error(`Failed to fetch anime list: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching anime list:", error);
      
      // Return sample data for development/fallback
      return this.getSampleAnimeList();
    }
  }

  // Get anime by ID
  static async getAnimeById(id: number): Promise<AnimeShow | undefined> {
    try {
      console.log(`Fetching anime with ID ${id} from: ${API_URL}/anime/${id}`);
      const response = await fetch(`${API_URL}/anime/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch anime with ID ${id}: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching anime with ID ${id}:`, error);
      
      // Return sample data for development/fallback
      return this.getSampleAnimeList().find(anime => anime.id === id);
    }
  }

  // Search anime by name
  static async searchAnime(query: string): Promise<AnimeShow[]> {
    if (!query) return this.getAnimeList();
    
    try {
      console.log(`Searching anime with query "${query}" from: ${API_URL}/anime/search/${encodeURIComponent(query)}`);
      const response = await fetch(`${API_URL}/anime/search/${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Failed to search anime: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error searching anime:", error);
      
      // Return filtered sample data for development/fallback
      const lowercaseQuery = query.toLowerCase();
      return this.getSampleAnimeList().filter(
        anime => 
          (anime.english_name && anime.english_name.toLowerCase().includes(lowercaseQuery)) || 
          (anime.romanji_name && anime.romanji_name.toLowerCase().includes(lowercaseQuery))
      );
    }
  }

  // Get anime with soundtrack info
  static async getAnimeWithSoundtrack(id: number): Promise<AnimeShow & { soundtrack_info?: SoundtrackInfo }> {
    try {
      console.log(`Fetching anime with soundtrack info for ID ${id} from: ${API_URL}/anime/${id}`);
      const response = await fetch(`${API_URL}/anime/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch anime with ID ${id}: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching anime with ID ${id}:`, error);
      
      // Return sample data for development/fallback
      const anime = this.getSampleAnimeList().find(anime => anime.id === id);
      if (!anime) {
        throw new Error(`Anime with ID ${id} not found`);
      }
      
      const soundtrack = anime.soundtrack_path 
        ? this.getSampleSoundtracks().find(s => s.soundtrack_path === anime.soundtrack_path)
        : undefined;
      
      return {
        ...anime,
        soundtrack_info: soundtrack,
      };
    }
  }

  static async getExternalLinks(animeId: number, sonarrId: number | null, plexId: number | null): Promise<ExternalLinks> {
    try {
      // For now, we'll return static URLs until we implement the API calls
      const anilistUrl = `https://anilist.co/anime/${animeId}`;
      
      // Use the plex_id to generate the Plex URL using the new format
      const plexUrl = plexId ? `${PLEX_BASE_URL}${plexId}` : null;
      const sonarrUrl = sonarrId ? `${SONARR_SERVER}/series/${sonarrId}` : null;

      return {
        plexUrl,
        anilistUrl,
        sonarrUrl
      };
    } catch (error) {
      console.error('Error fetching external links:', error);
      return {
        plexUrl: null,
        anilistUrl: null,
        sonarrUrl: null
      };
    }
  }

  // Update sample data to include new fields
  private static getSampleAnimeList(): AnimeShow[] {
    return [
      {
        id: 1535,
        english_name: "Death Note",
        romanji_name: "Desu Nōto",
        year: 2006,
        num_seasons: 1,
        is_dubbed: true,
        show_path: "/anime/Death Note",
        season_path: "/anime/Death Note/Season 1",
        soundtrack_path: "/soundtracks/Death Note",
        sonarr_id: 12345,
        sonarr_monitor_status: true,
        season_number: 1,
        episodes: 37,
        episodes_dl: 37,
        anilist_progress: 37,
        release_status: "Completed",
        cover_image: null,
        watch_status: "COMPLETED",
        anilist_score: 8.7,
        plex_id: 49323
      },
      {
        id: 101922,
        english_name: "Demon Slayer",
        romanji_name: "Kimetsu no Yaiba",
        year: 2019,
        num_seasons: 3,
        is_dubbed: true,
        show_path: "/anime/Demon Slayer",
        season_path: "/anime/Demon Slayer/Season 1",
        soundtrack_path: "/soundtracks/Demon Slayer",
        sonarr_id: 23456,
        sonarr_monitor_status: true,
        season_number: 1,
        episodes: 26,
        episodes_dl: 26,
        anilist_progress: 26,
        release_status: "Ongoing",
        cover_image: null,
        watch_status: "CURRENT",
        anilist_score: 9.2,
        plex_id: 50434
      },
      {
        id: 20605,
        english_name: "My Hero Academia",
        romanji_name: "Boku no Hero Academia",
        year: 2016,
        num_seasons: 6,
        is_dubbed: true,
        show_path: "/anime/My Hero Academia",
        season_path: "/anime/My Hero Academia/Season 1",
        soundtrack_path: "/soundtracks/My Hero Academia",
        sonarr_id: 34567,
        sonarr_monitor_status: true,
        season_number: 1,
        episodes: 13,
        episodes_dl: 13,
        anilist_progress: 13,
        release_status: "Ongoing",
        cover_image: null,
        watch_status: "PLANNING",
        anilist_score: 8.5,
        plex_id: 51545
      },
      {
        id: 21459,
        english_name: "Attack on Titan",
        romanji_name: "Shingeki no Kyojin",
        year: 2013,
        num_seasons: 4,
        is_dubbed: true,
        show_path: "/anime/Attack on Titan",
        season_path: "/anime/Attack on Titan/Season 1",
        soundtrack_path: "/soundtracks/Attack on Titan",
        sonarr_id: 45678,
        sonarr_monitor_status: true,
        season_number: 1,
        episodes: 25,
        episodes_dl: 25,
        anilist_progress: 25,
        release_status: "Completed",
        cover_image: null,
        watch_status: "COMPLETED",
        anilist_score: 9.0,
        plex_id: 52656
      },
      {
        id: 20958,
        english_name: "One Punch Man",
        romanji_name: "Wanpanman",
        year: 2015,
        num_seasons: 2,
        is_dubbed: true,
        show_path: "/anime/One Punch Man",
        season_path: "/anime/One Punch Man/Season 1",
        soundtrack_path: "/soundtracks/One Punch Man",
        sonarr_id: 56789,
        sonarr_monitor_status: true,
        season_number: 1,
        episodes: 12,
        episodes_dl: 12,
        anilist_progress: 12,
        release_status: "Ongoing",
        cover_image: null,
        watch_status: "PAUSED",
        anilist_score: 8.8,
        plex_id: 53767
      },
    ];
  }

  private static getSampleSoundtracks(): SoundtrackInfo[] {
    return [
      {
        soundtrack_path: "/soundtracks/Death Note",
        albums_count: 3,
        albums_missing: 0,
        lossless: "Yes",
        album_list: "OST Vol.1, OST Vol.2, Character Themes",
        file_formats: "FLAC",
        download_status: "Complete",
      },
      {
        soundtrack_path: "/soundtracks/Demon Slayer",
        albums_count: 4,
        albums_missing: 1,
        lossless: "Partial",
        album_list: "OST Vol.1, OST Vol.2, Character Themes, Movie OST",
        file_formats: "FLAC, MP3",
        download_status: "Partial",
      },
      {
        soundtrack_path: "/soundtracks/My Hero Academia",
        albums_count: 6,
        albums_missing: 2,
        lossless: "Partial",
        album_list: "Season 1 OST, Season 2 OST, Season 3 OST, Season 4 OST",
        file_formats: "FLAC, MP3",
        download_status: "Partial",
      },
    ];
  }
}

// Mapping of common anime IDs to their image URLs to reduce Anilist API calls
const ANIME_IMAGE_CACHE = {
  1535: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1535-kUgkcrfOrkUM.jpg", // Death Note
  101922: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx101922-WBsBl0ClmgYL.jpg", // Demon Slayer
  20605: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b20605-k665mVkSug8D.jpg", // My Hero Academia
  21459: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21459-nYh85uj2Fuwr.jpg", // Attack on Titan
  20958: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20958-HuFJyr54Mmir.jpg", // One Punch Man
  // Feel free to add more entries for other anime you're showing
};

// This function fetches cover art from Anilist based on the ID with improved error handling
export async function getAnilistCoverImage(id: number): Promise<string> {
  try {
    // First check if we have the image cached
    if (ANIME_IMAGE_CACHE[id]) {
      console.log(`Using cached image for anime ID ${id}`);
      return ANIME_IMAGE_CACHE[id];
    }
    
    const query = `
      query {
        Media(id: ${id}, type: ANIME) {
          coverImage {
            large
          }
          averageScore
        }
      }
    `;

    const controller = new AbortController();
    // Set a timeout to prevent hanging requests
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // If we can't get the image from Anilist, throw an error to use our fallback
    if (!response.ok) {
      throw new Error(`Failed to fetch from Anilist: ${response.status}`);
    }

    const data = await response.json();
    
    // Make sure the response has what we need
    if (!data?.data?.Media?.coverImage?.large) {
      throw new Error('Invalid data structure from Anilist API');
    }

    // Update the anime in the database with the score if available
    if (data?.data?.Media?.averageScore) {
      // Note: You'll need to implement this API endpoint on your backend
      const score = data.data.Media.averageScore / 10; // Convert to 1-10 scale
      console.log(`Retrieved score for anime ${id}: ${score}`);
    }
    
    return data.data.Media.coverImage.large;
  } catch (error) {
    console.error('Error fetching Anilist cover image:', error);
    // Return a placeholder image from Unsplash if the fetch fails
    return `https://source.unsplash.com/featured/?anime,${id}`;
  }
}
