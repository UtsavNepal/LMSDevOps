from rest_framework import serializers
from .models import Transaction
from django.utils import timezone
from datetime import datetime, timedelta
from Student.models import Student
from Auth.models import User
from Book.models import Book

class TransactionSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())
    
    student_name = serializers.CharField(source='student.name', read_only=True)
    librarian_name = serializers.CharField(source='user.user_name', read_only=True)
    book_name = serializers.CharField(source='book.Title', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Transaction
        fields = ['transaction_id', 'student', 'user', 'book', 'transaction_type', 'is_overdue','borrowed_date', 'due_date', 'student_name', 'librarian_name', 'book_name']
        read_only_fields = ['student_name', 'librarian_name', 'book_name','is_overdue']

    def validate_due_date(self, value):
        borrowed_date = self.initial_data.get('borrowed_date', timezone.now())
        if isinstance(borrowed_date, str):
            borrowed_date = datetime.strptime(borrowed_date, "%Y-%m-%d")
            borrowed_date = timezone.make_aware(borrowed_date)
        
        if value <= borrowed_date:
            raise serializers.ValidationError("Due date must be after the borrowed date.")
        return value

    def to_internal_value(self, data):
        if 'due_date' in data:
            if data['due_date'] is None:
                borrowed_date = data.get('borrowed_date', timezone.now())
                if isinstance(borrowed_date, str):
                    borrowed_date = datetime.strptime(borrowed_date, "%Y-%m-%d")
                    borrowed_date = timezone.make_aware(borrowed_date)
                data['due_date'] = borrowed_date + timedelta(days=14)  # Default due date is 14 days from borrowed_date
            elif isinstance(data['due_date'], str):
                try:
                    parsed_date = datetime.strptime(data['due_date'], "%Y-%m-%d")
                    data['due_date'] = timezone.make_aware(parsed_date)
                except ValueError:
                    raise serializers.ValidationError({"due_date": "Invalid date format. Use y-m-d"})
        
        return super().to_internal_value(data)