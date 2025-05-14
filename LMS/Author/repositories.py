from .models import Author
#repo -> model
class AuthorRepository:
    def __init__(self):
        self.model = Author

    def get_all(self):
        return self.model.objects.all()

    def get_by_id(self, AuthorID):
        return self.model.objects.filter(AuthorID=AuthorID).first()

    def create(self, data):
        return self.model.objects.create(**data)

    def update(self, AuthorID, data):
        author = self.get_by_id(AuthorID)
        if author:
            for key, value in data.items():
                setattr(author, key, value)
            author.save()
        return author

    def delete(self, AuthorID):
        author = self.get_by_id(AuthorID)
        if author:
            author.delete()
            return True
        return False
