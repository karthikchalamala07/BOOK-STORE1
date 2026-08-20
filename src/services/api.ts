import { Book, Chapter } from "../types";
import { resolveBookCover } from "./coverService";
import { CLASSICS_DATABASE } from "./booksDb";

// Cache maps for API request throttling and memory lookups
const gutenbergCache: Record<string, Chapter[]> = {};
const openLibraryCache: Record<string, Book[]> = {};

export function parseGutenbergText(text: string, title: string = "", author: string = ""): Chapter[] {
  const chapters: Chapter[] = [];
  const lines = text.split('\n');
  let currentChapterTitle = "Chapter I: Opening";
  let currentChapterParagraphs: string[] = [];
  let started = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes("*** START OF THIS PROJECT GUTENBERG EBOOK") || line.includes("*** START OF THE PROJECT GUTENBERG EBOOK")) {
      started = true;
      continue;
    }
    
    if (line.includes("*** END OF THIS PROJECT GUTENBERG EBOOK") || line.includes("*** END OF THE PROJECT GUTENBERG EBOOK")) {
      break;
    }
    
    if (!started) continue;
    
    const isChapterHeader = /^(CHAPTER|Chapter|ACT|Act|PROLOGUE|Prologue|SECTION|Section)\s+([IVXLCDM\d]+|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN)/i.test(line);
    
    if (isChapterHeader) {
      if (currentChapterParagraphs.length > 0) {
        chapters.push({
          title: currentChapterTitle,
          content: [...currentChapterParagraphs]
        });
      }
      currentChapterTitle = line;
      currentChapterParagraphs = [];
    } else if (line.length > 0) {
      if (currentChapterParagraphs.length === 0) {
        currentChapterParagraphs.push(line);
      } else {
        const lastIdx = currentChapterParagraphs.length - 1;
        if (currentChapterParagraphs[lastIdx].length > 40 && !currentChapterParagraphs[lastIdx].endsWith('.')) {
          currentChapterParagraphs[lastIdx] += " " + line;
        } else {
          currentChapterParagraphs.push(line);
        }
      }
    }
  }
  
  if (currentChapterParagraphs.length > 0) {
    chapters.push({
      title: currentChapterTitle,
      content: currentChapterParagraphs
    });
  }
  
  if (chapters.length === 0) {
    const blocks: string[] = [];
    let temp = "";
    for (const l of lines) {
      const trimmed = l.trim();
      if (trimmed.length > 0) {
        temp += " " + trimmed;
        if (temp.length > 300) {
          blocks.push(temp.trim());
          temp = "";
        }
      }
    }
    if (temp.length > 0) blocks.push(temp.trim());
    
    chapters.push({
      title: "Volume Content",
      content: blocks.slice(0, 150)
    });
  }
  
  return chapters;
}

export async function fetchGutenbergBook(gutenbergId: string, title: string, author: string): Promise<Chapter[]> {
  const cacheKey = `${gutenbergId}`;
  
  // Cache Hit
  if (gutenbergCache[cacheKey]) {

    return gutenbergCache[cacheKey];
  }

  try {
    const url = `https://corsproxy.io/?https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Gutenberg mirror failed");
    const text = await response.text();
    const parsed = parseGutenbergText(text, title, author);
    
    // Store in cache
    gutenbergCache[cacheKey] = parsed;
    return parsed;
  } catch (error) {
    console.warn("CORS/Fetch error on Gutenberg. Using high-fidelity custom fallback layout.", error);
    const local = CLASSICS_DATABASE.find(b => b.gutenbergId === gutenbergId || b.id === gutenbergId);
    if (local) return local.chapters || [];
    
    return [
      {
        title: "Chapter I: The Sanctuary Reading",
        content: [
          `You are reading a dynamically loaded volume of "${title}" by ${author}.`,
          "Due to network/CORS restrictions from Project Gutenberg servers, we have initialized this reading screen.",
          "Our interactive museum of literature renders public domain texts. Feel free to browse pre-loaded classics like Dracula, Frankenstein, Pride & Prejudice, and Alice in Wonderland which are fully available offline in complete chapters.",
          "Classic literature explores universal human experiences—gothic romance, science fiction, philosophy, and strategies—retaining cultural resonance across centuries."
        ]
      }
    ];
  }
}

export async function searchOpenLibrary(query: string): Promise<Book[]> {
  const cacheKey = query.trim().toLowerCase();
  if (!cacheKey) return [];

  // Cache Hit
  if (openLibraryCache[cacheKey]) {
    
    return openLibraryCache[cacheKey];
  }

  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12`;
    const response = await fetch(url);
    const data = await response.json();
    
    const results: Book[] = [];
    
    for (const doc of data.docs || []) {
      if (!doc.title || !doc.author_name) continue;
      
      const author = doc.author_name[0];
      const year = doc.first_publish_year || 1880;
      const key = doc.key.replace("/works/", "");
      
      let gutenbergId = undefined;
      if (doc.ia && doc.ia.length > 0) {
        const gut = doc.ia.find((id: string) => id.startsWith("gutenberg"));
        if (gut) {
          gutenbergId = gut.replace("gutenberg:", "");
        }
      }
      
      if (!gutenbergId) {
        const titleLower = doc.title.toLowerCase();
        if (titleLower.includes("dracula")) gutenbergId = "345";
        else if (titleLower.includes("prejudice")) gutenbergId = "1342";
        else if (titleLower.includes("sherlock")) gutenbergId = "1661";
        else if (titleLower.includes("alice")) gutenbergId = "11";
        else if (titleLower.includes("frankenstein")) gutenbergId = "84";
        else if (titleLower.includes("art of war")) gutenbergId = "132";
      }
      
      const newBook: Book = {
        id: `ol-${key}`,
        title: doc.title,
        author: author,
        genre: doc.subject ? doc.subject[0] : "Classic Literature",
        year: year,
        language: doc.language ? doc.language[0]?.toUpperCase() : "EN",
        coverUrl: doc.cover_i 
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          : "",
        description: `A celebrated public-domain classic written by ${author}, first published in ${year}. Captured here inside STORYVAULT's literary archives.`,
        quote: `A classic work of genius by ${author}.`,
        gutenbergId: gutenbergId,
        openLibraryKey: key,
        chapters: [
          {
            title: "Chapter I: Introduction",
            content: [
              `Welcome to "${doc.title}" by ${author}.`,
              "Clicking 'Read' will load the digital transcript directly from the Open Library and Gutenberg public domain archives.",
              "If the text is unavailable due to CORS limits, STORYVAULT provides stylized editorial summaries for your viewing pleasure."
            ]
          }
        ]
      };
      newBook.coverUrl = resolveBookCover(newBook);
      results.push(newBook);
    }
    
    // Store in cache
    openLibraryCache[cacheKey] = results;
    return results;
  } catch (error) {
    console.error("OpenLibrary search failed", error);
    return [];
  }
}
