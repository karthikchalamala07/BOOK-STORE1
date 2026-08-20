export interface Chapter {
  title: string;
  content: string[]; // paragraphs
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  language: string;
  coverUrl: string;
  description: string;
  quote: string;
  chapters?: Chapter[];
  openLibraryKey?: string;
  gutenbergId?: string;
  previewContent?: Chapter[];
  fullBookPath?: string;
  totalPages?: number;
  price?: number;
  stock?: number;
  rating?: number;
  featured?: boolean;
  isFeatured?: boolean;
  coverImage?: string;
  discount?: number;
  isAvailable?: boolean;
}

export interface ReadingState {
  chapterIndex?: number;
  pageIndex?: number;
  bookId: string;
  currentChapterIndex: number;
  currentPageIndex: number;
  lastReadTime: number;
}

export interface Author {
  id: string;
  name: string;
  portrait: string;
  birthYear: number;
  deathYear: number | null;
  nationality: string;
  biography: string;
  booksWritten: number;
  featuredBooks: string[];
  socialLinks?: {
    wikipedia?: string;
    goodreads?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  year: number;
  title: string;
  author: string;
  description: string;
  bookId: string;
}