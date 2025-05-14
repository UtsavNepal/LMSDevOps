import os
import pika
import json
import time
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("email_worker.log")
    ]
)
logger = logging.getLogger("email_worker")

# Email settings
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "healthcaretestkutumba@gmail.com"
EMAIL_HOST_PASSWORD = "yhyn apnz fjlx ktzw"
DEFAULT_FROM_EMAIL = "pradattaaryal11@gmail.com"

# Use environment variable for RabbitMQ URL with fallback
RABBITMQ_URL = os.getenv(
    "RABBITMQ_URL",
    "amqps://defhsify:omnBvSPMX35gPEvr2LscqyuB1FFSbdU2@cougar.rmq.cloudamqp.com/defhsify"
)

PREFETCH_COUNT = 10
MAX_RETRIES = 5
INITIAL_RETRY_DELAY = 5


def send_email_smtp(to_email, subject, message_text):
    """
    Send an email directly using SMTP (no Django dependencies)
    
    Args:
        to_email (str): Recipient email address
        subject (str): Email subject
        message_text (str): Email body
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        logger.info(f"Sending email to {to_email}")
        
        # Create message container
        msg = MIMEMultipart()
        msg['From'] = DEFAULT_FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Attach message body
        msg.attach(MIMEText(message_text, 'plain'))
        
        # Create SMTP session
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()  # Enable TLS
        server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
        
        # Send email
        text = msg.as_string()
        server.sendmail(DEFAULT_FROM_EMAIL, to_email, text)
        server.quit()
        
        logger.info(f"Transaction email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {str(e)}")
        return False


def callback(ch, method, properties, body):
    """
    Process received messages from RabbitMQ
    
    Args:
        ch: Channel object
        method: Method frame
        properties: Properties
        body: Message body
    """
    try:
        logger.info(f"Received message: {body}")
        email_data = json.loads(body)
        email = email_data.get("email")
        subject = email_data.get("subject")
        message = email_data.get("message")

        if email and subject and message:
            success = send_email_smtp(email, subject, message)
            if success:
                # Acknowledge only if email was sent successfully
                ch.basic_ack(delivery_tag=method.delivery_tag)
                logger.info(f"Message acknowledged for {email}")
            else:
                # Negative acknowledgment with requeue if sending failed
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
                logger.warning(f"Message requeued for {email} due to send failure")
        else:
            logger.warning(f"Invalid email data format received: {email_data}")
            # Acknowledge but log warning for invalid format
            ch.basic_ack(delivery_tag=method.delivery_tag)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON format: {e}")
        # Acknowledge but don't requeue invalid messages
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        # Negative acknowledgment with requeue for other errors
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def establish_connection():
    """
    Establish connection to RabbitMQ with retry mechanism
    
    Returns:
        tuple: (connection, channel) or (None, None) if connection fails
    """
    retry_count = 0
    retry_delay = INITIAL_RETRY_DELAY
    
    while retry_count < MAX_RETRIES:
        try:
            logger.info(f"Connecting to RabbitMQ at {RABBITMQ_URL} (attempt {retry_count + 1}/{MAX_RETRIES})")
            # Create connection parameters
            params = pika.URLParameters(RABBITMQ_URL)
            # Set heartbeat interval to detect disconnections
            params.heartbeat = 600
            connection = pika.BlockingConnection(params)
            channel = connection.channel()
            
            # Declare the queue with durability to survive broker restarts
            channel.queue_declare(queue='transaction_email_queue', durable=True)
            
            # Set QoS prefetch count to limit unacknowledged messages
            channel.basic_qos(prefetch_count=PREFETCH_COUNT)
            
            logger.info("Successfully connected to RabbitMQ")
            return connection, channel
            
        except pika.exceptions.AMQPConnectionError as e:
            retry_count += 1
            logger.error(f"Connection to RabbitMQ failed: {str(e)}")
            
            if retry_count < MAX_RETRIES:
                logger.info(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                # Exponential backoff
                retry_delay *= 2
            else:
                logger.error(f"Failed to connect after {MAX_RETRIES} attempts")
                return None, None
                
        except Exception as e:
            logger.error(f"Unexpected error establishing connection: {str(e)}")
            retry_count += 1
            if retry_count < MAX_RETRIES:
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                return None, None


def start_worker():
    """
    Start the email worker service
    """
    while True:
        try:
            # Establish connection
            connection, channel = establish_connection()
            
            if not connection or not channel:
                logger.error("Could not establish connection to RabbitMQ. Waiting before retry...")
                time.sleep(60)  # Wait longer before trying to reconnect
                continue
                
            # Set up consumer
            channel.basic_consume(
                queue='transaction_email_queue', 
                on_message_callback=callback,
                auto_ack=False  # Manual acknowledgment
            )
            
            logger.info("Email worker started, waiting for messages. Press CTRL+C to exit.")
            channel.start_consuming()
            
        except pika.exceptions.ConnectionClosedByBroker:
            # Don't recover if connection was closed by broker
            logger.warning("Connection was closed by broker, stopping...")
            break
            
        except pika.exceptions.AMQPChannelError as e:
            # Don't recover on channel errors
            logger.error(f"Channel error: {str(e)}, stopping...")
            break
            
        except pika.exceptions.AMQPConnectionError:
            # Recover on connection errors
            logger.warning("Connection was lost, attempting to reconnect...")
            time.sleep(5)
            
        except KeyboardInterrupt:
            # Close connection on CTRL+C
            logger.info("Interruption detected, closing connection...")
            if connection and connection.is_open:
                connection.close()
            break
            
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            if connection and connection.is_open:
                connection.close()
            time.sleep(5)


if __name__ == '__main__':
    logger.info("Email worker service starting...")
    start_worker()