import logging
from django.core.mail import send_mail
from django.conf import settings
from Student.models import Student
from Transaction.models import Transaction
from Auth.models import User  # Import User model

logger = logging.getLogger(__name__)

# Updated definition of send_transaction_email
def send_transaction_email(transaction_id, user_id):
    try:
        # Fetch transaction details
        transaction = Transaction.objects.get(transaction_id=transaction_id)
        student = Student.objects.get(student_id=transaction.student.student_id)
        librarian = User.objects.get(userId=user_id)

        subject = "Transaction Completed Successfully"
        message = f"Hello {student.name},\n\nYour transaction has been successfully completed.\n\n"
        message += f"Transaction ID: {transaction.transaction_id}\n"
        message += f"Book: {transaction.book_name}\n"
        message += f"Transaction Type: {transaction.get_transaction_type_display()}\n"
        message += f"Date: {transaction.date.strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        message += "Thank you for using our library system.\n\nBest Regards,\nLibrary Team"

        # Send email to both student and librarian
        recipients = [student.email] if student.email else []
        
        # Ensure librarian email is valid before adding
        if librarian.email and isinstance(librarian.email, str) and '@' in librarian.email:
            recipients.append(librarian.email)

        if recipients:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipients,  # Send to both student and librarian
                fail_silently=False,
            )
            logger.info(f"Transaction email sent to {recipients} for transaction ID {transaction_id}")
        else:
            logger.warning(f"No valid recipient emails found for transaction ID {transaction_id}")

    except Transaction.DoesNotExist:
        logger.error(f"Transaction not found with transaction_id {transaction_id}")
    except Student.DoesNotExist:
        logger.error(f"Student not found for transaction ID {transaction_id}")
    except User.DoesNotExist:
        logger.error(f"Librarian not found for user ID {user_id}")
    except Exception as e:
        logger.error(f"Error sending email: {e}")
