from .repositories import AuthorRepository

class AuthorService:
    def __init__(self):
        self.repository = AuthorRepository()

    def get_all_authors(self):
        return self.repository.get_all()

    def get_author_by_id(self, AuthorID):
        return self.repository.get_by_id(AuthorID)

    def create_author(self, data):
        return self.repository.create(data)

    def update_author(self, AuthorID, data):
        return self.repository.update(AuthorID, data)

    def delete_author(self, AuthorID):
        return self.repository.delete(AuthorID)
