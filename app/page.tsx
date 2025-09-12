import OpenLibraryBooks from "../components/openlibrary-books-enhanced";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <OpenLibraryBooks />
    </main>
  );
}
