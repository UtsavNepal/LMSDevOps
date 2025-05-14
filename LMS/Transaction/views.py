from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.viewsets import ViewSet



from .tasks import send_overdue_email, send_overdue_notifications

from Transaction.tasks import send_overdue_notifications
from .models import Transaction
from .service import TransactionService
from .serializer import TransactionSerializer
from rest_framework.permissions import AllowAny,IsAuthenticated
import logging

logger = logging.getLogger(__name__)

class TransactionViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = TransactionService()
    
    def list(self, request):
        """Fetch all transactions."""
        logger.info("Fetching all transactions.")
        transactions = self.service.get_all_transactions()
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """Fetch a transaction by its ID."""
        logger.info(f"Fetching transaction with ID: {pk}.")
        transaction = self.service.get_transaction_by_id(pk)
        if transaction:
            serializer = TransactionSerializer(transaction)
            return Response(serializer.data)
        return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)
    
    def create(self, request):
        """Create a new transaction."""
        logger.info(f"Creating transaction with data: {request.data}.")
        serializer = TransactionSerializer(data=request.data)
        if serializer.is_valid():
            try:
                transaction = self.service.create_transaction(serializer.validated_data)
                return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Failed to create transaction: {e}")
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        """Update an existing transaction."""
        logger.info(f"Updating transaction with ID: {pk} and data: {request.data}.")
        serializer = TransactionSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            transaction = self.service.update_transaction(pk, serializer.validated_data)
            if transaction:
                return Response(TransactionSerializer(transaction).data)
            return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, pk=None):
        """Delete a transaction."""
        logger.info(f"Deleting transaction with ID: {pk}.")
        if self.service.delete_transaction(pk):
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)



        
class BookSummaryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        """Fetch the total number of borrowed books, returned books, books, and students."""
        service = TransactionService()
        try:
            total_borrowed = service.get_total_borrowed_books()
            total_returned = service.get_total_returned_books()
            total_books = service.get_total_books()
            total_students = service.get_total_students()
            return Response({
                'total_borrowed_books': total_borrowed,
                'total_returned_books': total_returned,
                'total_books': total_books,
                'total_students': total_students,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
class OverdueBorrowersEmailView(APIView):
    """
    API endpoint for managing overdue borrower email notifications.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all overdue borrowers who haven't returned books"""
        overdue_transactions = Transaction.objects.filter(
            due_date__lt=timezone.now(),
            transaction_type='borrow',
            returned=False  # Now using the new field
        ).select_related('student', 'book')
        
        serializer = TransactionSerializer(overdue_transactions, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Send emails to overdue borrowers immediately.
        """
        send_to_all = request.data.get('send_to_all', True)
        transaction_ids = request.data.get('transaction_ids', [])
        
        if send_to_all:
            # Get all overdue, non-returned transactions
            overdue_transactions = Transaction.objects.filter(
                due_date__lt=timezone.now(),
                transaction_type='borrow',
                returned=False
            ).values_list('transaction_id', flat=True)
            
            transaction_ids = list(overdue_transactions)
            if not transaction_ids:
                return Response(
                    {"message": "No overdue borrowers found"},
                    status=status.HTTP_200_OK
                )
        
        if transaction_ids:
            # Verify all transaction IDs exist and are overdue
            valid_transactions = Transaction.objects.filter(
                transaction_id__in=transaction_ids,
                due_date__lt=timezone.now(),
                transaction_type='borrow',
                returned=False
            ).values_list('transaction_id', flat=True)
            
            invalid_ids = set(transaction_ids) - set(valid_transactions)
            if invalid_ids:
                return Response(
                    {
                        "error": f"Some transactions are not overdue or already returned",
                        "invalid_ids": list(invalid_ids)
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Queue individual emails
            logger.info(f"Queueing emails for transactions: {transaction_ids}")
            for tid in transaction_ids:
                send_overdue_email.delay(tid)
            
            return Response(
                {
                    "message": f"Emails for {len(transaction_ids)} transactions queued",
                    "transaction_ids": transaction_ids
                },
                status=status.HTTP_202_ACCEPTED
            )
        
        return Response(
            {"error": "Must specify either send_to_all=True or provide transaction_ids"},
            status=status.HTTP_400_BAD_REQUEST
        )
        
class TransactionReturnView(APIView):
    """API endpoint for returning books"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Mark a transaction as returned"""
        service = TransactionService()
        try:
            transaction = service.mark_as_returned(pk)
            if transaction:
                serializer = TransactionSerializer(transaction)
                return Response(serializer.data)
            return Response(
                {"error": "Transaction not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )