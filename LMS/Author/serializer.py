from rest_framework import serializers
from .models import Author

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['AuthorID', 'Name', 'Bio']  # Include all fields in the output
        extra_kwargs = {
            'AuthorID': {'read_only': True},  # Make AuthorID read-only (not validated)
        }