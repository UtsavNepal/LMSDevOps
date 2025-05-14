from django.db import models

class Author(models.Model):
    AuthorID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255)
    Bio = models.TextField()
