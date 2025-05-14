from .repositories import BookRepository

class BookService:
    def __init__(self):
        self.repository = BookRepository()

    def get_all_Books(self):
        return self.repository.get_all()

    def get_Book_by_id(self, BookId):
        return self.repository.get_by_id(BookId)

    def create_Book(self, data):
        return self.repository.create(data)

    def update_Book(self, BookId, data):
        return self.repository.update(BookId, data)

    def delete_Book(self, BookId):
        return self.repository.delete(BookId)
