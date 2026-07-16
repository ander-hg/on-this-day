export interface TodayEvent {
  year: number;
  text: string;
  page_title: string | null;
  extract: string | null;
  thumbnail_url: string | null;
  wiki_url: string | null;
}

export interface TodayResponse {
  date: string;
  featured: TodayEvent;
  events: TodayEvent[];
  generated_at: string;
}
