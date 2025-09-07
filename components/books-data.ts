// Kitap veri modeli ve örnek veri
export type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  category: string;
  description: string;
  coverUrl?: string;
  isFavorite?: boolean;
  status?: "okundu" | "okunacak";
  rating?: number;
  comments?: { user: string; text: string; date: string }[];
};

export const books: Book[] = [
  {
    id: "1",
    title: "Kürk Mantolu Madonna",
    author: "Sabahattin Ali",
    year: 1943,
    category: "Roman",
    description: "Bir aşk hikayesini anlatan klasik roman.",
    coverUrl: "",
    isFavorite: false,
    status: "okunacak",
    rating: 5,
    comments: [],
  },
  {
    id: "2",
    title: "Suç ve Ceza",
    author: "Fyodor Dostoyevski",
    year: 1866,
    category: "Klasik",
    description: "Bir adamın suç ve vicdan azabı ile mücadelesi.",
    coverUrl: "",
    isFavorite: false,
    status: "okundu",
    rating: 4,
    comments: [],
  },
];
