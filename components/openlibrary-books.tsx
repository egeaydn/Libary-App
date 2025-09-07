"use client";
import React, { useEffect, useState } from "react";

type OpenLibraryBook = {
  title: string;
  author_name?: string[];
  first_publish_year?: number;
};

export default function OpenLibraryBooks() {
  const [books, setBooks] = useState<OpenLibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<OpenLibraryBook | null>(
    null,
  );

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
            })),
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Kitaplar alınamadı.");
        setLoading(false);
      });
  }, []);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      (book.author_name &&
        book.author_name
          .join(", ")
          .toLowerCase()
          .includes(search.toLowerCase())),
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        OpenLibrary - Okumak İstenilen Kitaplar
      </h1>

      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Kitap adı veya yazar ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-violet-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-violet-400 dark:bg-gray-900 dark:text-white"
        />
      </div>

      {loading && <p className="text-center">Yükleniyor...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {filteredBooks.map((book, i) => (
          <button
            key={i}
            className="relative group bg-gradient-to-br from-violet-200 via-white to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border border-violet-300 dark:border-gray-700 rounded-2xl shadow-xl p-6 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-violet-500 animate-fade-in text-left"
            style={{ minHeight: 220 }}
            onClick={() => setSelectedBook(book)}
          >
            <div className="absolute -top-8 -right-8 opacity-10 text-[8rem] pointer-events-none select-none">
              📚
            </div>
            <h2 className="text-xl font-bold mb-2 text-violet-700 dark:text-violet-300 group-hover:text-violet-900 transition-colors duration-200">
              {book.title}
            </h2>
            <p className="text-gray-700 dark:text-gray-200 mb-1">
              <span className="font-semibold">Yazar:</span>{" "}
              {book.author_name ? book.author_name.join(", ") : "Bilinmiyor"}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              <span className="font-semibold">İlk Yayın Yılı:</span>{" "}
              {book.first_publish_year || "Bilinmiyor"}
            </p>
            <div className="absolute bottom-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="inline-block px-3 py-1 bg-violet-600 text-white text-xs rounded-full shadow-lg animate-bounce">
                Detay
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-violet-600 text-2xl"
              onClick={() => setSelectedBook(null)}
              aria-label="Kapat"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-2 text-violet-700 dark:text-violet-300">
              {selectedBook.title}
            </h2>
            <p className="mb-1">
              <span className="font-semibold">Yazar:</span>{" "}
              {selectedBook.author_name
                ? selectedBook.author_name.join(", ")
                : "Bilinmiyor"}
            </p>
            <p className="mb-1">
              <span className="font-semibold">İlk Yayın Yılı:</span>{" "}
              {selectedBook.first_publish_year || "Bilinmiyor"}
            </p>
            <p className="mt-4 text-gray-500 dark:text-gray-300">
              Daha fazla bilgi için OpenLibrary sitesini ziyaret edebilirsiniz.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
