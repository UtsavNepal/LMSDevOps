from rest_framework import viewsets, status
from rest_framework.response import Response
from .service import BookService
from .serializer import BookSerializer
from rest_framework.permissions import AllowAny,IsAuthenticated
class BookViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = BookService()

    def list(self, request):
        Books = self.service.get_all_Books()
        serializer = BookSerializer(Books, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        Book = self.service.get_Book_by_id(pk)
        if Book:
            serializer = BookSerializer(Book)
            return Response(serializer.data)
        return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        print("Request Data:", request.data)
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            Book = self.service.create_Book(serializer.validated_data)
            return Response(BookSerializer(Book).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        print("Request Data:", request.data)
        serializer = BookSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            Book = self.service.update_Book(pk, serializer.validated_data)
            if Book:
                return Response(BookSerializer(Book).data)
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        if self.service.delete_Book(pk):
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)
