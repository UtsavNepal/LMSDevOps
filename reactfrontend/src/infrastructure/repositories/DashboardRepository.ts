import { AxiosRequestConfig } from "axios";
import { BaseRepository } from "../../Services/base/BaseRepository";

interface BookSummaryResponse {
  total_borrowed_books: number;
  total_returned_books: number;
  total_books: number;
  total_students: number;
}

interface OverdueBorrower {
  transaction_id: number;
  student_name: string;
}

export class DashboardRepository extends BaseRepository<any> {
  constructor() {
    super("/api");
  }

  async getBookSummary(config?: AxiosRequestConfig): Promise<BookSummaryResponse> {
    return this.get<BookSummaryResponse>("/book-summary/", config);
  }

  async getOverdueBorrowers(config?: AxiosRequestConfig): Promise<OverdueBorrower[]> {
    const response = await this.get<any[]>("/overdue-emails/", config);
    return response.map((borrower) => ({
      transaction_id: borrower.transaction_id,
      student_name: borrower.student_name,
    }));
  }

  async sendOverdueNotifications(): Promise<{ message: string }> {
    return this.post<{ message: string }>("/overdue-emails/");
  }
}