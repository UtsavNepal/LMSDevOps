from django.db import models

class Student(models.Model):
    student_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField( )
    contact_number = models.CharField(max_length=15)
    department = models.CharField(max_length=100)

    def __str__(self):
        return self.name
