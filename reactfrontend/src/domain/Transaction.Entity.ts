export interface Transaction {
  transaction_id: number;
  student: number;
  user: number;
  book: number;
  transaction_type: 'borrow' | 'return';
  borrowed_date: string;
  due_date: string;
  student_name?: string; 
  librarian_name?: string; 
  book_name?: string; 
}