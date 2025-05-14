import { BaseRepository } from "../../Services/base/BaseRepository";
import { Author } from "../../domain/Author";

export class AuthorRepository extends BaseRepository<Author> {
  constructor() {
    super("api/authors"); // Base URL for the author API
  }
}