"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface OpenLibraryBook {
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  subject?: string[];
  publisher?: string[];
  language?: string[];
  key: string;
}

interface OpenLibraryResponse {
  docs: OpenLibraryBook[];
  numFound: number;
}

export default function OpenLibraryBooksEnhanced() {
  const [books, setBooks] = useState<OpenLibraryBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBook, setSelectedBook] = useState<OpenLibraryBook | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // LocalStorage'dan favorileri yükle
  useEffect(() => {
    const savedFavorites = localStorage.getItem("library-favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Favorileri localStorage'a kaydet
  const toggleFavorite = (title: string) => {
    const newFavorites = favorites.includes(title)
      ? favorites.filter(fav => fav !== title)
      : [...favorites, title];
    
    setFavorites(newFavorites);
    localStorage.setItem("library-favorites", JSON.stringify(newFavorites));
  };

  // Tüm kategorileri al
  const getAllCategories = () => {
    const allSubjects = books.flatMap(book => book.subject || []);
    const uniqueSubjects = Array.from(new Set(allSubjects))
      .filter(subject => subject && subject.length > 2 && subject.length < 30)
      .sort();
    return uniqueSubjects.slice(0, 20); // İlk 20 kategori
  };

  // Kitapları filtrele ve sırala
  const filteredBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author_name?.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || 
        book.subject?.some(subject => subject === selectedCategory);
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "author":
          const authorA = a.author_name?.[0] || "";
          const authorB = b.author_name?.[0] || "";
          return authorA.localeCompare(authorB);
        case "year":
          return (b.first_publish_year || 0) - (a.first_publish_year || 0);
        case "favorites":
          const aFav = favorites.includes(a.title);
          const bFav = favorites.includes(b.title);
          if (aFav && !bFav) return -1;
          if (!aFav && bFav) return 1;
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Kitap kapak URL'si oluştur
  const getCoverUrl = (book: OpenLibraryBook) => {
    if (book.cover_i) {
      return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    }
    return null;
  };

  // OpenLibrary API'den kitap ara
  const searchBooks = async (query: string = "javascript") => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<OpenLibraryResponse>(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=50&fields=title,author_name,first_publish_year,cover_i,isbn,subject,publisher,language,key`
      );
      
      if (response.data.docs.length === 0) {
        setError("Hiç kitap bulunamadı. Farklı bir arama terimi deneyin.");
      } else {
        setBooks(response.data.docs);
      }
    } catch (err) {
      setError("Kitaplar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde varsayılan arama yap
  useEffect(() => {
    searchBooks();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Başlık */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-2">
          📚 Kütüphane Koleksiyonu
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          OpenLibrary'den binlerce kitabı keşfedin
        </p>
      </div>

      {/* Arama ve Filtreler */}
      <div className="mb-8 space-y-4">
        {/* Arama Çubuğu */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Kitap adı, yazar adı ile arayın..."
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="px-8 py-4 bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-xl hover:from-violet-600 hover:to-blue-600 transition-all font-medium shadow-lg hover:shadow-xl"
            onClick={() => searchBooks(searchTerm || "javascript")}
            disabled={loading}
          >
            {loading ? "🔍 Arıyor..." : "🔍 Ara"}
          </button>
        </div>

        {/* Sıralama ve Kategori Filtreleri */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sıralama
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="title">Alfabetik (A-Z)</option>
              <option value="author">Yazara Göre</option>
              <option value="year">Yıla Göre (Yeni-Eski)</option>
              <option value="favorites">Favoriler Önce</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="all">Tüm Kategoriler</option>
              {getAllCategories().map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Aktif Filtreler */}
        {(searchTerm || selectedCategory !== "all") && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Aktif filtreler:</span>
            {searchTerm && (
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Arama: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Kategori: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="hover:bg-violet-200 dark:hover:bg-violet-800 rounded-full p-0.5"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Kitaplar yükleniyor...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
        </div>
      )}

      {/* Sonuç sayısı */}
      {!loading && !error && books.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600 dark:text-gray-400">
            <span className="font-medium text-violet-600 dark:text-violet-400">
              {filteredBooks.length}
            </span>{" "}
            {filteredBooks.length === 1 ? "kitap" : "kitap"} bulundu
            {books.length !== filteredBooks.length && (
              <span className="text-gray-500">
                {" "}(toplam {books.length} kitaptan)
              </span>
            )}
          </div>
          
          {/* Hızlı kategori butonları */}
          <div className="hidden md:flex gap-2">
            {getAllCategories().slice(0, 4).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? "all" : category)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedCategory === category
                    ? "bg-violet-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-violet-100 dark:hover:bg-violet-900/30"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
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
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 overflow-hidden group cursor-pointer flex flex-col h-full"
              onClick={() => setSelectedBook(book)}
            >
              {/* Kitap Kapağı */}
              <div className="relative h-80 bg-gradient-to-br from-violet-100 to-blue-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden flex-shrink-0">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex flex-col items-center justify-center h-full p-4">
                            <div class="text-4xl text-violet-400 mb-2">📚</div>
                            <div class="text-xs text-center text-gray-600 dark:text-gray-400 line-clamp-3 font-medium">
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
                    <div className="text-xs text-center text-gray-600 dark:text-gray-400 line-clamp-3 font-medium">
                      {book.title}
                    </div>
                  </div>
                )}
                
                {/* Favori Butonu */}
                <button
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                    isFavorite 
                      ? "bg-red-500/80 text-white" 
                      : "bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400"
                  } hover:scale-110`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(book.title);
                  }}
                >
                  {isFavorite ? "❤️" : "🤍"}
                </button>

                {/* Yıl Badge */}
                {book.first_publish_year && (
                  <div className="absolute bottom-3 left-3 bg-violet-500/80 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    {book.first_publish_year}
                  </div>
                )}
              </div>

              {/* Kitap Bilgileri */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2 h-10 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors flex items-start">
                  {book.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-1 mb-3 h-4">
                  {book.author_name ? book.author_name.join(", ") : "Bilinmeyen Yazar"}
                </p>

                {/* Konular */}
                <div className="mb-3 h-6 flex flex-wrap gap-1">
                  {book.subject && book.subject.length > 0 && (
                    <>
                      {book.subject.slice(0, 2).map((subject, idx) => (
                        <span
                          key={idx}
                          className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-1 rounded-full text-xs h-6 flex items-center"
                        >
                          {subject.length > 12 ? subject.substring(0, 12) + "..." : subject}
                        </span>
                      ))}
                    </>
                  )}
                </div>

                {/* Detay Butonu - flexbox ile en alta sabitlenir */}
                <div className="mt-auto">
                  <button className="w-full bg-gradient-to-r from-violet-500 to-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-violet-600 hover:to-blue-600 transition-all transform hover:scale-105">
                    📖 Detayları Gör
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Boş Durum */}
      {!loading && !error && filteredBooks.length === 0 && books.length > 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            Hiç kitap bulunamadı
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Arama kriterlerinize uygun kitap bulunamadı.
          </p>
          <div className="flex justify-center gap-3">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Aramayı Temizle
              </button>
            )}
            {selectedCategory !== "all" && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Kategori Filtresini Kaldır
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center rounded-t-2xl">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📖 Kitap Detayları</h1>
              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                onClick={() => setSelectedBook(null)}
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>
            
            <div className="p-6 flex flex-col lg:flex-row gap-8">
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