from rest_framework import viewsets, status
from rest_framework.response import Response
from .service import StudentService
from .serializer import StudentSerializer
from rest_framework.permissions import AllowAny,IsAuthenticated
class StudentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = StudentService()

    def list(self, request):
        Students = self.service.get_all_Students()
        serializer = StudentSerializer(Students, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        Student = self.service.get_Student_by_id(pk)
        if Student:
            serializer = StudentSerializer(Student)
            return Response(serializer.data)
        return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        
        print("Request Data:", request.data)   
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            Student = self.service.create_Student(serializer.validated_data)
            return Response(StudentSerializer(Student).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        print("Request Data:", request.data)       
        serializer = StudentSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            Student = self.service.update_Student(pk, serializer.validated_data)
            if Student:
                return Response(StudentSerializer(Student).data)
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        if self.service.delete_Student(pk):
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
