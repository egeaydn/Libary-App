import { books } from "../components/books-data";

export default function BookList() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Kitaplar</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className="border rounded-lg p-4 shadow bg-white dark:bg-gray-800"
          >
            <h2 className="text-xl font-semibold">{book.title}</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Yazar: {book.author}
            </p>
            <p className="text-gray-500 dark:text-gray-400">Yıl: {book.year}</p>
            <p className="text-sm mt-2">{book.description}</p>
            <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {book.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
