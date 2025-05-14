from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookSummaryView, OverdueBorrowersEmailView, TransactionReturnView, TransactionViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='Transaction')

urlpatterns = [
    path('', include(router.urls)),
  
    path('book-summary/', BookSummaryView.as_view(), name='book-summary'),
    path('overdue-emails/', OverdueBorrowersEmailView.as_view(), name='overdue-emails'),
    path('transactions/<int:pk>/return/', TransactionReturnView.as_view(), name='return-book'),
]
