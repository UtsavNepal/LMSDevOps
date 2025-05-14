export interface Book {
    BookId: number;
    Title: string;
    author: number; // Foreign key to Author
    Genre: string;
    ISBN: string;
    Quantity: number;
  }