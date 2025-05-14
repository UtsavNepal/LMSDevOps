from .models import Book

class BookRepository:
    def __init__(self):
        self.model = Book

    def get_all(self):
        return self.model.objects.all()

    def get_by_id(self, BookId):
        return self.model.objects.filter(BookId=BookId).first()

    def create(self, data):
        return self.model.objects.create(**data)

    def update(self, BookId, data):
        Book = self.get_by_id(BookId)
        if Book:
            for key, value in data.items():
                setattr(Book, key, value)
            Book.save()
        return Book

    def delete(self, BookId):
        Book = self.get_by_id(BookId)
        if Book:
            Book.delete()
            return True
        return False
