export interface LyricLine {
  time: number;
  ja: string;
  romaji: string;
  zh: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  lyrics: LyricLine[];
} 