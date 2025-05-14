from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['student_id', 'name', 'email', 'contact_number', 'department']
        extra_kwargs = {
            'student_id': {'read_only': True},  # Make BookId read-only like AuthorID in AuthorSerializer
        }
