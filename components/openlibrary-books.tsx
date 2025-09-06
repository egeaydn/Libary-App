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
            }))
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Kitaplar alınamadı.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full max-w-2xl grid gap-4 mx-auto">
      <h1 className="text-3xl font-bold mb-4">OpenLibrary - Okumak İstenilen Kitaplar</h1>
      {loading && <p>Yükleniyor...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {books.map((book, i) => (
        <div key={i} className="border rounded p-4 bg-white dark:bg-gray-800 shadow">
          <h2 className="text-xl font-semibold">{book.title}</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Yazar: {book.author_name ? book.author_name.join(", ") : "Bilinmiyor"}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            İlk Yayın Yılı: {book.first_publish_year || "Bilinmiyor"}
          </p>
        </div>
      ))}
    </div>
  );
}
