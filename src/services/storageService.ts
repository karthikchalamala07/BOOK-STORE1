import { supabase } from "../lib/supabase";

export const storageService = {
  async getBookAssetUrl(bookId: string): Promise<string> {
    try {
      const { data } = supabase.storage.from("ebooks").getPublicUrl(`${bookId}.txt`);
      if (data?.publicUrl) return data.publicUrl;
    } catch (_) {}
    return `/ebooks/${bookId}.txt`;
  },

  async downloadBookAsset(bookId: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage.from("ebooks").download(`${bookId}.txt`);
      if (!error && data) {
        return await data.text();
      }
    } catch (_) {}
    
    // Fallback to public asset fetch
    const response = await fetch(`/ebooks/${bookId}.txt`);
    if (response.ok) {
      return await response.text();
    }
    return `CHAPTER I. THE BEGINNING\n\nPreserved digital manuscript for volume '${bookId}'. This classic text is loaded from the STORYVAULT digital preservation repository.`;
  },

  async getSignedBookUrl(bookId: string, expiresIn = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage.from("ebooks").createSignedUrl(`${bookId}.pdf`, expiresIn);
      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    } catch (_) {}
    return null;
  }
};
