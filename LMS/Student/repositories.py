from .models import Student

class StudentRepository:
    def __init__(self):
        self.model = Student

    def get_all(self):
        return self.model.objects.all()

    def get_by_id(self, student_id):
        return self.model.objects.filter(student_id=student_id).first()

    def create(self, data):
        return self.model.objects.create(**data)

    def update(self, student_id, data):
        Student = self.get_by_id(student_id)
        if Student:
            for key, value in data.items():
                setattr(Student, key, value)
            Student.save()
        return Student

    def delete(self, student_id):
        Student = self.get_by_id(student_id)
        if Student:
            Student.delete()
            return True
        return False
