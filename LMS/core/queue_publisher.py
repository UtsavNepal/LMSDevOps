import pika
import json
import logging
import os
from django.conf import settings
from Student.models import Student
from Transaction.models import Transaction

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Use environment variable for RabbitMQ URL
RABBITMQ_URL = os.getenv(
    "RABBITMQ_URL",
    "amqps://defhsify:omnBvSPMX35gPEvr2LscqyuB1FFSbdU2@cougar.rmq.cloudamqp.com/defhsify"
)

def publish_transaction_email(transaction_id):
    try:
        # Fetch transaction details
        transaction = Transaction.objects.select_related("student").get(transaction_id=transaction_id)
        student = transaction.student

        # Prepare email data
        email_data = {
            "email": student.email,
            "subject": "Transaction Completed Successfully",
            "message": f"""
            Hello {student.name},

            Your transaction has been successfully completed.

            Transaction ID: {transaction.transaction_id}
            Book: {transaction.book_name}
            Transaction Type: {transaction.get_transaction_type_display()}
            Date: {transaction.date.strftime('%Y-%m-%d %H:%M:%S')}

            Thank you for using our library system.

            Best Regards,
            Library Team
            """
        }

        # Establish RabbitMQ connection
        params = pika.URLParameters(RABBITMQ_URL)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        channel.queue_declare(queue='transaction_email_queue', durable=True)

        # Publish the message
        channel.basic_publish(
            exchange='',
            routing_key='transaction_email_queue',
            body=json.dumps(email_data),
            properties=pika.BasicProperties(delivery_mode=2)  # Make message persistent
        )

        logger.info(f"Published email task to queue for transaction {transaction_id}")
    except Transaction.DoesNotExist:
        logger.error(f"Transaction not found with transaction_id {transaction_id}")
    except Exception as e:
        logger.error(f"Error publishing message to RabbitMQ: {e}")
    finally:
        if 'connection' in locals() and connection.is_open:
            connection.close()

# Example usage
if __name__ == '__main__':
    publish_transaction_email(transaction_id=456)
