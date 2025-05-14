import { BaseRepository } from "../../Services/base/BaseRepository";
import { Student } from "../../domain/Student";

export class StudentRepository extends BaseRepository<Student> {
  constructor() {
    super("api/students"); 
  }
}