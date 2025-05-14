# tasks.py
from django.utils import timezone
from celery import shared_task
from django.core.mail import send_mail
from .models import Transaction
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_overdue_email(transaction_id):
    transaction = Transaction.objects.get(transaction_id=transaction_id)
    if transaction.is_overdue():
        subject = 'Overdue Book Notification'
        message = f'Dear {transaction.student_name},\n\nYour book "{transaction.book_name}" is overdue. Please return it as soon as possible.\n\nThank you!'
        send_mail(subject, message, 'utsavnepal021@gmail.com', [transaction.student.email])

@shared_task
def send_overdue_notifications():

    try:
        logger.info("Starting overdue notifications task")
        
        overdue_transactions = Transaction.objects.filter(
            due_date__lt=timezone.now(), 
            transaction_type='borrow',     
            notification_sent=False       
        )
        
        logger.info(f"Found {overdue_transactions.count()} overdue transactions")
        
        for transaction in overdue_transactions:
            logger.info(f"Processing transaction ID: {transaction.transaction_id}")
            
            if not transaction.student.email:
                logger.warning(f"No email for student {transaction.student.name}")
                continue
                
            subject = 'Overdue Book Notification'
            message = f'Dear {transaction.student_name},\n\nYour book "{transaction.book_name}" is overdue. Please return it as soon as possible.\n\nThank you!'
            
            logger.info(f"Attempting to send email to {transaction.student.email}")
            
            try:
                send_mail(
                    subject,
                    message,
                    'utsavnepal021@gmail.com',
                    [transaction.student.email],
                    fail_silently=False
                )
                logger.info(f"Email sent successfully to {transaction.student.email}")
                
                # Mark the notification as sent
                transaction.notification_sent = True
                transaction.save()
                
            except Exception as e:
                logger.error(f"Failed to send email: {str(e)}")
                raise
                
        return f"Sent {overdue_transactions.count()} notifications"
        
    except Exception as e:
        logger.error(f"Error in send_overdue_notifications: {str(e)}")
        raise