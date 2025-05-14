import { BaseRepository } from "../../Services/base/BaseRepository";
import { Transaction } from "../../domain/Transaction.Entity";

export class TransactionRepository extends BaseRepository<Transaction> {
  constructor() {
    super("api/transactions"); 
  }
}