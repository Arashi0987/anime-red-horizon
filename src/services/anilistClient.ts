
export interface AnilistAnime {
  id: number;
  title: {
    english: string | null;
    romaji: string;
  };
  description: string | null;
  coverImage: {
    large: string;
  };
  averageScore: number | null;
  seasonYear: number | null;
  season: string | null;
  episodes: number | null;
  status: string;
  genres: string[];
  studios: {
    nodes: Array<{
      name: string;
      isMain: boolean;
    }>;
  };
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  format: string | null;
  duration: number | null;
  nextAiringEpisode: {
    airingAt: number;
    episode: number;
  } | null;
}

export interface AiringAnime {
  id: number;
  title: {
    english: string | null;
    romaji: string;
  };
  nextAiringEpisode: {
    airingAt: number;
    episode: number;
  };
  coverImage: {
    medium: string;
  };
  episodes: number | null;
}

export class AnilistClient {
  private static readonly GRAPHQL_URL = 'https://graphql.anilist.co';

  static async getAnimeById(id: number): Promise<AnilistAnime | null> {
    try {
      const query = `
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            id
            title {
              english
              romaji
            }
            description(asHtml: false)
            coverImage {
              large
            }
            averageScore
            seasonYear
            season
            episodes
            status
            genres
            studios {
              nodes {
                name
                isMain
              }
            }
            startDate {
              year
              month
              day
            }
            format
            duration
            nextAiringEpisode {
              airingAt
              episode
            }
          }
        }
      `;

      const response = await fetch(this.GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { id },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch anime: ${response.status}`);
      }

      const data = await response.json();
      return data.data.Media;
    } catch (error) {
      console.error(`Error fetching anime ${id} from AniList:`, error);
      return null;
    }
  }

  static async getAiringAnime(): Promise<AiringAnime[]> {
    try {
      const query = `
        query {
          Page(page: 1, perPage: 50) {
            media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC) {
              id
              title {
                english
                romaji
              }
              nextAiringEpisode {
                airingAt
                episode
              }
              coverImage {
                medium
              }
              episodes
            }
          }
        }
      `;

      const response = await fetch(this.GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch airing anime: ${response.status}`);
      }

      const data = await response.json();
      return data.data.Page.media.filter((anime: AiringAnime) => anime.nextAiringEpisode);
    } catch (error) {
      console.error('Error fetching airing anime from AniList:', error);
      return [];
    }
  }

  static cleanDescription(description: string | null): string {
    if (!description) return "No description available.";
    
    // Remove HTML tags and clean up the text
    return description
      .replace(/<[^>]*>/g, '')
      .replace(/\n\n+/g, '\n\n')
      .trim();
  }
}
