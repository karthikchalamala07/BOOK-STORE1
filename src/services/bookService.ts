import { supabase, isSupabaseConfigValid } from "../lib/supabase";
import { getCachedCatalogSummaries } from "./catalogService";
import { Book } from "../types";

export const bookService = {
  async getPublishedBooks(): Promise<Book[]> {
    if (!isSupabaseConfigValid) {
      const cached = await getCachedCatalogSummaries();
      return (cached || []) as unknown as Book[];
    }

    try {
      const { data, error } = await supabase
        .from("books")
        .select(`
          *,
          authors (id, name, bio, photo_url),
          categories (id, name, slug)
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        const cached = await getCachedCatalogSummaries();
        return (cached || []) as unknown as Book[];
      }

      return data.map((b: any) => ({
        id: b.id,
        title: b.title,
        author: b.authors?.name || "Unknown Author",
        authorBio: b.authors?.bio || "",
        authorImage: b.authors?.photo_url || "",
        category: b.categories?.name || "Classic Literature",
        price: Number(b.price || b.physical_price || 24.99),
        digitalPrice: Number(b.digital_price || 14.99),
        physicalPrice: Number(b.physical_price || b.price || 24.99),
        description: b.description || "",
        coverUrl: b.cover_url || "",
        featured: !!b.is_featured,
        bestseller: !!b.is_bestseller,
        genre: b.categories?.name || "Fiction",
        year: "1897",
        language: "English",
        quote: ""
      })) as unknown as Book[];
    } catch (_) {
      const cached = await getCachedCatalogSummaries();
      return (cached || []) as unknown as Book[];
    }
  },

  async getBookChapters(bookId: string) {
    if (!isSupabaseConfigValid) return [];
    try {
      const { data } = await supabase
        .from("book_chapters")
        .select("*, book_pages(*)")
        .eq("book_id", bookId)
        .order("chapter_number", { ascending: true });

      return data || [];
    } catch (_) {
      return [];
    }
  }
};

export default bookService;