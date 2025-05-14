from rest_framework import viewsets, status
from rest_framework.response import Response
from .service import AuthorService
from .serializer import AuthorSerializer
from rest_framework.permissions import AllowAny,IsAuthenticated





class AuthorViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = AuthorService()

    def list(self, request):
        authors = self.service.get_all_authors()
        serializer = AuthorSerializer(authors, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        author = self.service.get_author_by_id(pk)
        if author:
            serializer = AuthorSerializer(author)
            return Response(serializer.data)
        return Response({"error": "Author not found"}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        
        serializer = AuthorSerializer(data=request.data)
        if serializer.is_valid():
            author = self.service.create_author(serializer.validated_data)
            return Response(AuthorSerializer(author).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        
        serializer = AuthorSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            author = self.service.update_author(pk, serializer.validated_data)
            if author:
                return Response(AuthorSerializer(author).data)
            return Response({"error": "Author not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        if self.service.delete_author(pk):
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "Author not found"}, status=status.HTTP_404_NOT_FOUND)
