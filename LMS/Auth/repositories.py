from  .models import User 
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password, make_password

class UserRepository:
     def create_user(self, user_data):
        # Ensure user_data is a dictionary before modifying it
        user_data["password"] = make_password(user_data["password"])
        
        # Create and return the user
        return User.objects.create(**user_data)
     
     def authenticate_user(self, username, password):
        try:
            # Fetch user by username and check if not deleted
            user = User.objects.get(user_name=username, is_deleted=False)

            # Securely check the password using Django's check_password function
            if check_password(password, user.password):
                return user
        except User.DoesNotExist:
            return None
        
        return None

 