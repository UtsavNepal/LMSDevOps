from datetime import datetime, timedelta, timezone
import logging
from .repositories import TransactionRepository
from .tasks import send_overdue_email

logger = logging.getLogger('Transaction')

class TransactionService:
    def __init__(self):
        self.repository = TransactionRepository()

    def get_all_transactions(self):
        """Fetch all transactions."""
        try:
            logger.info("Fetching all transactions.")
            transactions = self.repository.get_all()
            logger.info(f"Fetched {len(transactions)} transactions.")
            return transactions
        except Exception as e:
            logger.error(f"Error fetching transactions: {str(e)}")
            raise Exception("Failed to fetch transactions.")

    def get_transaction_by_id(self, transaction_id):
        """Fetch a transaction by its ID."""
        try:
            logger.info(f"Fetching transaction with ID: {transaction_id}.")
            transaction = self.repository.get_by_id(transaction_id)
            if transaction:
                logger.info(f"Transaction found: {transaction}.")
            else:
                logger.warning(f"Transaction with ID {transaction_id} not found.")
            return transaction
        except Exception as e:
            logger.error(f"Error fetching transaction: {str(e)}")
            raise Exception("Failed to fetch transaction.")

    def create_transaction(self, data):
        """Create a new transaction."""
        try:
            logger.info(f"Creating transaction with data: {data}.")
            # Set default due date if not provided
            if 'due_date' not in data:
                borrowed_date = data.get('borrowed_date', timezone.now())
                if isinstance(borrowed_date, str):
                    borrowed_date = datetime.strptime(borrowed_date, "%Y-%m-%d")
                    borrowed_date = timezone.make_aware(borrowed_date)
                data['due_date'] = borrowed_date + timedelta(days=14)  # Default due date is 14 days from borrowed_date
            transaction = self.repository.create(data)
            logger.info(f"Transaction created: {transaction}.")
            # Schedule overdue email task
            send_overdue_email.apply_async(args=[transaction.transaction_id], eta=transaction.due_date)
            return transaction
        except Exception as e:
            logger.error(f"Error creating transaction: {str(e)}")
            raise Exception("Failed to create transaction.")

    def update_transaction(self, transaction_id, data):
        """Update an existing transaction."""
        try:
            logger.info(f"Updating transaction with ID: {transaction_id} and data: {data}.")
            transaction = self.repository.update(transaction_id, data)
            if transaction:
                logger.info(f"Transaction updated: {transaction}.")
            else:
                logger.warning(f"Transaction with ID {transaction_id} not found.")
            return transaction
        except Exception as e:
            logger.error(f"Error updating transaction: {str(e)}")
            raise Exception("Failed to update transaction.")

    def delete_transaction(self, transaction_id):
        """Delete a transaction."""
        try:
            logger.info(f"Deleting transaction with ID: {transaction_id}.")
            success = self.repository.delete(transaction_id)
            if success:
                logger.info(f"Transaction with ID {transaction_id} deleted.")
            else:
                logger.warning(f"Transaction with ID {transaction_id} not found.")
            return success
        except Exception as e:
            logger.error(f"Error deleting transaction: {str(e)}")
            raise Exception("Failed to delete transaction.")

    def send_overdue_notification(self, transaction_id):
        """Send an overdue notification for a transaction."""
        try:
            logger.info(f"Sending overdue notification for transaction ID: {transaction_id}.")
            transaction = self.repository.get_by_id(transaction_id)
            if transaction and transaction.is_overdue():
                # Trigger the Celery task to send the email
                send_overdue_email.delay(transaction.transaction_id)
                logger.info(f"Overdue notification sent for transaction ID: {transaction_id}.")
            else:
                logger.warning(f"Transaction ID {transaction_id} is not overdue or not found.")
        except Exception as e:
            logger.error(f"Failed to send overdue notification: {str(e)}")
            raise Exception("Failed to send overdue notification.")

    def get_total_borrowed_books(self):
        """Get the total number of borrowed books."""
        try:
            logger.info("Fetching total borrowed books.")
            count = self.repository.get_total_borrowed_books()
            logger.info(f"Total borrowed books: {count}.")
            return count
        except Exception as e:
            logger.error(f"Error fetching total borrowed books: {str(e)}")
            raise Exception("Failed to fetch total borrowed books.")

    def get_total_returned_books(self):
        """Get the total number of returned books."""
        try:
            logger.info("Fetching total returned books.")
            count = self.repository.get_total_returned_books()
            logger.info(f"Total returned books: {count}.")
            return count
        except Exception as e:
            logger.error(f"Error fetching total returned books: {str(e)}")
            raise Exception("Failed to fetch total returned books.")
        
    
    def get_total_books(self):
        """Get the total number of books."""
        try:
            logger.info("Fetching total books.")
            count = self.repository.get_total_books()
            logger.info(f"Total books: {count}.")
            return count
        except Exception as e:
            logger.error(f"Error fetching total books: {str(e)}")
            raise Exception("Failed to fetch total books.")

    def get_total_students(self):
        """Get the total number of students."""
        try:
            logger.info("Fetching total students.")
            count = self.repository.get_total_students()
            logger.info(f"Total students: {count}.")
            return count
        except Exception as e:
            logger.error(f"Error fetching total students: {str(e)}")
            raise Exception("Failed to fetch total students.")
        
    
    def mark_as_returned(self, transaction_id):
        """Mark a transaction as returned"""
        try:
            transaction = self.repository.get_by_id(transaction_id)
            if transaction:
                transaction.transaction_type = 'return'
                transaction.returned = True
                transaction.returned_date = timezone.now()
                transaction.save()
                return transaction
            return None
        except Exception as e:
            logger.error(f"Error marking transaction as returned: {str(e)}")
            raise Exception("Failed to mark transaction as returned")