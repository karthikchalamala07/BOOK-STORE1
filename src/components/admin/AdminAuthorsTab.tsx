import React from "react";
import { Users, BookOpen } from "lucide-react";

export default function AdminAuthorsTab() {
  const classicAuthors = [
    { name: "Bram Stoker", era: "Victorian Gothic", count: 3, bio: "Irish author best known for Dracula." },
    { name: "Jane Austen", era: "Regency Romance", count: 6, bio: "English novelist known for Pride and Prejudice." },
    { name: "Arthur Conan Doyle", era: "Victorian Mystery", count: 8, bio: "Creator of Sherlock Holmes." },
    { name: "Alexandre Dumas", era: "French Romanticism", count: 4, bio: "Author of The Count of Monte Cristo." }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classicAuthors.map(author => (
          <div key={author.name} className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#C9A227]/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-serif text-lg text-[#F8F6F2] font-semibold">{author.name}</h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C9A227]/15 text-[#C9A227] border border-[#C9A227]/30">
                {author.era}
              </span>
            </div>
            <p className="text-xs text-[#A5A5A5] mb-3">{author.bio}</p>
            <div className="flex items-center gap-2 text-xs font-mono text-[#C9A227]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{author.count} Preserved Manuscripts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}