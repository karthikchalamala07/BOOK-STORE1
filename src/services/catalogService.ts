import { Book } from "../types";

export interface BookSummary {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  language: string;
  publicationYear: number;
  year: number;
  coverUrl: string;
  coverImage: string;
  rating: number;
  price: number;
  featured: boolean;
  isFeatured: boolean;
  stock: number;
  previewAvailable: boolean;
  previewDuration: number;
  quote?: string;
}

let catalogMemoryCache: BookSummary[] | null = null;
const CACHE_KEY = "storyvault_catalog_cache_v1";

/**
 * Resolves cover image URL safely with fallback
 */
export function resolveBookCoverUrl(bookId: string, customCoverUrl?: string): string {
  if (customCoverUrl && customCoverUrl.trim() !== "") return customCoverUrl;
  const coverMap: Record<string, string> = {
    "dracula": "/dracula-cover.jpg",
    "pride-and-prejudice": "/pride-and-prejudice-cover.jpg",
    "sherlock-holmes": "/sherlock-holmes-cover.jpg",
    "the-count-of-monte-cristo": "/the-count-of-monte-cristo-cover.jpg",
    "jane-eyre": "/jane-eyre-cover.jpg",
    "the-picture-of-dorian-gray": "/dorian-gray-cover.jpg",
    "the-time-machine": "/time-machine-cover.jpg",
    "frankenstein": "/frankenstein-cover.jpg",
    "the-metamorphosis": "/metamorphosis-cover.jpg",
    "the-odyssey": "/odyssey-cover.jpg",
    "moby-dick": "/moby-dick-cover.jpg",
    "alice-in-wonderland": "/alice-wonderland-cover.jpg",
    "peter-pan": "/peter-pan-cover.jpg",
    "the-great-gatsby": "/gatsby-cover.jpg",
    "crime-and-punishment": "/crime-punishment-cover.jpg",
    "war-and-peace": "/war-peace-cover.jpg",
    "les-miserables": "/les-miserables-cover.jpg",
    "don-quixote": "/don-quixote-cover.jpg",
    "the-divine-comedy": "/divine-comedy-cover.jpg",
    "the-iliad": "/iliad-cover.jpg"
  };
  return coverMap[bookId] || "/dracula-cover.jpg";
}

/**
 * Get fast lightweight catalog summaries with in-memory & sessionStorage caching
 */
export async function getCachedCatalogSummaries(): Promise<BookSummary[]> {
  if (catalogMemoryCache && catalogMemoryCache.length > 0) {
    return catalogMemoryCache;
  }

  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        catalogMemoryCache = parsed;
        return parsed;
      }
    }
  } catch (_) {}

  // Dynamic import of booksDb to avoid synchronous bundle bloat at app boot
  const { CLASSICS_DATABASE } = await import("./booksDb");
  
  const summaries: BookSummary[] = CLASSICS_DATABASE.map(b => {
    const cover = resolveBookCoverUrl(b.id, b.coverUrl);
    const isFeat = ["dracula", "pride-and-prejudice", "sherlock-holmes", "the-count-of-monte-cristo"].includes(b.id);
    return {
      id: b.id,
      title: b.title,
      author: b.author,
      description: b.description || "",
      genre: b.genre || "Classic Literature",
      language: b.language || "English",
      publicationYear: b.year || 1900,
      year: b.year || 1900,
      coverImage: cover,
      coverUrl: cover,
      rating: 4.9,
      featured: isFeat,
      isFeatured: isFeat,
      price: isFeat ? 14.99 : 9.99,
      previewAvailable: true,
      previewDuration: 20,
      stock: isFeat ? 25 : 50,
      quote: b.quote || ""
    };
  });

  catalogMemoryCache = summaries;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(summaries));
  } catch (_) {}

  return summaries;
}

/**
 * Fetch full book content with chapters lazily when reader or book details opens
 */
export async function fetchFullBookContent(bookId: string): Promise<Book | null> {
  const { CLASSICS_DATABASE } = await import("./booksDb");
  const found = CLASSICS_DATABASE.find(b => b.id === bookId);
  if (!found) return null;

  const cover = resolveBookCoverUrl(found.id, found.coverUrl);
  return {
    ...found,
    coverUrl: cover,
    coverImage: cover,
    chapters: found.chapters || []
  } as Book;
}