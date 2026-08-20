import React, { useState, useMemo } from "react";
import { Book } from "../../types";
import { Search, Plus, Edit2, Trash2, Star, CheckCircle, Package } from "lucide-react";

interface AdminBooksTabProps {
  books: Book[];
  onAddBook?: () => void;
  onEditBook?: (book: Book) => void;
  onDeleteBook?: (bookId: string) => void;
}

export default function AdminBooksTab({ books, onAddBook, onEditBook, onDeleteBook }: AdminBooksTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const genres = useMemo(() => {
    const set = new Set<string>();
    books.forEach(b => { if (b.genre) set.add(b.genre); });
    return ["All", ...Array.from(set)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchesSearch =
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === "All" || b.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [books, searchQuery, selectedGenre]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#A5A5A5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search preserved titles or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg pl-9 pr-4 py-2 text-sm text-[#F8F6F2] focus:outline-none focus:border-[#C9A227]"
            />
          </div>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-xs text-[#F8F6F2] focus:outline-none focus:border-[#C9A227]"
          >
            {genres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {onAddBook && (
          <button
            onClick={onAddBook}
            className="flex items-center gap-2 px-4 py-2 bg-[#C9A227] text-[#0D0D0D] font-medium text-xs rounded-lg hover:bg-[#b08d20] transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Preserve New Book
          </button>
        )}
      </div>

      {/* Books Table */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F8F6F2]">
            <thead className="bg-[#1A1A1A] border-b border-[#2A2A2A] font-mono text-[#A5A5A5] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Book Details</th>
                <th className="py-3 px-4">Genre</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232323]">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-[#1A1A1A]/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={book.coverUrl || book.coverImage}
                        alt={book.title}
                        loading="lazy"
                        className="w-9 h-12 object-cover rounded shadow-md border border-[#333]"
                      />
                      <div>
                        <p className="font-serif font-medium text-sm text-[#F8F6F2]">{book.title}</p>
                        <p className="text-[#A5A5A5] text-xs">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#A5A5A5]">{book.genre || "Classic"}</td>
                  <td className="py-3 px-4 font-mono text-[#C9A227]">${(book.price || 9.99).toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono">{book.stock ?? 50} units</td>
                  <td className="py-3 px-4">
                    {book.featured || book.isFeatured ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#C9A227]/15 text-[#C9A227] border border-[#C9A227]/30">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">
                        Preserved
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEditBook && (
                        <button
                          onClick={() => onEditBook(book)}
                          className="p-1.5 hover:bg-[#2A2A2A] rounded text-[#A5A5A5] hover:text-[#C9A227] transition-colors"
                          title="Edit Preservation Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteBook && (
                        <button
                          onClick={() => onDeleteBook(book.id)}
                          className="p-1.5 hover:bg-red-950/40 rounded text-[#A5A5A5] hover:text-red-400 transition-colors"
                          title="Remove Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#A5A5A5] font-serif">
                    No preserved titles found matching your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}