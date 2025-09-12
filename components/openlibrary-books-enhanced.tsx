"use client";
import React, { useEffect, useState } from "react";

type OpenLibraryBook = {
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  subject?: string[];
  isbn?: string[];
  cover_i?: number;
};

export default function OpenLibraryBooks() {
  const [books, setBooks] = useState<OpenLibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<OpenLibraryBook | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"title" | "year" | "author">("title");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetch("https://openlibrary.org/people/mekBot/books/want-to-read.json")
      .then((res) => res.json())
      .then((data) => {
        if (data.reading_log_entries) {
          setBooks(
            data.reading_log_entries.map((entry: any) => ({
              title: entry.work.title,
              author_name: entry.work.author_names,
              first_publish_year: entry.work.first_publish_year,
              subject: entry.work.subject,
              isbn: entry.work.isbn,
              cover_i: entry.work.cover_id,
            })),
          );
        }
        setLoading(false);
      })
      .catch((_err) => {
        setError("Kitaplar alınamadı.");
        setLoading(false);
      });
  }, []);

  // Tüm kategorileri çıkar
  const getAllCategories = () => {
    const categories = new Set<string>();
    books.forEach((book) => {
      if (book.subject && book.subject.length > 0) {
        book.subject.forEach((subj) => {
          // Kategoriyi temizle ve normalize et
          const cleanCategory = subj.trim().toLowerCase();
          if (cleanCategory.length > 0 && cleanCategory.length < 30) {
            categories.add(subj.trim());
          }
        });
      }
    });
    return Array.from(categories).sort();
  };

  const filteredBooks = books
    .filter((book) => {
      // Arama filtresi
      const searchMatch = 
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        (book.author_name &&
          book.author_name
            .join(", ")
            .toLowerCase()
            .includes(search.toLowerCase()));
      
      // Kategori filtresi
      const categoryMatch = 
        selectedCategory === "all" ||
        (book.subject && book.subject.some(subj => subj.trim() === selectedCategory));
      
      return searchMatch && categoryMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "year":
          return (b.first_publish_year || 0) - (a.first_publish_year || 0);
        case "author":
          return (a.author_name?.[0] || "").localeCompare(
            b.author_name?.[0] || "",
          );
        default:
          return a.title.localeCompare(b.title);
      }
    });

  const toggleFavorite = (title: string) => {
    setFavorites((prev) =>
      prev.includes(title)
        ? prev.filter((fav) => fav !== title)
        : [...prev, title],
    );
  };

  const getCoverUrl = (book: OpenLibraryBook) => {
    if (book.cover_i) {
      return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    }
    return null;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-4">
          📚 Kitap Koleksiyonu
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          OpenLibrary'den seçkin kitapları keşfedin
        </p>
      </div>

      {/* Arama ve Filtreleme */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-violet-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Kitap adı veya yazar ara..."
              type="text"
              value={search}
            />
          </div>
          <select
            className="px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-violet-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400"
            onChange={(e) => setSortBy(e.target.value as "title" | "year" | "author")}
            value={sortBy}
          >
            <option value="title">📖 İsme göre</option>
            <option value="year">📅 Yıla göre</option>
            <option value="author">✍️ Yazara göre</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
        </div>
      )}

      {/* Kitap Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredBooks.map((book, i) => {
          const isFavorite = favorites.includes(book.title);
          const coverUrl = getCoverUrl(book);

          return (
            <div
              key={i}
              className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 max-w-sm mx-auto"
            >
              {/* Kitap Kapağı */}
              <div className="relative h-56 bg-gradient-to-br from-violet-100 to-blue-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                {coverUrl ? (
                  <img
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    src={coverUrl}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex flex-col items-center justify-center h-full p-4">
                            <div class="text-4xl text-violet-400 mb-2">📚</div>
                            <div class="text-xs text-center text-gray-600 dark:text-gray-400 line-clamp-2 font-medium">
                              ${book.title}
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="text-4xl text-violet-400 mb-2">📚</div>
                    <div className="text-xs text-center text-gray-600 dark:text-gray-400 line-clamp-2 font-medium">
                      {book.title}
                    </div>
                  </div>
                )}
                
                {/* Favori Butonu */}
                <button
                  className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                    isFavorite
                      ? "bg-red-500 text-white"
                      : "bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(book.title);
                  }}
                >
                  {isFavorite ? "❤️" : "🤍"}
                </button>

                {/* Yıl Badge */}
                {book.first_publish_year && (
                  <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {book.first_publish_year}
                  </div>
                )}
              </div>

              {/* Kitap Bilgileri */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                  {book.title}
                </h3>
                
                <p className="text-violet-600 dark:text-violet-400 font-medium mb-2 line-clamp-1">
                  {book.author_name ? book.author_name.join(", ") : "Bilinmeyen Yazar"}
                </p>

                {book.subject && book.subject.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {book.subject.slice(0, 2).map((subj, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-1 rounded-full"
                      >
                        {subj}
                      </span>
                    ))}
                  </div>
                )}

                {/* Detay Butonu */}
                <button
                  className="w-full mt-3 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white py-2 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                  onClick={() => setSelectedBook(book)}
                >
                  📖 Detayları Gör
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBooks.length === 0 && !loading && !error && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Hiçbir kitap bulunamadı
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Arama kriterlerinizi değiştirmeyi deneyin
          </p>
        </div>
      )}

      {/* Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              onClick={() => setSelectedBook(null)}
            >
              ✕
            </button>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Kitap Kapağı */}
              <div className="flex-shrink-0">
                <div className="relative w-48 h-72 bg-gradient-to-br from-violet-100 to-blue-100 dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-hidden shadow-xl">
                  {getCoverUrl(selectedBook) ? (
                    <img
                      alt={selectedBook.title}
                      className="w-full h-full object-cover"
                      src={getCoverUrl(selectedBook)!}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex flex-col items-center justify-center h-full p-6">
                              <div class="text-6xl text-violet-400 mb-4">📚</div>
                              <div class="text-sm text-center text-gray-600 dark:text-gray-400 line-clamp-3 font-medium">
                                ${selectedBook.title}
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6">
                      <div className="text-6xl text-violet-400 mb-4">📚</div>
                      <div className="text-sm text-center text-gray-600 dark:text-gray-400 line-clamp-3 font-medium">
                        {selectedBook.title}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Kitap Detayları */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedBook.title}
                </h2>
                
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p>
                    <span className="font-semibold text-violet-600 dark:text-violet-400">✍️ Yazar:</span>{" "}
                    {selectedBook.author_name ? selectedBook.author_name.join(", ") : "Bilinmeyen"}
                  </p>
                  
                  <p>
                    <span className="font-semibold text-violet-600 dark:text-violet-400">📅 İlk Yayın:</span>{" "}
                    {selectedBook.first_publish_year || "Bilinmiyor"}
                  </p>

                  {selectedBook.subject && selectedBook.subject.length > 0 && (
                    <div>
                      <span className="font-semibold text-violet-600 dark:text-violet-400">🏷️ Konular:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedBook.subject.slice(0, 6).map((subj, idx) => (
                          <span
                            key={idx}
                            className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full text-sm"
                          >
                            {subj}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      favorites.includes(selectedBook.title)
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white"
                    }`}
                    onClick={() => toggleFavorite(selectedBook.title)}
                  >
                    {favorites.includes(selectedBook.title) ? "❤️ Favorilerden Çıkar" : "🤍 Favorilere Ekle"}
                  </button>
                  
                  <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-all">
                    🔗 OpenLibrary'de Aç
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}