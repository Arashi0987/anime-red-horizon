export interface AnimeShow {
  id: number;
  english_name: string | null;
  romanji_name: string | null;
  year: number | null;
  num_seasons: number | null;
  is_dubbed: boolean | null;
  show_path: string | null;
  season_path: string | null;
  soundtrack_path: string | null;
  sonarr_id: number | null;
  sonarr_monitor_status: boolean | null;
  season_number: number | null;
  episodes: number | null;
  episodes_dl: number | null;
  anilist_progress: number | null;
  release_status: string | null;
  cover_image: string | null;
  watch_status: 'CURRENT' | 'PLANNING' | 'COMPLETED' | 'REPEATING' | 'PAUSED' | null;
}

export interface SoundtrackInfo {
  soundtrack_path: string;
  albums_count: number | null;
  albums_missing: number | null;
  lossless: string | null;
  album_list: string | null;
  file_formats: string | null;
  download_status: string | null;
}

export interface AnimeShowWithSoundtrack extends AnimeShow {
  soundtrack_info?: SoundtrackInfo;
}

export interface ExternalLinks {
  plexUrl: string | null;
  anilistUrl: string | null;
  sonarrUrl: string | null;
}
