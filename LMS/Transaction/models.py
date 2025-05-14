from django.db import models
from django.utils import timezone
from datetime import timedelta

from Auth.models import User
from Book.models import Book
from Student.models import Student

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('borrow', 'Borrow'),
        ('return', 'Return'),
    ]

    transaction_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="transactions")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions")  # Librarian
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="transactions")
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    borrowed_date = models.DateTimeField(default=timezone.now)  # Automatically set to current time
    due_date = models.DateTimeField() 
    notification_sent = models.BooleanField(default=False)
    returned = models.BooleanField(default=False)  # New field
    returned_date = models.DateTimeField(null=True, blank=True)
    

    student_name = models.CharField(max_length=255)
    librarian_name = models.CharField(max_length=255)
    book_name = models.CharField(max_length=255)

    def is_overdue(self):
        if self.due_date is None: 
            return False
        return not self.returned and timezone.now() > self.due_date

    def save(self, *args, **kwargs):
        if not self.due_date:  # Set default due date
            self.due_date = self.borrowed_date + timedelta(days=14)
        elif self.due_date <= self.borrowed_date:
            raise ValueError("Due date must be after the borrowed date.")
        
        # Set returned_date if transaction_type is 'return'
        if self.transaction_type == 'return' and not self.returned:
            self.returned = True
            self.returned_date = timezone.now()
        
        self.student_name = self.student.name
        self.librarian_name = self.user.user_name
        self.book_name = self.book.Title
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Transaction {self.transaction_id}"

    def __str__(self):
        return f"Transaction {self.transaction_id}"