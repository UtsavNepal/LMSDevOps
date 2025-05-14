import logging
from django.core.exceptions import ObjectDoesNotExist

from Book.models import Book
from Student.models import Student
from .models import Transaction

logger = logging.getLogger('Transaction')
class TransactionRepository:
    def get_all(self):
        """Fetch all transactions."""
        return Transaction.objects.all()

    def get_by_id(self, transaction_id):
        """Fetch a transaction by its ID."""
        try:
            return Transaction.objects.get(transaction_id=transaction_id)
        except ObjectDoesNotExist:
            return None

    def create(self, data):
        """Create a new transaction."""
        return Transaction.objects.create(**data)

    def update(self, transaction_id, data):
        """Update an existing transaction."""
        transaction = self.get_by_id(transaction_id)
        if transaction:
            for key, value in data.items():
                setattr(transaction, key, value)
            transaction.save()
            return transaction
        return None

    def delete(self, transaction_id):
        """Delete a transaction."""
        transaction = self.get_by_id(transaction_id)
        if transaction:
            transaction.delete()
            return True
        return False

    @staticmethod
    def get_total_borrowed_books():
        """Get the total number of borrowed books."""
        return Transaction.objects.filter(transaction_type='borrow').count()

    @staticmethod
    def get_total_returned_books():
        """Get the total number of returned books."""
        return Transaction.objects.filter(transaction_type='return').count()

    @staticmethod
    def get_existing_transaction(book_id, student_id):
        """Check if the book is already borrowed or returned by the student."""
        return Transaction.objects.filter(book_id=book_id, student_id=student_id).first()
    
    @staticmethod
    def get_total_books():
        """Get the total number of books."""
        return Book.objects.count()

    @staticmethod
    def get_total_students():
        """Get the total number of students."""
        return Student.objects.count()
    
    