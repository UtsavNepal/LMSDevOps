from rest_framework import serializers
from .models import Book, Author

class BookSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(queryset=Author.objects.all())  # This allows using AuthorId in the request

    class Meta:
        model = Book
        fields = ['BookId', 'Title', 'author', 'Genre', 'ISBN', 'Quantity']
        extra_kwargs = {
            'BookId': {'read_only': True},  # Make BookId read-only like AuthorID in AuthorSerializer
        }

 