from .repositories import StudentRepository

class StudentService:
    def __init__(self):
        self.repository = StudentRepository()

    def get_all_Students(self):
        return self.repository.get_all()

    def get_Student_by_id(self, student_id):
        return self.repository.get_by_id(student_id)

    def create_Student(self, data):
        return self.repository.create(data)

    def update_Student(self, student_id, data):
        return self.repository.update(student_id, data)

    def delete_Student(self, student_id):
        return self.repository.delete(student_id)
 