export type Arcana = "major" | "minor";
export type Suit = "wands" | "cups" | "swords" | "pentacles";
export type SpreadType = "three_card" | "free_form";

export interface Card {
  id: number;
  name_uk: string;
  name_en: string;
  arcana: Arcana;
  suit: Suit | null;
  number: number | null;
  keywords: string[];
  meaning_up: string;
  meaning_rev: string;
  reflections: string[];
  image_url: string | null;
}

export interface Reading {
  id: string;
  user_id: string;
  title: string;
  question: string | null;
  spread_type: SpreadType;
  notes: string | null;
  interpretation: string | null;
  created_at: string;
  updated_at: string;
  reading_cards?: ReadingCard[];
}

export interface ReadingCard {
  id: string;
  reading_id: string;
  card_id: number;
  position: number;
  position_name: string | null;
  is_reversed: boolean;
  note: string | null;
  card?: Card;
}

export interface CardNote {
  id: string;
  user_id: string;
  card_id: number;
  content: string;
  updated_at: string;
}

export interface Favorite {
  user_id: string;
  card_id: number;
  added_at: string;
  card?: Card;
}

export interface HoroscopeCache {
  date: string;
  sign: string;
  text: string;
  source: string | null;
}
