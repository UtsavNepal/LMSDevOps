import { BaseRepository } from "../../Services/base/BaseRepository";
import { Book } from "../../domain/BookEntities";

export class BookRepository extends BaseRepository<Book> {
  constructor() {
    super("api/books"); 
  }
}