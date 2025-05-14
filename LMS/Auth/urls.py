from django.urls import path, include
from rest_framework.routers import DefaultRouter
from  .views import (
    
    LoginView,
    RegisterUserView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Create a router and register the EmployeeViewSet
router = DefaultRouter()
 
urlpatterns = [
    # User authentication endpoints
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterUserView.as_view(), name='register_user'),

    # JWT Token authentication endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Employee-related endpoints handled by the router
    path('', include(router.urls)),  # This will handle all CRUD actions automatically
]
