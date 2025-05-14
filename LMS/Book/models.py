from django.db import models
from Author.models import Author
class Book(models.Model):
    BookId = models.AutoField(primary_key=True)
    Title = models.CharField(max_length=255)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='books')
    Genre = models.CharField(max_length=100)
    ISBN = models.CharField(max_length=13)
    Quantity = models.IntegerField()

    def __str__(self):
        return self.Title