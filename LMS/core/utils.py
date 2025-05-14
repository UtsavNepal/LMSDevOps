from functools import wraps
from django.http import JsonResponse
import logging

logger = logging.getLogger('Transaction')

def handle_error(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Log function execution
        logger.info(f"Executing function: {func.__name__} with arguments: {args}, {kwargs}")
        
        try:
            result = func(*args, **kwargs)
            
            # Log successful function execution
            logger.info(f"Function {func.__name__} executed successfully")
            
            return result
        except Exception as e:
            # Log error even before returning response
            logger.error(f"An error occurred in function {func.__name__}: {str(e)}")
            return JsonResponse(
                {"error": "An unexpected error occurred", "details": str(e)},
                status=500,
            )
    return wrapper
