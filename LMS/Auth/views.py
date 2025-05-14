from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from Auth.services import UserService
from rest_framework import status, generics, viewsets
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny  
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializer import *
from rest_framework.decorators import action


class LoginView(generics.CreateAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]  # Disable authentication for login view

    def post(self, request):
        service = UserService()
        result = service.login(request.data)
        if not result:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(result)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        return Response({
            "id": str(result.userId),
            "user_name": result.user_name,  # Include username in response
            "access_token": access_token,
            "refresh_token": refresh_token,
        }, status=status.HTTP_200_OK)

class RegisterUserView(APIView):
    permission_classes = [AllowAny]  

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)

        if serializer.is_valid():
        
            service = UserService()
            user = service.register_user(serializer.validated_data)


            user_serializer = UserSerializer(user)

 
            return Response({"message": "User created successfully", "user": user_serializer.data}, status=status.HTTP_201_CREATED)


        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 