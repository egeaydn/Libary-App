"use client";
import React, { useState } from "react";
import axios from "axios";

interface Book {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string;
  description: string;
}

const BookSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchBooks = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
      );
      const items = res.data.items || [];
      const booksData = items.map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || [],
        thumbnail: item.volumeInfo.imageLinks?.thumbnail || "",
        description: item.volumeInfo.description || "Açıklama yok."
      }));
      setBooks(booksData);
    } catch (err) {
      setError("Kitaplar alınırken hata oluştu.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={searchBooks} className="flex gap-2 mb-6">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Kitap ara..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          Ara
        </button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div>Yükleniyor...</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.map(book => (
          <div key={book.id} className="border rounded-lg p-4 flex gap-4 bg-white shadow">
            {book.thumbnail && (
              <img src={book.thumbnail} alt={book.title} className="w-24 h-32 object-cover rounded" />
            )}
            <div>
              <h3 className="font-bold text-lg mb-1">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{book.authors.join(", ")}</p>
              <p className="text-xs text-gray-700 line-clamp-3">{book.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookSearch;
